<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAccountingDateDefaults;
use App\Http\Requests\GeneralLedger\GeneralLedgerIndexRequest;
use App\Models\Account;
use App\Models\FiscalYear;
use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Services\Accounting\AccountBalanceService;
use App\Services\Accounting\GeneralLedgerService;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TAccountController extends Controller
{
    use ResolvesAccountingDateDefaults;

    public function __construct(
        protected GeneralLedgerService $generalLedgerService,
        protected AccountRepositoryInterface $accountRepository,
        protected AccountBalanceService $accountBalanceService,
    ) {}

    public function index(GeneralLedgerIndexRequest $request): Response
    {
        $companyId = $this->resolveCompanyId();
        $validated = $request->validated();

        $filters = $this->applyDefaultDateFilters($companyId, [
            'account_id' => isset($validated['account_id']) ? (int) $validated['account_id'] : null,
            'date_from' => $validated['date_from'] ?? '',
            'date_to' => $validated['date_to'] ?? '',
            'fiscal_year_id' => isset($validated['fiscal_year_id']) ? (int) $validated['fiscal_year_id'] : null,
            'include_descendants' => $request->includeDescendants(),
            'account_type' => $request->input('account_type', ''),
        ]);

        $ledger = null;
        $accountSummaries = null;

        if (($filters['date_from'] ?? '') !== '' && ($filters['date_to'] ?? '') !== '' && ! $request->shouldGenerate()) {
            $accountSummaries = $this->filterSummaries(
                $this->accountBalanceService->summariesForPostableAccounts(
                    $companyId,
                    Carbon::parse($filters['date_to']),
                    $filters['fiscal_year_id'],
                ),
                $filters['account_type'],
            );
        }

        if ($request->shouldGenerate()) {
            $account = $this->accountRepository->findOrFail($filters['account_id']);
            $this->authorize('view', $account);

            $ledger = $this->generalLedgerService->ledgerForAccount(
                $account,
                Carbon::parse($filters['date_from']),
                Carbon::parse($filters['date_to']),
                $filters['fiscal_year_id'],
                $filters['include_descendants'],
            )->toArray();
        }

        return Inertia::render('accounting/t-accounts/index', [
            'ledger' => $ledger,
            'accountSummaries' => $accountSummaries,
            'accounts' => $this->accountOptions($companyId),
            'fiscalYears' => $this->fiscalYearOptions($companyId),
            'filters' => $filters,
            'accountTypes' => ['asset', 'liability', 'equity', 'revenue', 'expense'],
        ]);
    }

    /**
     * @param  list<array<string, mixed>>  $summaries
     * @return list<array<string, mixed>>
     */
    protected function filterSummaries(array $summaries, string $accountType): array
    {
        if ($accountType === '') {
            return $summaries;
        }

        return array_values(array_filter(
            $summaries,
            fn (array $summary) => $summary['account_type'] === $accountType,
        ));
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function accountOptions(int $companyId): array
    {
        return $this->accountRepository
            ->listForCompany($companyId)
            ->map(fn (Account $account) => [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type->value,
                'normal_balance' => $account->normal_balance->value,
                'is_header' => $account->is_header,
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function fiscalYearOptions(int $companyId): array
    {
        return FiscalYear::query()
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
            ->values()
            ->all();
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
