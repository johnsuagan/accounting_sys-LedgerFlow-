<?php

namespace App\Actions\Journal;

use App\Enums\AuditAction;
use App\Enums\JournalEntryStatus;
use App\Exceptions\Accounting\InvalidJournalEntryStateException;
use App\Exceptions\Accounting\UnbalancedJournalEntryException;
use App\Models\JournalEntry;
use App\Repositories\Contracts\JournalEntryRepositoryInterface;
use App\Services\Accounting\Support\JournalAuditDispatcher;
use App\Services\Accounting\Support\JournalNumberAllocator;
use App\Services\Accounting\Support\PeriodGuard;
use Illuminate\Support\Facades\DB;

class PostJournalEntryAction
{
    public function __construct(
        protected JournalEntryRepositoryInterface $journalEntryRepository,
        protected PeriodGuard $periodGuard,
        protected JournalNumberAllocator $numberAllocator,
        protected JournalAuditDispatcher $auditDispatcher,
    ) {}

    public function execute(JournalEntry $entry, int $userId): JournalEntry
    {
        $posted = DB::transaction(function () use ($entry, $userId) {
            /** @var JournalEntry $locked */
            $locked = JournalEntry::query()
                ->whereKey($entry->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status === JournalEntryStatus::Posted) {
                return $locked->load(['lines.account']);
            }

            if ($locked->status !== JournalEntryStatus::Draft) {
                throw new InvalidJournalEntryStateException(
                    "Journal entry {$locked->id} cannot be posted from status {$locked->status->value}."
                );
            }

            $locked->load(['lines.account']);

            $period = $this->periodGuard->assertPostable(
                $locked->company_id,
                $locked->entry_date,
            );

            $locked = $this->journalEntryRepository->recalculateTotals($locked);

            if (! $locked->isBalanced()) {
                throw new UnbalancedJournalEntryException(
                    'Total debits must equal total credits before posting.'
                );
            }

            $entryNumber = $this->numberAllocator->allocate(
                $locked->company_id,
                $period->fiscalYear,
            );

            $locked->update([
                'fiscal_year_id' => $period->fiscalYearId(),
                'accounting_period_id' => $period->accountingPeriodId(),
                'entry_number' => $entryNumber,
                'status' => JournalEntryStatus::Posted,
                'posted_at' => now(),
                'posted_by' => $userId,
                'updated_by' => $userId,
            ]);

            return $locked->fresh(['lines.account']);
        });

        $this->auditDispatcher->dispatch(
            action: AuditAction::Posted,
            auditable: $posted,
            oldValues: ['status' => JournalEntryStatus::Draft->value],
            newValues: [
                'status' => JournalEntryStatus::Posted->value,
                'entry_number' => $posted->entry_number,
                'total_debit' => (string) $posted->total_debit,
                'total_credit' => (string) $posted->total_credit,
                'posted_at' => $posted->posted_at?->toIso8601String(),
            ],
            companyId: $posted->company_id,
            userId: $userId,
        );

        return $posted;
    }
}
