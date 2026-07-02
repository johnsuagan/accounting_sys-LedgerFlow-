<?php

namespace App\Http\Controllers;

use App\Enums\JournalEntrySource;
use App\Enums\JournalEntryStatus;
use App\Exceptions\Accounting\JournalEntryException;
use App\Http\Requests\JournalEntry\CancelJournalEntryRequest;
use App\Http\Requests\JournalEntry\PostJournalEntryRequest;
use App\Http\Requests\JournalEntry\ReverseJournalEntryRequest;
use App\Http\Requests\JournalEntry\StoreJournalEntryRequest;
use App\Http\Requests\JournalEntry\UpdateJournalEntryRequest;
use App\Models\JournalEntry;
use App\Models\JournalEntryAttachment;
use App\Models\JournalEntryLine;
use App\Repositories\Contracts\AccountRepositoryInterface;
use App\Repositories\Contracts\JournalEntryRepositoryInterface;
use App\Services\Accounting\JournalEntryService;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JournalEntryController extends Controller
{
    public function __construct(
        protected JournalEntryService $journalEntryService,
        protected JournalEntryRepositoryInterface $journalEntryRepository,
        protected AccountRepositoryInterface $accountRepository,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', JournalEntry::class);

        $companyId = $this->resolveCompanyId();

        $entries = $this->journalEntryRepository
            ->paginateForCompany($companyId)
            ->through(fn (JournalEntry $entry) => $this->transformEntrySummary($entry));

        return Inertia::render('accounting/journal-entries/index', [
            'entries' => $entries,
            'enums' => [
                'statuses' => JournalEntryStatus::values(),
                'sources' => JournalEntrySource::values(),
            ],
            'can' => [
                'create' => $request->user()?->can('create', JournalEntry::class) ?? false,
                'write' => $request->user()?->canWriteAccounting() ?? false,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', JournalEntry::class);

        $companyId = $this->resolveCompanyId();

        return Inertia::render('accounting/journal-entries/create', [
            'postableAccounts' => $this->transformPostableAccounts($companyId),
            'enums' => [
                'statuses' => JournalEntryStatus::values(),
                'sources' => JournalEntrySource::values(),
            ],
        ]);
    }

    public function store(StoreJournalEntryRequest $request): RedirectResponse
    {
        try {
            $validated = $request->validated();

            $entry = $this->journalEntryService->createDraft(
                $this->extractHeader($validated),
                $this->normalizeLines($validated['lines']),
            );
        } catch (JournalEntryException $exception) {
            return back()->withErrors(['journal_entry' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('accounting.journal-entries.edit', $entry)
            ->with('success', 'Journal entry draft created.');
    }

    public function show(JournalEntry $journalEntry): Response
    {
        $this->authorize('view', $journalEntry);

        $journalEntry->load([
            'lines.account',
            'attachments.uploadedBy',
            'fiscalYear',
            'accountingPeriod',
            'postedBy',
            'createdBy',
            'reversalOf',
            'reversedBy',
        ]);

        return Inertia::render('accounting/journal-entries/show', [
            'entry' => $this->transformEntry($journalEntry),
            'can' => $this->entryPermissions($journalEntry),
        ]);
    }

    public function edit(JournalEntry $journalEntry): Response
    {
        $this->authorize('update', $journalEntry);

        $journalEntry->load(['lines.account', 'attachments.uploadedBy']);

        return Inertia::render('accounting/journal-entries/edit', [
            'entry' => $this->transformEntry($journalEntry),
            'postableAccounts' => $this->transformPostableAccounts($journalEntry->company_id),
            'enums' => [
                'statuses' => JournalEntryStatus::values(),
                'sources' => JournalEntrySource::values(),
            ],
            'can' => $this->entryPermissions($journalEntry),
        ]);
    }

    public function update(UpdateJournalEntryRequest $request, JournalEntry $journalEntry): RedirectResponse
    {
        try {
            $validated = $request->validated();

            $journalEntry = $this->journalEntryService->updateDraft(
                $journalEntry,
                $this->extractUpdatableHeader($validated),
                $this->resolveLinesForUpdate($request, $journalEntry),
            );
        } catch (JournalEntryException $exception) {
            return back()->withErrors(['journal_entry' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('accounting.journal-entries.edit', $journalEntry)
            ->with('success', 'Journal entry draft updated.');
    }

    public function destroy(JournalEntry $journalEntry): RedirectResponse
    {
        $this->authorize('delete', $journalEntry);

        try {
            $this->journalEntryService->deleteDraft($journalEntry);
        } catch (JournalEntryException $exception) {
            return back()->withErrors(['journal_entry' => $exception->getMessage()]);
        }

        return redirect()
            ->route('accounting.journal-entries.index')
            ->with('success', 'Journal entry draft deleted.');
    }

    public function post(PostJournalEntryRequest $request, JournalEntry $journalEntry): RedirectResponse
    {
        try {
            if ($request->has('lines')) {
                $journalEntry = $this->journalEntryService->updateDraft(
                    $journalEntry,
                    [],
                    $this->normalizeLines($request->validated('lines')),
                );
            }

            $journalEntry = $this->journalEntryService->post($journalEntry);
        } catch (JournalEntryException $exception) {
            return back()->withErrors(['journal_entry' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('accounting.journal-entries.show', $journalEntry)
            ->with('success', "Journal entry {$journalEntry->entry_number} posted.");
    }

    public function cancel(CancelJournalEntryRequest $request, JournalEntry $journalEntry): RedirectResponse
    {
        try {
            $journalEntry = $this->journalEntryService->cancel($journalEntry);
        } catch (JournalEntryException $exception) {
            return back()->withErrors(['journal_entry' => $exception->getMessage()]);
        }

        return redirect()
            ->route('accounting.journal-entries.show', $journalEntry)
            ->with('success', 'Journal entry cancelled.');
    }

    public function reverse(ReverseJournalEntryRequest $request, JournalEntry $journalEntry): RedirectResponse
    {
        try {
            $validated = $request->validated();

            $reversalDate = isset($validated['reversal_date'])
                ? Carbon::parse($validated['reversal_date'])
                : null;

            $reversalEntry = $this->journalEntryService->reverse(
                $journalEntry,
                $reversalDate,
                $validated['reversal_reason'],
            );
        } catch (JournalEntryException $exception) {
            return back()->withErrors(['journal_entry' => $exception->getMessage()])->withInput();
        }

        return redirect()
            ->route('accounting.journal-entries.show', $reversalEntry)
            ->with('success', "Reversal entry {$reversalEntry->entry_number} created.");
    }

    protected function resolveCompanyId(): int
    {
        $companyId = CompanyContext::id();

        if ($companyId === null) {
            throw new \RuntimeException('Company context is required.');
        }

        return $companyId;
    }

    /**
     * @return array<string, bool>
     */
    protected function entryPermissions(JournalEntry $journalEntry): array
    {
        $user = request()->user();

        return [
            'write' => $user?->canWriteAccounting() ?? false,
            'update' => $user?->can('update', $journalEntry) ?? false,
            'delete' => $user?->can('delete', $journalEntry) ?? false,
            'post' => $user?->can('post', $journalEntry) ?? false,
            'cancel' => $user?->can('cancel', $journalEntry) ?? false,
            'reverse' => $user?->can('reverse', $journalEntry) ?? false,
            'uploadAttachment' => $user?->can('update', $journalEntry) ?? false,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function transformPostableAccounts(int $companyId): array
    {
        return $this->accountRepository
            ->getPostingAccounts($companyId)
            ->map(fn ($account) => [
                'id' => $account->id,
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type->value,
                'normal_balance' => $account->normal_balance->value,
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    protected function extractHeader(array $validated): array
    {
        return [
            'company_id' => (int) $validated['company_id'],
            'entry_date' => $this->parseEntryDate($validated['entry_date']),
            'description' => $validated['description'],
            'reference' => $validated['reference'] ?? null,
            'memo' => $validated['memo'] ?? null,
            'source' => $validated['source'] ?? JournalEntrySource::Manual,
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    protected function extractUpdatableHeader(array $validated): array
    {
        $header = [];

        if (array_key_exists('entry_date', $validated)) {
            $header['entry_date'] = $this->parseEntryDate($validated['entry_date']);
        }

        if (array_key_exists('description', $validated)) {
            $header['description'] = $validated['description'];
        }

        if (array_key_exists('reference', $validated)) {
            $header['reference'] = $validated['reference'];
        }

        if (array_key_exists('memo', $validated)) {
            $header['memo'] = $validated['memo'];
        }

        return $header;
    }

    protected function parseEntryDate(mixed $entryDate): Carbon
    {
        if ($entryDate instanceof CarbonInterface) {
            return Carbon::instance($entryDate);
        }

        return Carbon::parse((string) $entryDate);
    }

    /**
     * @param  list<array<string, mixed>>  $lines
     * @return list<array<string, mixed>>
     */
    protected function normalizeLines(array $lines): array
    {
        return array_values(array_map(
            fn (array $line) => [
                'account_id' => (int) $line['account_id'],
                'line_number' => (int) $line['line_number'],
                'description' => $line['description'] ?? null,
                'debit' => $line['debit'] ?? 0,
                'credit' => $line['credit'] ?? 0,
            ],
            $lines,
        ));
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function resolveLinesForUpdate(UpdateJournalEntryRequest $request, JournalEntry $journalEntry): array
    {
        if ($request->has('lines')) {
            return $this->normalizeLines($request->validated('lines'));
        }

        return $journalEntry->lines
            ->map(fn (JournalEntryLine $line) => [
                'account_id' => $line->account_id,
                'line_number' => $line->line_number,
                'description' => $line->description,
                'debit' => $line->debit,
                'credit' => $line->credit,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformEntrySummary(JournalEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'entry_number' => $entry->entry_number,
            'entry_date' => $entry->entry_date->toDateString(),
            'description' => $entry->description,
            'status' => $entry->status->value,
            'source' => $entry->source->value,
            'total_debit' => $entry->total_debit,
            'total_credit' => $entry->total_credit,
            'lines_count' => $entry->lines_count ?? $entry->lines()->count(),
            'is_balanced' => $entry->isBalanced(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformEntry(JournalEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'company_id' => $entry->company_id,
            'fiscal_year_id' => $entry->fiscal_year_id,
            'accounting_period_id' => $entry->accounting_period_id,
            'entry_number' => $entry->entry_number,
            'entry_date' => $entry->entry_date->toDateString(),
            'description' => $entry->description,
            'reference' => $entry->reference,
            'memo' => $entry->memo,
            'status' => $entry->status->value,
            'source' => $entry->source->value,
            'reversal_of_id' => $entry->reversal_of_id,
            'reversed_by_id' => $entry->reversed_by_id,
            'reversal_reason' => $entry->reversal_reason,
            'total_debit' => $entry->total_debit,
            'total_credit' => $entry->total_credit,
            'is_balanced' => $entry->isBalanced(),
            'posted_at' => $entry->posted_at?->toIso8601String(),
            'cancelled_at' => $entry->cancelled_at?->toIso8601String(),
            'fiscal_year' => $entry->fiscalYear ? [
                'id' => $entry->fiscalYear->id,
                'name' => $entry->fiscalYear->name,
            ] : null,
            'accounting_period' => $entry->accountingPeriod ? [
                'id' => $entry->accountingPeriod->id,
                'name' => $entry->accountingPeriod->name,
            ] : null,
            'posted_by' => $entry->postedBy ? [
                'id' => $entry->postedBy->id,
                'name' => $entry->postedBy->name,
            ] : null,
            'created_by' => $entry->createdBy ? [
                'id' => $entry->createdBy->id,
                'name' => $entry->createdBy->name,
            ] : null,
            'reversal_of' => $entry->reversalOf ? [
                'id' => $entry->reversalOf->id,
                'entry_number' => $entry->reversalOf->entry_number,
            ] : null,
            'reversed_by' => $entry->reversedBy ? [
                'id' => $entry->reversedBy->id,
                'entry_number' => $entry->reversedBy->entry_number,
            ] : null,
            'lines' => $entry->lines->map(fn (JournalEntryLine $line) => [
                'id' => $line->id,
                'line_number' => $line->line_number,
                'account_id' => $line->account_id,
                'account_code' => $line->account?->account_code,
                'account_name' => $line->account?->account_name,
                'account_type' => $line->account?->account_type?->value,
                'description' => $line->description,
                'debit' => $line->debit,
                'credit' => $line->credit,
            ])->values(),
            'attachments' => $entry->attachments->map(fn (JournalEntryAttachment $attachment) => [
                'id' => $attachment->id,
                'file_name' => $attachment->original_filename,
                'file_path' => $attachment->stored_path,
                'mime_type' => $attachment->mime_type,
                'file_size' => $attachment->file_size,
                'uploaded_by' => $attachment->uploaded_by,
                'uploaded_by_name' => $attachment->uploadedBy?->name,
                'created_at' => $attachment->created_at?->toIso8601String(),
            ])->values(),
        ];
    }
}
