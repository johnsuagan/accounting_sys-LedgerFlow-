<?php

namespace App\Services\Accounting\Support;

use App\Exceptions\Accounting\JournalNumberGenerationException;
use App\Models\FiscalYear;
use App\Models\JournalEntrySequence;

class JournalNumberAllocator
{
    /**
     * Must be called within an active database transaction.
     */
    public function allocate(int $companyId, FiscalYear $fiscalYear): string
    {
        $prefix = 'JE-'.$fiscalYear->year;

        $sequence = JournalEntrySequence::query()
            ->where('company_id', $companyId)
            ->where('fiscal_year_id', $fiscalYear->id)
            ->lockForUpdate()
            ->first();

        if ($sequence === null) {
            $sequence = JournalEntrySequence::query()->create([
                'company_id' => $companyId,
                'fiscal_year_id' => $fiscalYear->id,
                'prefix' => $prefix,
                'last_sequence' => 0,
            ]);

            $sequence = JournalEntrySequence::query()
                ->whereKey($sequence->id)
                ->lockForUpdate()
                ->firstOrFail();
        }

        $nextSequence = $sequence->last_sequence + 1;

        $updated = JournalEntrySequence::query()
            ->whereKey($sequence->id)
            ->where('last_sequence', $sequence->last_sequence)
            ->update(['last_sequence' => $nextSequence]);

        if ($updated === 0) {
            throw new JournalNumberGenerationException('Failed to allocate journal entry number. Please retry.');
        }

        return $prefix.'-'.str_pad((string) $nextSequence, 6, '0', STR_PAD_LEFT);
    }
}
