<?php

namespace App\Actions\Journal;

use App\Enums\AuditAction;
use App\Enums\JournalEntrySource;
use App\Enums\JournalEntryStatus;
use App\Exceptions\Accounting\InvalidJournalEntryStateException;
use App\Exceptions\Accounting\UnbalancedJournalEntryException;
use App\Models\JournalEntry;
use App\Repositories\Contracts\JournalEntryRepositoryInterface;
use App\Services\Accounting\Support\JournalAuditDispatcher;
use App\Services\Accounting\Support\JournalNumberAllocator;
use App\Services\Accounting\Support\PeriodGuard;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class ReverseJournalEntryAction
{
    public function __construct(
        protected JournalEntryRepositoryInterface $journalEntryRepository,
        protected PeriodGuard $periodGuard,
        protected JournalNumberAllocator $numberAllocator,
        protected JournalAuditDispatcher $auditDispatcher,
    ) {}

    public function execute(
        JournalEntry $original,
        int $userId,
        ?CarbonInterface $reversalDate = null,
        ?string $reversalReason = null,
    ): JournalEntry {
        $result = DB::transaction(function () use ($original, $userId, $reversalDate, $reversalReason) {
            /** @var JournalEntry $lockedOriginal */
            $lockedOriginal = JournalEntry::query()
                ->whereKey($original->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedOriginal->status === JournalEntryStatus::Reversed && $lockedOriginal->reversed_by_id !== null) {
                return [
                    'original' => $lockedOriginal,
                    'reversal' => JournalEntry::query()
                        ->with(['lines.account'])
                        ->findOrFail($lockedOriginal->reversed_by_id),
                    'idempotent' => true,
                ];
            }

            if ($lockedOriginal->status !== JournalEntryStatus::Posted) {
                throw new InvalidJournalEntryStateException(
                    "Only posted journal entries can be reversed. Current status: {$lockedOriginal->status->value}."
                );
            }

            $lockedOriginal->load(['lines.account']);

            $reversalDate ??= $lockedOriginal->entry_date;

            $period = $this->periodGuard->assertPostable(
                $lockedOriginal->company_id,
                $reversalDate,
            );

            $reversal = JournalEntry::query()->create([
                'company_id' => $lockedOriginal->company_id,
                'fiscal_year_id' => $period->fiscalYearId(),
                'accounting_period_id' => $period->accountingPeriodId(),
                'entry_number' => null,
                'entry_date' => $reversalDate,
                'description' => 'Reversal of '.($lockedOriginal->entry_number ?? "JE-{$lockedOriginal->id}"),
                'reference' => 'REV-'.($lockedOriginal->entry_number ?? $lockedOriginal->id),
                'memo' => $lockedOriginal->memo,
                'status' => JournalEntryStatus::Draft,
                'source' => JournalEntrySource::Reversal,
                'reversal_of_id' => $lockedOriginal->id,
                'reversal_reason' => $reversalReason,
                'created_by' => $userId,
                'updated_by' => $userId,
            ]);

            foreach ($lockedOriginal->lines as $line) {
                $reversal->lines()->create([
                    'account_id' => $line->account_id,
                    'line_number' => $line->line_number,
                    'description' => $line->description,
                    'debit' => $line->credit,
                    'credit' => $line->debit,
                ]);
            }

            $reversal = $this->journalEntryRepository->recalculateTotals(
                $reversal->fresh(['lines.account']),
            );

            if (! $reversal->isBalanced()) {
                throw new UnbalancedJournalEntryException(
                    'Reversal entry is unbalanced after mirroring lines.'
                );
            }

            $entryNumber = $this->numberAllocator->allocate(
                $reversal->company_id,
                $period->fiscalYear,
            );

            $reversal->update([
                'entry_number' => $entryNumber,
                'status' => JournalEntryStatus::Posted,
                'posted_at' => now(),
                'posted_by' => $userId,
                'updated_by' => $userId,
            ]);

            $lockedOriginal->update([
                'status' => JournalEntryStatus::Reversed,
                'reversed_by_id' => $reversal->id,
                'updated_by' => $userId,
            ]);

            return [
                'original' => $lockedOriginal->fresh(),
                'reversal' => $reversal->fresh(['lines.account']),
                'idempotent' => false,
            ];
        });

        if (! $result['idempotent']) {
            $this->auditDispatcher->dispatch(
                action: AuditAction::Reversed,
                auditable: $result['original'],
                oldValues: ['status' => JournalEntryStatus::Posted->value],
                newValues: [
                    'status' => JournalEntryStatus::Reversed->value,
                    'reversed_by_id' => $result['reversal']->id,
                ],
                companyId: $result['original']->company_id,
                userId: $userId,
            );

            $this->auditDispatcher->dispatch(
                action: AuditAction::Posted,
                auditable: $result['reversal'],
                oldValues: null,
                newValues: [
                    'status' => JournalEntryStatus::Posted->value,
                    'entry_number' => $result['reversal']->entry_number,
                    'reversal_of_id' => $result['original']->id,
                    'reversal_reason' => $reversalReason,
                    'total_debit' => (string) $result['reversal']->total_debit,
                    'total_credit' => (string) $result['reversal']->total_credit,
                ],
                companyId: $result['reversal']->company_id,
                userId: $userId,
            );
        }

        return $result['reversal'];
    }
}
