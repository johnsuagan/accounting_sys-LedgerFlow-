<?php

namespace App\Support;

use App\Enums\JournalEntryStatus;
use App\Models\JournalEntry;
use Illuminate\Database\Eloquent\Builder;

/**
 * Defines which journal entry statuses contribute to ledger / trial balance / financial statements.
 *
 * - draft: no impact
 * - cancelled: no impact
 * - posted: impacts ledger
 * - reversed: original entry still impacts historical ledger activity
 * - reversal entry (posted, source=reversal): offsets the original
 */
class LedgerImpact
{
    /**
     * Statuses whose lines are included in ledger projections.
     *
     * @return list<JournalEntryStatus>
     */
    public static function impactingStatuses(): array
    {
        return [
            JournalEntryStatus::Posted,
            JournalEntryStatus::Reversed,
        ];
    }

    public static function impactsLedger(JournalEntry $entry): bool
    {
        return in_array($entry->status, self::impactingStatuses(), true);
    }

    public static function scope(Builder $query): Builder
    {
        return $query->whereIn('status', array_map(
            fn (JournalEntryStatus $status) => $status->value,
            self::impactingStatuses(),
        ));
    }
}
