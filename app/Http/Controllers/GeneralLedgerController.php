<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAccountingDateDefaults;
use App\Http\Requests\GeneralLedger\GeneralLedgerIndexRequest;
use App\Models\Account;
use App\Models\FiscalYear;
use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Services\Accounting\GeneralLedgerService;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GeneralLedgerController extends Controller
{
    use ResolvesAccountingDateDefaults;

    public function __construct(
        protected GeneralLedgerService $generalLedgerService,
        protected AccountRepositoryInterface $accountRepository,
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
            'view' => in_array($request->input('view'), ['ledger', 't-account'], true)
                ? $request->input('view')
                : 'ledger',
        ]);

        $ledger = null;

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

        return Inertia::render('accounting/general-ledger/index', [
            'ledger' => $ledger,
            'accounts' => $this->accountRepository
                ->listForCompany($companyId)
                ->map(fn (Account $account) => [
                    'id' => $account->id,
                    'account_code' => $account->account_code,
                    'account_name' => $account->account_name,
                    'account_type' => $account->account_type->value,
                    'is_header' => $account->is_header,
                ])
                ->values(),
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
            'can' => [
                'write' => $request->user()?->canWriteAccounting() ?? false,
            ],
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
