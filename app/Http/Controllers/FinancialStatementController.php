<?php

namespace App\Http\Controllers;

use App\Http\Requests\FinancialStatements\FinancialStatementIndexRequest;
use App\Models\FiscalYear;
use App\Services\Accounting\FinancialStatementService;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class FinancialStatementController extends Controller
{
    public function __construct(
        protected FinancialStatementService $financialStatementService,
    ) {}

    public function index(FinancialStatementIndexRequest $request): Response
    {
        $companyId = $this->resolveCompanyId();
        $validated = $request->validated();
        $statement = $request->activeStatement();

        $filters = [
            'date_from' => $validated['date_from'] ?? '',
            'date_to' => $validated['date_to'] ?? '',
            'as_of_date' => $validated['as_of_date'] ?? '',
            'fiscal_year_id' => isset($validated['fiscal_year_id']) ? (int) $validated['fiscal_year_id'] : null,
            'statement' => $statement,
        ];

        $incomeStatement = null;
        $balanceSheet = null;
        $changesInEquity = null;

        if ($statement === 'income_statement' && $request->shouldGenerateIncomeStatement()) {
            $incomeStatement = $this->financialStatementService->incomeStatement(
                $companyId,
                Carbon::parse($filters['date_from']),
                Carbon::parse($filters['date_to']),
                $filters['fiscal_year_id'],
            )->toArray();
        }

        if ($statement === 'balance_sheet' && $request->shouldGenerateBalanceSheet()) {
            $balanceSheet = $this->financialStatementService->balanceSheet(
                $companyId,
                Carbon::parse($filters['as_of_date']),
                $filters['fiscal_year_id'],
            )->toArray();
        }

        if ($statement === 'changes_in_equity' && $request->shouldGenerateChangesInEquity()) {
            $changesInEquity = $this->financialStatementService->changesInEquity(
                $companyId,
                Carbon::parse($filters['date_from']),
                Carbon::parse($filters['date_to']),
                $filters['fiscal_year_id'],
            )->toArray();
        }

        return Inertia::render('accounting/financial-statements/index', [
            'incomeStatement' => $incomeStatement,
            'balanceSheet' => $balanceSheet,
            'changesInEquity' => $changesInEquity,
            'fiscalYears' => FiscalYear::query()
                ->where('company_id', $companyId)
                ->orderByDesc('year')
                ->get(['id', 'name', 'year', 'start_date', 'end_date'])
                ->map(fn (FiscalYear $fiscalYear) => [
                    'id' => $fiscalYear->id,
                    'name' => $fiscalYear->name,
                    'year' => $fiscalYear->year,
                    'start_date' => $fiscalYear->start_date->toDateString(),
                    'end_date' => $fiscalYear->end_date->toDateString(),
                ])
                ->values(),
            'filters' => $filters,
        ]);
    }

    protected function resolveCompanyId(): int
    {
        $companyId = CompanyContext::id();

        if ($companyId === null) {
            throw new \RuntimeException('Company context is required.');
        }

        return $companyId;
    }
}
