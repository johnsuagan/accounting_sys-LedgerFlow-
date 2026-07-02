<?php

namespace App\Services\Accounting;

use App\Enums\NormalBalance;
use App\Enums\JournalEntryStatus;
use App\Models\Account;
use App\Models\JournalEntryLine;
use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Services\Accounting\Support\GeneralLedgerAccountSummary;
use App\Services\Accounting\Support\GeneralLedgerLine;
use App\Services\Accounting\Support\GeneralLedgerQuery;
use App\Services\Accounting\Support\GeneralLedgerResult;
use App\Support\LedgerImpact;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class GeneralLedgerService
{
    public function __construct(
        protected AccountRepositoryInterface $accountRepository,
    ) {}

    public function ledgerForAccount(
        Account $account,
        CarbonInterface $dateFrom,
        CarbonInterface $dateTo,
        ?int $fiscalYearId = null,
        bool $includeDescendants = false,
    ): GeneralLedgerResult {
        $accountIds = $this->resolveAccountIds($account, $includeDescendants);

        $query = GeneralLedgerQuery::forAccount(
            companyId: (int) $account->company_id,
            accountId: $account->id,
            dateFrom: $dateFrom,
            dateTo: $dateTo,
            fiscalYearId: $fiscalYearId,
            includeDescendants: $includeDescendants,
        )->withAccountIds($accountIds);

        return $this->generate($account, $query);
    }

    /**
     * Generate a ledger from an explicit query (supports future roll-up extensions).
     */
    public function generate(Account $account, GeneralLedgerQuery $query): GeneralLedgerResult
    {
        $normalBalance = $account->normal_balance;

        $openingBalance = $this->calculateBalanceBefore(
            $query,
            $normalBalance,
            $query->dateFrom,
        );

        $rawLines = $this->fetchLedgerLines($query);
        $periodLines = $this->buildPeriodLines($rawLines, $normalBalance, $openingBalance);

        $openingPresentation = $this->presentBalance($openingBalance, $normalBalance);

        $lines = [
            new GeneralLedgerLine(
                date: null,
                entryNumber: 'Opening',
                reference: null,
                description: 'Opening balance',
                debit: '0.0000',
                credit: '0.0000',
                runningBalance: $openingBalance,
                balanceAmount: $openingPresentation['balance_amount'],
                balanceSide: $openingPresentation['balance_side'],
                isOpeningBalance: true,
            ),
            ...$periodLines,
        ];

        $totalDebit = $this->sumColumn($periodLines, 'debit');
        $totalCredit = $this->sumColumn($periodLines, 'credit');

        $closingBalance = $periodLines === []
            ? $openingBalance
            : end($periodLines)->runningBalance;

        $closingPresentation = $this->presentBalance($closingBalance, $normalBalance);
        $openingPresentation = $this->presentBalance($openingBalance, $normalBalance);

        return new GeneralLedgerResult(
            account: $this->summarizeAccount($account, $query->includeDescendants),
            lines: $lines,
            openingBalance: $openingBalance,
            openingBalanceAmount: $openingPresentation['balance_amount'],
            openingBalanceSide: $openingPresentation['balance_side'],
            closingBalance: $closingBalance,
            closingBalanceAmount: $closingPresentation['balance_amount'],
            closingBalanceSide: $closingPresentation['balance_side'],
            totalDebit: $totalDebit,
            totalCredit: $totalCredit,
            filters: [
                'account_id' => $account->id,
                'date_from' => $query->dateFrom->toDateString(),
                'date_to' => $query->dateTo->toDateString(),
                'fiscal_year_id' => $query->fiscalYearId,
                'include_descendants' => $query->includeDescendants,
            ],
            includesDescendants: $query->includeDescendants,
        );
    }

    /**
     * @return list<int>
     */
    public function resolveAccountIds(Account $account, bool $includeDescendants): array
    {
        if (! $includeDescendants) {
            return [$account->id];
        }

        return array_values(array_unique(array_merge(
            [$account->id],
            $this->accountRepository->getDescendantIds($account),
        )));
    }

    protected function summarizeAccount(Account $account, bool $rollupEnabled): GeneralLedgerAccountSummary
    {
        return new GeneralLedgerAccountSummary(
            id: $account->id,
            accountCode: $account->account_code,
            accountName: $account->account_name,
            accountType: $account->account_type->value,
            normalBalance: $account->normal_balance->value,
            isHeader: $account->is_header,
            rollupEnabled: $rollupEnabled,
        );
    }

    /**
     * @return Collection<int, JournalEntryLine>
     */
    protected function fetchLedgerLines(GeneralLedgerQuery $query): Collection
    {
        return JournalEntryLine::query()
            ->whereIn('journal_entry_lines.account_id', $query->accountIds)
            ->whereHas('journalEntry', function (Builder $entryQuery) use ($query): void {
                $this->applyEntryFilters($entryQuery, $query, $query->dateFrom->toDateString(), $query->dateTo->toDateString());
            })
            ->with(['journalEntry:id,entry_number,reference,description,entry_date,status,source'])
            ->join('journal_entries', 'journal_entries.id', '=', 'journal_entry_lines.journal_entry_id')
            ->orderBy('journal_entries.entry_date')
            ->orderBy('journal_entries.id')
            ->orderBy('journal_entry_lines.line_number')
            ->select('journal_entry_lines.*')
            ->get();
    }

    protected function calculateBalanceBefore(
        GeneralLedgerQuery $query,
        NormalBalance $normalBalance,
        CarbonInterface $beforeDate,
    ): string {
        $lines = JournalEntryLine::query()
            ->select('journal_entry_lines.debit', 'journal_entry_lines.credit')
            ->whereIn('journal_entry_lines.account_id', $query->accountIds)
            ->whereHas('journalEntry', function (Builder $entryQuery) use ($query, $beforeDate): void {
                $this->applyEntryFilters($entryQuery, $query, null, $beforeDate->toDateString(), beforeDate: true);
            })
            ->get();

        $balance = '0.0000';

        foreach ($lines as $line) {
            $balance = bcadd(
                $balance,
                $this->signedMovement($normalBalance, (string) $line->debit, (string) $line->credit),
                4,
            );
        }

        return $balance;
    }

    /**
     * @param  Collection<int, JournalEntryLine>  $rawLines
     * @return list<GeneralLedgerLine>
     */
    protected function buildPeriodLines(Collection $rawLines, NormalBalance $normalBalance, string $openingBalance): array
    {
        $runningBalance = $openingBalance;
        $lines = [];

        foreach ($rawLines as $line) {
            $debit = (string) $line->debit;
            $credit = (string) $line->credit;

            $runningBalance = bcadd(
                $runningBalance,
                $this->signedMovement($normalBalance, $debit, $credit),
                4,
            );

            $presentation = $this->presentBalance($runningBalance, $normalBalance);
            $journalEntry = $line->journalEntry;

            $lines[] = new GeneralLedgerLine(
                date: $journalEntry?->entry_date?->toDateString(),
                entryNumber: $journalEntry?->entry_number,
                reference: $journalEntry?->reference,
                description: $line->description ?: ($journalEntry?->description ?? ''),
                debit: $debit,
                credit: $credit,
                runningBalance: $runningBalance,
                balanceAmount: $presentation['balance_amount'],
                balanceSide: $presentation['balance_side'],
                journalEntryId: $journalEntry?->id,
                journalEntryLineId: $line->id,
            );
        }

        return $lines;
    }

    protected function signedMovement(NormalBalance $normalBalance, string $debit, string $credit): string
    {
        return $normalBalance === NormalBalance::Debit
            ? bcsub($debit, $credit, 4)
            : bcsub($credit, $debit, 4);
    }

    /**
     * @return array{balance_amount: string, balance_side: string}
     */
    protected function presentBalance(string $signedBalance, NormalBalance $normalBalance): array
    {
        $isNegative = bccomp($signedBalance, '0', 4) === -1;
        $naturalSide = $normalBalance === NormalBalance::Debit ? 'DR' : 'CR';
        $balanceSide = $isNegative ? ($naturalSide === 'DR' ? 'CR' : 'DR') : $naturalSide;
        $balanceAmount = $isNegative ? bcmul($signedBalance, '-1', 4) : $signedBalance;

        return [
            'balance_amount' => $balanceAmount,
            'balance_side' => $balanceSide,
        ];
    }

    /**
     * @param  list<GeneralLedgerLine>  $lines
     */
    protected function sumColumn(array $lines, string $column): string
    {
        $total = '0.0000';

        foreach ($lines as $line) {
            $value = $column === 'debit' ? $line->debit : $line->credit;
            $total = bcadd($total, $value, 4);
        }

        return $total;
    }

    protected function applyEntryFilters(
        Builder $entryQuery,
        GeneralLedgerQuery $query,
        ?string $dateFrom,
        ?string $dateTo,
        bool $beforeDate = false,
    ): void {
        $entryQuery
            ->where('company_id', $query->companyId)
            ->whereIn('status', array_map(
                fn (JournalEntryStatus $status) => $status->value,
                LedgerImpact::impactingStatuses(),
            ));

        if ($query->fiscalYearId !== null) {
            $entryQuery->where('fiscal_year_id', $query->fiscalYearId);
        }

        if ($beforeDate && $dateTo !== null) {
            $entryQuery->where('entry_date', '<', $dateTo);

            return;
        }

        if ($dateFrom !== null && $dateTo !== null) {
            $entryQuery->whereBetween('entry_date', [$dateFrom, $dateTo]);
        }
    }
}
