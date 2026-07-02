<?php

namespace App\Actions\Journal;

use App\Enums\AuditAction;
use App\Enums\JournalEntryStatus;
use App\Exceptions\Accounting\InvalidJournalEntryStateException;
use App\Models\JournalEntry;
use App\Services\Accounting\Support\JournalAuditDispatcher;
use Illuminate\Support\Facades\DB;

class CancelJournalEntryAction
{
    public function __construct(
        protected JournalAuditDispatcher $auditDispatcher,
    ) {}

    public function execute(JournalEntry $entry, int $userId): JournalEntry
    {
        $cancelled = DB::transaction(function () use ($entry, $userId) {
            /** @var JournalEntry $locked */
            $locked = JournalEntry::query()
                ->whereKey($entry->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status === JournalEntryStatus::Cancelled) {
                return $locked->load(['lines.account']);
            }

            if ($locked->status !== JournalEntryStatus::Draft) {
                throw new InvalidJournalEntryStateException(
                    "Only draft journal entries can be cancelled. Current status: {$locked->status->value}."
                );
            }

            $locked->update([
                'status' => JournalEntryStatus::Cancelled,
                'cancelled_at' => now(),
                'cancelled_by' => $userId,
                'updated_by' => $userId,
            ]);

            return $locked->fresh(['lines.account']);
        });

        $this->auditDispatcher->dispatch(
            action: AuditAction::Cancelled,
            auditable: $cancelled,
            oldValues: ['status' => JournalEntryStatus::Draft->value],
            newValues: [
                'status' => JournalEntryStatus::Cancelled->value,
                'cancelled_at' => $cancelled->cancelled_at?->toIso8601String(),
            ],
            companyId: $cancelled->company_id,
            userId: $userId,
        );

        return $cancelled;
    }
}
