<?php

namespace App\Repositories\Eloquent;

use App\Models\JournalEntry;
use App\Repositories\Contracts\JournalEntryRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class JournalEntryRepository implements JournalEntryRepositoryInterface
{
    public function find(int $id): ?JournalEntry
    {
        return JournalEntry::query()->with('lines.account')->find($id);
    }

    public function findOrFail(int $id): JournalEntry
    {
        return JournalEntry::query()->with('lines.account')->findOrFail($id);
    }

    public function findByEntryNumber(int $companyId, string $entryNumber): ?JournalEntry
    {
        return JournalEntry::query()
            ->where('company_id', $companyId)
            ->where('entry_number', $entryNumber)
            ->first();
    }

    public function paginateForCompany(int $companyId, int $perPage = 25): LengthAwarePaginator
    {
        return JournalEntry::query()
            ->where('company_id', $companyId)
            ->withCount('lines')
            ->orderByDesc('entry_date')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function createWithLines(array $attributes, array $lines): JournalEntry
    {
        return DB::transaction(function () use ($attributes, $lines) {
            $journalEntry = JournalEntry::query()->create($attributes);
            $this->syncLines($journalEntry, $lines);

            return $this->recalculateTotals($journalEntry->fresh(['lines.account']));
        });
    }

    public function updateWithLines(JournalEntry $journalEntry, array $attributes, array $lines): JournalEntry
    {
        return DB::transaction(function () use ($journalEntry, $attributes, $lines) {
            $journalEntry->update($attributes);
            $this->syncLines($journalEntry, $lines);

            return $this->recalculateTotals($journalEntry->fresh(['lines.account']));
        });
    }

    public function syncLines(JournalEntry $journalEntry, array $lines): JournalEntry
    {
        $journalEntry->lines()->delete();

        foreach ($lines as $line) {
            $journalEntry->lines()->create([
                'account_id' => $line['account_id'],
                'line_number' => $line['line_number'],
                'description' => $line['description'] ?? null,
                'debit' => $line['debit'] ?? 0,
                'credit' => $line['credit'] ?? 0,
            ]);
        }

        return $journalEntry->fresh(['lines.account']);
    }

    public function recalculateTotals(JournalEntry $journalEntry): JournalEntry
    {
        $journalEntry->loadMissing('lines');

        $totalDebit = '0';
        $totalCredit = '0';

        foreach ($journalEntry->lines as $line) {
            $totalDebit = bcadd($totalDebit, (string) $line->debit, 4);
            $totalCredit = bcadd($totalCredit, (string) $line->credit, 4);
        }

        $journalEntry->update([
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
        ]);

        return $journalEntry->fresh(['lines.account']);
    }
}
