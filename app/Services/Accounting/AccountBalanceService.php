<?php

namespace App\Services\Accounting;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Enums\JournalEntryStatus;
use App\Enums\NormalBalance;
use App\Models\Account;
use App\Models\JournalEntryLine;
use App\Services\Accounting\Support\BalancePresentation;
use App\Support\LedgerImpact;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AccountBalanceService
{
    /**
     * @param  list<int>  $accountIds
     */
    public function signedBalanceForAccounts(
        array $accountIds,
        int $companyId,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId = null,
    ): string {
        if ($accountIds === []) {
            return '0.0000';
        }

        $lines = JournalEntryLine::query()
            ->select('journal_entry_lines.debit', 'journal_entry_lines.credit', 'accounts.normal_balance')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->whereIn('journal_entry_lines.account_id', $accountIds)
            ->whereHas('journalEntry', function (Builder $entryQuery) use ($companyId, $asOfDate, $fiscalYearId): void {
                $this->applyEntryFilters($entryQuery, $companyId, $asOfDate, $fiscalYearId);
            })
            ->get();

        $balance = '0.0000';

        foreach ($lines as $line) {
            $normalBalance = $line->normal_balance instanceof NormalBalance
                ? $line->normal_balance
                : NormalBalance::from($line->normal_balance);

            $balance = bcadd(
                $balance,
                BalancePresentation::signedMovement(
                    $normalBalance,
                    (string) $line->debit,
                    (string) $line->credit,
                ),
                4,
            );
        }

        return $balance;
    }

    public function balanceForAccount(
        Account $account,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId = null,
    ): array {
        $signedBalance = $this->signedBalanceForAccounts(
            [$account->id],
            (int) $account->company_id,
            $asOfDate,
            $fiscalYearId,
        );

        $presentation = BalancePresentation::present($signedBalance, $account->normal_balance);

        return [
            'signed_balance' => $signedBalance,
            ...$presentation,
        ];
    }

    /**
     * @return Collection<int, Account>
     */
    public function postableAccountsWithActivity(int $companyId, CarbonInterface $asOfDate, ?int $fiscalYearId = null): Collection
    {
        return Account::query()
            ->where('company_id', $companyId)
            ->postable()
            ->whereHas('journalEntryLines', function (Builder $lineQuery) use ($companyId, $asOfDate, $fiscalYearId): void {
                $lineQuery->whereHas('journalEntry', function (Builder $entryQuery) use ($companyId, $asOfDate, $fiscalYearId): void {
                    $this->applyEntryFilters($entryQuery, $companyId, $asOfDate, $fiscalYearId);
                });
            })
            ->orderBy('account_code')
            ->get();
    }

    public function totalByAccountType(
        int $companyId,
        AccountType $accountType,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId = null,
    ): string {
        $accounts = Account::query()
            ->where('company_id', $companyId)
            ->where('account_type', $accountType)
            ->postable()
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if ($accounts === []) {
            return '0.0000';
        }

        $total = '0.0000';

        foreach ($accounts as $accountId) {
            $account = Account::query()->find($accountId);

            if ($account === null) {
                continue;
            }

            $signed = $this->signedBalanceForAccounts(
                [$accountId],
                $companyId,
                $asOfDate,
                $fiscalYearId,
            );

            $presentation = BalancePresentation::present($signed, $account->normal_balance);
            $total = bcadd($total, $presentation['balance_amount'], 4);
        }

        return $total;
    }

    public function totalBySubtype(
        int $companyId,
        AccountSubtype $accountSubtype,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId = null,
    ): string {
        $accounts = Account::query()
            ->where('company_id', $companyId)
            ->where('account_subtype', $accountSubtype)
            ->postable()
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        return $this->totalPresentationForAccounts($accounts, $companyId, $asOfDate, $fiscalYearId);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function summariesForPostableAccounts(
        int $companyId,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId = null,
        bool $withZeroBalances = false,
    ): array {
        $accounts = Account::query()
            ->where('company_id', $companyId)
            ->postable()
            ->orderBy('account_code')
            ->get();

        $summaries = [];

        foreach ($accounts as $account) {
            $balance = $this->balanceForAccount($account, $asOfDate, $fiscalYearId);

            if (! $withZeroBalances && bccomp($balance['balance_amount'], '0', 4) === 0) {
                continue;
            }

            $summaries[] = [
                'account_id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type->value,
                'account_subtype' => $account->account_subtype->value,
                'normal_balance' => $account->normal_balance->value,
                'balance_amount' => $balance['balance_amount'],
                'balance_side' => $balance['balance_side'],
            ];
        }

        return $summaries;
    }

    public function totalDebitsInPeriod(
        array $accountIds,
        int $companyId,
        CarbonInterface $dateFrom,
        CarbonInterface $dateTo,
        ?int $fiscalYearId = null,
    ): string {
        if ($accountIds === []) {
            return '0.0000';
        }

        $total = JournalEntryLine::query()
            ->whereIn('journal_entry_lines.account_id', $accountIds)
            ->whereHas('journalEntry', function (Builder $entryQuery) use ($companyId, $dateFrom, $dateTo, $fiscalYearId): void {
                $this->applyEntryFiltersBetween($entryQuery, $companyId, $dateFrom, $dateTo, $fiscalYearId);
            })
            ->sum('debit');

        return number_format((float) $total, 4, '.', '');
    }

    public function balanceBeforeDate(
        Account $account,
        CarbonInterface $beforeDate,
        ?int $fiscalYearId = null,
    ): array {
        $signedBalance = $this->signedBalanceBeforeDate(
            [$account->id],
            (int) $account->company_id,
            $beforeDate,
            $fiscalYearId,
        );

        $presentation = BalancePresentation::present($signedBalance, $account->normal_balance);

        return [
            'signed_balance' => $signedBalance,
            ...$presentation,
        ];
    }

    /**
     * @param  list<int>  $accountIds
     */
    public function signedBalanceBeforeDate(
        array $accountIds,
        int $companyId,
        CarbonInterface $beforeDate,
        ?int $fiscalYearId = null,
    ): string {
        if ($accountIds === []) {
            return '0.0000';
        }

        $lines = JournalEntryLine::query()
            ->select('journal_entry_lines.debit', 'journal_entry_lines.credit', 'accounts.normal_balance')
            ->join('accounts', 'accounts.id', '=', 'journal_entry_lines.account_id')
            ->whereIn('journal_entry_lines.account_id', $accountIds)
            ->whereHas('journalEntry', function (Builder $entryQuery) use ($companyId, $beforeDate, $fiscalYearId): void {
                $entryQuery
                    ->where('company_id', $companyId)
                    ->where('entry_date', '<', $beforeDate->toDateString())
                    ->whereIn('status', array_map(
                        fn (JournalEntryStatus $status) => $status->value,
                        LedgerImpact::impactingStatuses(),
                    ));

                if ($fiscalYearId !== null) {
                    $entryQuery->where('fiscal_year_id', $fiscalYearId);
                }
            })
            ->get();

        $balance = '0.0000';

        foreach ($lines as $line) {
            $normalBalance = $line->normal_balance instanceof NormalBalance
                ? $line->normal_balance
                : NormalBalance::from($line->normal_balance);

            $balance = bcadd(
                $balance,
                BalancePresentation::signedMovement(
                    $normalBalance,
                    (string) $line->debit,
                    (string) $line->credit,
                ),
                4,
            );
        }

        return $balance;
    }

    /**
     * @param  list<int>  $accountIds
     */
    public function totalPresentationForAccounts(
        array $accountIds,
        int $companyId,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId = null,
    ): string {
        $total = '0.0000';

        foreach ($accountIds as $accountId) {
            $account = Account::query()->find($accountId);

            if ($account === null) {
                continue;
            }

            $balance = $this->balanceForAccount($account, $asOfDate, $fiscalYearId);
            $total = bcadd($total, $balance['balance_amount'], 4);
        }

        return $total;
    }

    protected function applyEntryFiltersBetween(
        Builder $entryQuery,
        int $companyId,
        CarbonInterface $dateFrom,
        CarbonInterface $dateTo,
        ?int $fiscalYearId,
    ): void {
        $entryQuery
            ->where('company_id', $companyId)
            ->whereBetween('entry_date', [$dateFrom->toDateString(), $dateTo->toDateString()])
            ->whereIn('status', array_map(
                fn (JournalEntryStatus $status) => $status->value,
                LedgerImpact::impactingStatuses(),
            ));

        if ($fiscalYearId !== null) {
            $entryQuery->where('fiscal_year_id', $fiscalYearId);
        }
    }

    protected function applyEntryFilters(
        Builder $entryQuery,
        int $companyId,
        CarbonInterface $asOfDate,
        ?int $fiscalYearId,
    ): void {
        $entryQuery
            ->where('company_id', $companyId)
            ->where('entry_date', '<=', $asOfDate->toDateString())
            ->whereIn('status', array_map(
                fn (JournalEntryStatus $status) => $status->value,
                LedgerImpact::impactingStatuses(),
            ));

        if ($fiscalYearId !== null) {
            $entryQuery->where('fiscal_year_id', $fiscalYearId);
        }
    }
}
