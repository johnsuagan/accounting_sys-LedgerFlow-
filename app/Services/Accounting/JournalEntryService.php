<?php

namespace App\Services\Accounting;

use App\Actions\Journal\CancelJournalEntryAction;
use App\Actions\Journal\PostJournalEntryAction;
use App\Actions\Journal\ReverseJournalEntryAction;
use App\Enums\AuditAction;
use App\Enums\JournalEntrySource;
use App\Enums\JournalEntryStatus;
use App\Exceptions\Accounting\CompanyAccessDeniedException;
use App\Exceptions\Accounting\CompanyContextMissingException;
use App\Exceptions\Accounting\InvalidJournalEntryStateException;
use App\Exceptions\Accounting\InvalidJournalLineException;
use App\Exceptions\Accounting\InvalidPostingAccountException;
use App\Exceptions\Accounting\PeriodMismatchException;
use App\Exceptions\Accounting\UnbalancedJournalEntryException;
use App\Models\Account;
use App\Models\JournalEntry;
use App\Models\User;
use App\Repositories\Contracts\JournalEntryRepositoryInterface;
use App\Services\Accounting\Support\JournalAuditDispatcher;
use App\Services\Accounting\Support\PeriodContext;
use App\Services\Accounting\Support\PeriodGuard;
use App\Support\CompanyContext;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Auth;

class JournalEntryService
{
    public function __construct(
        protected JournalEntryRepositoryInterface $journalEntryRepository,
        protected PeriodGuard $periodGuard,
        protected PostJournalEntryAction $postJournalEntryAction,
        protected ReverseJournalEntryAction $reverseJournalEntryAction,
        protected CancelJournalEntryAction $cancelJournalEntryAction,
        protected JournalAuditDispatcher $auditDispatcher,
    ) {}

