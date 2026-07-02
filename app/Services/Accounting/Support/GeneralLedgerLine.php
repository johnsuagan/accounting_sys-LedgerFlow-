<?php

namespace App\Services\Accounting\Support;

final class GeneralLedgerLine
{
    public function __construct(
        public readonly ?string $date,
        public readonly ?string $entryNumber,
        public readonly ?string $reference,
        public readonly string $description,
        public readonly string $debit,
        public readonly string $credit,
        public readonly string $runningBalance,
        public readonly string $balanceAmount,
        public readonly string $balanceSide,
        public readonly ?int $journalEntryId = null,
        public readonly ?int $journalEntryLineId = null,
        public readonly bool $isOpeningBalance = false,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'date' => $this->date,
            'entry_number' => $this->entryNumber,
            'reference' => $this->reference,
            'description' => $this->description,
            'debit' => $this->debit,
            'credit' => $this->credit,
            'running_balance' => $this->runningBalance,
            'balance_amount' => $this->balanceAmount,
            'balance_side' => $this->balanceSide,
            'journal_entry_id' => $this->journalEntryId,
            'journal_entry_line_id' => $this->journalEntryLineId,
            'is_opening_balance' => $this->isOpeningBalance,
        ];
    }
}
