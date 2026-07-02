<?php

namespace App\Repositories\Contracts;

use App\Models\JournalEntry;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface JournalEntryRepositoryInterface
{
    public function find(int $id): ?JournalEntry;

    public function findOrFail(int $id): JournalEntry;

    public function findByEntryNumber(int $companyId, string $entryNumber): ?JournalEntry;

    public function paginateForCompany(int $companyId, int $perPage = 25): LengthAwarePaginator;

    public function createWithLines(array $attributes, array $lines): JournalEntry;

    public function updateWithLines(JournalEntry $journalEntry, array $attributes, array $lines): JournalEntry;

    public function syncLines(JournalEntry $journalEntry, array $lines): JournalEntry;

    public function recalculateTotals(JournalEntry $journalEntry): JournalEntry;
}