    /**
     * @param  array<string, mixed>  $header
     * @param  list<array<string, mixed>>  $lines
     */
    public function createDraft(array $header, array $lines, ?int $userId = null): JournalEntry
    {
        $userId ??= $this->resolveUserId();
        $companyId = (int) $header['company_id'];

        $this->assertCompanyAccess($companyId);

        $period = $this->periodGuard->resolve($companyId, $header['entry_date']);

        $entry = $this->journalEntryRepository->createWithLines(
            [
                'company_id' => $companyId,
                'fiscal_year_id' => $period->fiscalYearId(),
                'accounting_period_id' => $period->accountingPeriodId(),
                'entry_number' => null,
                'entry_date' => $header['entry_date'],
                'description' => $header['description'],
                'reference' => $header['reference'] ?? null,
                'memo' => $header['memo'] ?? null,
                'status' => JournalEntryStatus::Draft,
                'source' => $header['source'] ?? JournalEntrySource::Manual,
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            $lines,
        );

        if ($lines !== []) {
            $this->validateLines($entry, strict: false);
        }

        $this->auditDispatcher->dispatch(
            action: AuditAction::Created,
            auditable: $entry,
            newValues: [
                'status' => JournalEntryStatus::Draft->value,
                'entry_date' => $entry->entry_date->toDateString(),
                'line_count' => $entry->lines->count(),
            ],
            companyId: $entry->company_id,
            userId: $userId,
        );

        return $entry;
    }

    /**
     * @param  array<string, mixed>  $header
     * @param  list<array<string, mixed>>  $lines
     */
    public function updateDraft(JournalEntry $entry, array $header, array $lines, ?int $userId = null): JournalEntry
    {
        $userId ??= $this->resolveUserId();

        $this->assertDraftEditable($entry);
        $this->assertCompanyScope($entry);

        $period = $this->periodGuard->resolve(
            $entry->company_id,
            $header['entry_date'] ?? $entry->entry_date,
        );

        $oldValues = [
            'description' => $entry->description,
            'entry_date' => $entry->entry_date->toDateString(),
        ];

        $updated = $this->journalEntryRepository->updateWithLines(
            $entry,
            [
                'fiscal_year_id' => $period->fiscalYearId(),
                'accounting_period_id' => $period->accountingPeriodId(),
                'entry_date' => $header['entry_date'] ?? $entry->entry_date,
                'description' => $header['description'] ?? $entry->description,
                'reference' => $header['reference'] ?? $entry->reference,
                'memo' => $header['memo'] ?? $entry->memo,
                'updated_by' => $userId,
            ],
            $lines,
        );

        $this->validateLines($updated, strict: false);

        $this->auditDispatcher->dispatch(
            action: AuditAction::Updated,
            auditable: $updated,
            oldValues: $oldValues,
            newValues: [
                'description' => $updated->description,
                'entry_date' => $updated->entry_date->toDateString(),
                'line_count' => $updated->lines->count(),
            ],
            companyId: $updated->company_id,
            userId: $userId,
        );

        return $updated;
    }

    public function deleteDraft(JournalEntry $entry, ?int $userId = null): void
    {
        $userId ??= $this->resolveUserId();

        $this->assertDraftEditable($entry);
        $this->assertCompanyScope($entry);

        $entry->delete();

        $this->auditDispatcher->dispatch(
            action: AuditAction::Deleted,
            auditable: $entry,
            oldValues: ['status' => JournalEntryStatus::Draft->value],
            companyId: $entry->company_id,
            userId: $userId,
        );
    }

    public function post(JournalEntry $entry, ?int $userId = null): JournalEntry
    {
        $userId ??= $this->resolveUserId();

        $this->assertCompanyScope($entry);

        $entry = $entry->fresh(['lines.account']) ?? $entry;

        if ($entry->status === JournalEntryStatus::Posted) {
            return $entry;
        }

        $this->assertPostable($entry);

        return $this->postJournalEntryAction->execute($entry, $userId);
    }

    public function cancel(JournalEntry $entry, ?int $userId = null): JournalEntry
    {
        $userId ??= $this->resolveUserId();

        $this->assertCompanyScope($entry);

        $entry = $entry->fresh(['lines.account']) ?? $entry;

        if ($entry->status === JournalEntryStatus::Cancelled) {
            return $entry;
        }

        $this->assertDraftEditable($entry);

        return $this->cancelJournalEntryAction->execute($entry, $userId);
    }

    public function reverse(
        JournalEntry $entry,
        ?CarbonInterface $reversalDate = null,
        ?string $reversalReason = null,
        ?int $userId = null,
    ): JournalEntry {
        $userId ??= $this->resolveUserId();

        $this->assertCompanyScope($entry);

        $entry = $entry->fresh(['lines.account']) ?? $entry;

        if ($entry->status === JournalEntryStatus::Reversed && $entry->reversed_by_id !== null) {
            return $this->journalEntryRepository->findOrFail($entry->reversed_by_id);
        }

        if ($entry->status !== JournalEntryStatus::Posted) {
            throw new InvalidJournalEntryStateException('Only posted journal entries can be reversed.');
        }

        $reversalDate ??= $entry->entry_date;
        $this->periodGuard->assertPostable($entry->company_id, $reversalDate);

        return $this->reverseJournalEntryAction->execute(
            $entry,
            $userId,
            $reversalDate,
            $reversalReason,
        );
    }

    public function assertPostable(JournalEntry $entry): void
    {
        $this->assertDraftEditable($entry);
        $this->assertCompanyScope($entry);
        $this->periodGuard->assertPostable($entry->company_id, $entry->entry_date);
        $this->validateLines($entry->fresh(['lines.account']), strict: true);
    }

    public function assertDraftEditable(JournalEntry $entry): void
    {
        if ($entry->status !== JournalEntryStatus::Draft) {
            throw new InvalidJournalEntryStateException(
                "Journal entry {$entry->id} is not editable in status {$entry->status->value}."
            );
        }
    }

    public function resolvePeriod(int $companyId, CarbonInterface $entryDate): PeriodContext
    {
        return $this->periodGuard->resolve($companyId, $entryDate);
    }

    public function validateLines(JournalEntry $entry, bool $strict): void
    {
        $entry->loadMissing('lines.account');
        $lines = $entry->lines;

        if ($strict && $lines->count() < 2) {
            throw new InvalidJournalLineException('A journal entry must contain at least two lines.');
        }

        if ($lines->isEmpty()) {
            return;
        }

        $totalDebit = '0';
        $totalCredit = '0';

        foreach ($lines as $index => $line) {
            $debit = (string) $line->debit;
            $credit = (string) $line->credit;
            $hasDebit = bccomp($debit, '0', 4) === 1;
            $hasCredit = bccomp($credit, '0', 4) === 1;

            if ($strict) {
                if ($hasDebit && $hasCredit) {
                    throw new InvalidJournalLineException('Line '.($index + 1).' cannot contain both a debit and a credit.');
                }

                if (! $hasDebit && ! $hasCredit) {
                    throw new InvalidJournalLineException('Line '.($index + 1).' must contain either a debit or a credit.');
                }
            }

            if (bccomp($debit, '0', 4) === -1 || bccomp($credit, '0', 4) === -1) {
                throw new InvalidJournalLineException('Line '.($index + 1).' amounts cannot be negative.');
            }

            $account = $line->account;

            if (! $account instanceof Account) {
                throw new InvalidPostingAccountException('Line '.($index + 1).' references an invalid account.');
            }

            $this->assertAccountPostable($account, $entry->company_id, $index + 1, $strict);

            $totalDebit = bcadd($totalDebit, $debit, 4);
            $totalCredit = bcadd($totalCredit, $credit, 4);
        }

        if ($strict && bccomp($totalDebit, $totalCredit, 4) !== 0) {
            throw new UnbalancedJournalEntryException('Total debits must equal total credits.');
        }

        if ($strict && bccomp($totalDebit, '0', 4) !== 1) {
            throw new UnbalancedJournalEntryException('Journal entry total must be greater than zero.');
        }
    }

    public function validateCompanyScope(JournalEntry $entry): void
    {
        $this->assertCompanyScope($entry);
    }

    protected function assertCompanyScope(JournalEntry $entry): void
    {
        $contextCompanyId = CompanyContext::id();

        if ($contextCompanyId === null) {
            throw new CompanyContextMissingException('Company context is not set.');
        }

        if ((int) $entry->company_id !== (int) $contextCompanyId) {
            throw new CompanyAccessDeniedException('Journal entry does not belong to the active company.');
        }

        $user = Auth::user();

        if ($user instanceof User && ! $user->belongsToCompany($entry->company_id)) {
            throw new CompanyAccessDeniedException('You do not have access to this company.');
        }

        if ($entry->fiscal_year_id !== null) {
            $entry->loadMissing('fiscalYear');

            if ($entry->fiscalYear !== null && (int) $entry->fiscalYear->company_id !== (int) $entry->company_id) {
                throw new PeriodMismatchException('Fiscal year does not belong to this company.');
            }
        }

        if ($entry->accounting_period_id !== null) {
            $entry->loadMissing('accountingPeriod');

            if ($entry->accountingPeriod !== null
                && (int) $entry->accountingPeriod->company_id !== (int) $entry->company_id) {
                throw new PeriodMismatchException('Accounting period does not belong to this company.');
            }
        }
    }

    protected function assertCompanyAccess(int $companyId): void
    {
        $contextCompanyId = CompanyContext::id();

        if ($contextCompanyId === null) {
            throw new CompanyContextMissingException('Company context is not set.');
        }

        if ($companyId !== (int) $contextCompanyId) {
            throw new CompanyAccessDeniedException('Company ID does not match the active company context.');
        }

        $user = Auth::user();

        if ($user instanceof User && ! $user->belongsToCompany($companyId)) {
            throw new CompanyAccessDeniedException('You do not have access to this company.');
        }
    }

    protected function assertAccountPostable(Account $account, int $companyId, int $lineNumber, bool $strict): void
    {
        if ((int) $account->company_id !== $companyId) {
            throw new InvalidPostingAccountException(
                "Line {$lineNumber}: account does not belong to this company."
            );
        }

        if ($strict && $account->is_header) {
            throw new InvalidPostingAccountException(
                "Line {$lineNumber}: cannot post to header account {$account->account_code}."
            );
        }

        if ($strict && ! $account->is_active) {
            throw new InvalidPostingAccountException(
                "Line {$lineNumber}: account {$account->account_code} is inactive."
            );
        }
    }

    protected function resolveUserId(): int
    {
        $userId = Auth::id();

        if ($userId === null) {
            throw new CompanyAccessDeniedException('Authenticated user is required.');
        }

        return (int) $userId;
    }
}
