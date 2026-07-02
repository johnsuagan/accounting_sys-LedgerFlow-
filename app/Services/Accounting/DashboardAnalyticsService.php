<?php

namespace App\Services\Accounting;

use App\Enums\AccountType;
use App\Enums\JournalEntryStatus;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class DashboardAnalyticsService
{
    public function __construct(
        protected AccountBalanceService $accountBalanceService,
    ) {}

    public function summary(int $companyId, CarbonInterface $asOfDate, ?int $fiscalYearId = null): array
    {
        $totalAssets = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Asset, $asOfDate, $fiscalYearId);
        $totalLiabilities = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Liability, $asOfDate, $fiscalYearId);
        $totalEquity = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Equity, $asOfDate, $fiscalYearId);
        $totalRevenue = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Revenue, $asOfDate, $fiscalYearId);
        $totalExpenses = $this->accountBalanceService->totalByAccountType($companyId, AccountType::Expense, $asOfDate, $fiscalYearId);
        $netIncome = bcsub($totalRevenue, $totalExpenses, 4);

        return [
            'total_assets' => $totalAssets,
            'total_liabilities' => $totalLiabilities,
            'total_equity' => $totalEquity,
            'total_revenue' => $totalRevenue,
            'total_expenses' => $totalExpenses,
            'net_income' => $netIncome,
            'as_of_date' => $asOfDate->toDateString(),
        ];
    }

    /**
     * @return list<array{period: string, revenue: string, expenses: string, net_income: string}>
     */
    public function monthlyTrends(int $companyId, CarbonInterface $dateFrom, CarbonInterface $dateTo): array
    {
        $months = $this->monthPeriods($dateFrom, $dateTo);
        $trends = [];

        foreach ($months as $monthEnd) {
            $summary = $this->summary($companyId, $monthEnd);

            $trends[] = [
                'period' => $monthEnd->format('Y-m'),
                'revenue' => $summary['total_revenue'],
                'expenses' => $summary['total_expenses'],
                'net_income' => $summary['net_income'],
            ];
        }

        return $trends;
    }

    /**
     * @return list<array{account_type: string, total: string}>
     */
    public function accountBalanceSummary(int $companyId, CarbonInterface $asOfDate): array
    {
        $summary = [];

        foreach (AccountType::cases() as $type) {
            $summary[] = [
                'account_type' => $type->value,
                'total' => $this->accountBalanceService->totalByAccountType($companyId, $type, $asOfDate),
            ];
        }

        return $summary;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function recentJournalEntries(int $companyId, int $limit = 5): array
    {
        return JournalEntry::query()
            ->where('company_id', $companyId)
            ->whereIn('status', [JournalEntryStatus::Posted->value, JournalEntryStatus::Reversed->value])
            ->orderByDesc('posted_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get(['id', 'entry_number', 'entry_date', 'description', 'status', 'total_debit', 'total_credit', 'posted_at'])
            ->map(fn (JournalEntry $entry) => [
                'id' => $entry->id,
                'entry_number' => $entry->entry_number,
                'entry_date' => $entry->entry_date->toDateString(),
                'description' => $entry->description,
                'status' => $entry->status->value,
                'total_debit' => (string) $entry->total_debit,
                'total_credit' => (string) $entry->total_credit,
                'posted_at' => $entry->posted_at?->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return list<CarbonInterface>
     */
    protected function monthPeriods(CarbonInterface $dateFrom, CarbonInterface $dateTo): array
    {
        $periods = [];
        $current = Carbon::parse($dateFrom)->startOfMonth();
        $end = Carbon::parse($dateTo)->endOfMonth();

        while ($current->lte($end)) {
            $monthEnd = $current->copy()->endOfMonth();

            if ($monthEnd->gt($dateTo)) {
                $monthEnd = Carbon::parse($dateTo);
            }

            $periods[] = $monthEnd;
            $current->addMonth()->startOfMonth();
        }

        if ($periods === []) {
            $periods[] = Carbon::parse($dateTo);
        }

        return $periods;
    }
}
