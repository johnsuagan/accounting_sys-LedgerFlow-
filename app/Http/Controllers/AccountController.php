<?php

namespace App\Http\Controllers;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Exceptions\Accounting\AccountException;
use App\Http\Requests\Account\StoreAccountRequest;
use App\Http\Requests\Account\UpdateAccountRequest;
use App\Models\Account;
use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Services\Accounting\ChartOfAccountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(
        protected ChartOfAccountService $chartOfAccountService,
        protected AccountRepositoryInterface $accountRepository,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Account::class);

        $companyId = $this->chartOfAccountService->resolveCompanyId();
        $filters = $this->extractFilters($request);

        return Inertia::render('accounting/accounts/index', [
            'accountsTree' => $this->chartOfAccountService->buildTree($companyId, $filters),
            'accounts' => $this->chartOfAccountService->listAccounts($companyId, $filters)
                ->map(fn (Account $account) => $this->transformAccount($account))
                ->values(),
            'filters' => $filters,
            'enums' => [
                'accountTypes' => AccountType::values(),
                'accountSubtypes' => AccountSubtype::values(),
            ],
            'can' => [
                'create' => $request->user()?->can('create', Account::class) ?? false,
                'write' => $request->user()?->canWriteAccounting() ?? false,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Account::class);

        $companyId = $this->chartOfAccountService->resolveCompanyId();

        return Inertia::render('accounting/accounts/create', [
            'parentOptions' => $this->chartOfAccountService->parentOptions($companyId),
            'enums' => [
                'accountTypes' => AccountType::values(),
                'accountSubtypes' => AccountSubtype::values(),
            ],
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        try {
            $account = $this->chartOfAccountService->create($request->validated());
        } catch (AccountException $exception) {
            return back()->withErrors(['account' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('accounting.accounts.index')
            ->with('success', "Account {$account->account_code} created.");
    }

    public function edit(Account $account): Response
    {
        $this->authorize('update', $account);

        return Inertia::render('accounting/accounts/edit', [
            'account' => $this->transformAccount($account),
            'parentOptions' => $this->chartOfAccountService->parentOptions(
                $account->company_id,
                $account->account_type,
                $account->id,
            ),
            'enums' => [
                'accountTypes' => AccountType::values(),
                'accountSubtypes' => AccountSubtype::values(),
            ],
            'can' => [
                'delete' => request()->user()?->can('delete', $account) ?? false,
                'deactivate' => request()->user()?->can('deactivate', $account) ?? false,
                'activate' => request()->user()?->can('activate', $account) ?? false,
                'write' => request()->user()?->canWriteAccounting() ?? false,
            ],
        ]);
    }

    public function update(UpdateAccountRequest $request, Account $account): RedirectResponse
    {
        try {
            $account = $this->chartOfAccountService->update($account, $request->validated());
        } catch (AccountException $exception) {
            return back()->withErrors(['account' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('accounting.accounts.index')
            ->with('success', "Account {$account->account_code} updated.");
    }

    public function destroy(Account $account): RedirectResponse
    {
        $this->authorize('delete', $account);

        try {
            $this->chartOfAccountService->delete($account);
        } catch (AccountException $exception) {
            return back()->withErrors(['account' => $exception->getMessage()]);
        }

        return redirect()
            ->route('accounting.accounts.index')
            ->with('success', 'Account deleted.');
    }

    public function deactivate(Account $account): RedirectResponse
    {
        $this->authorize('deactivate', $account);

        try {
            $this->chartOfAccountService->deactivate($account);
        } catch (AccountException $exception) {
            return back()->withErrors(['account' => $exception->getMessage()]);
        }

        return back()->with('success', 'Account deactivated.');
    }

    public function activate(Account $account): RedirectResponse
    {
        $this->authorize('activate', $account);

        $this->chartOfAccountService->activate($account);

        return back()->with('success', 'Account activated.');
    }

    /**
     * @return array{search?: string, account_type?: string, is_active?: bool|null}
     */
    protected function extractFilters(Request $request): array
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'account_type' => $request->string('account_type')->toString(),
        ];

        if ($request->has('is_active')) {
            $filters['is_active'] = $request->boolean('is_active');
        } else {
            $filters['is_active'] = null;
        }

        return $filters;
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformAccount(Account $account): array
    {
        return [
            'id' => $account->id,
            'account_code' => $account->account_code,
            'account_name' => $account->account_name,
            'account_type' => $account->account_type->value,
            'account_subtype' => $account->account_subtype->value,
            'normal_balance' => $account->normal_balance->value,
            'parent_id' => $account->parent_id,
            'level' => $account->level,
            'path' => $account->path,
            'is_header' => $account->is_header,
            'is_system' => $account->is_system,
            'is_active' => $account->is_active,
            'is_postable' => $account->isPostable(),
            'has_posted_activity' => $this->accountRepository->hasPostedActivity($account),
            'description' => $account->description,
        ];
    }
}
