<?php

namespace App\Http\Requests\JournalEntry;

use App\Enums\JournalEntrySource;
use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Support\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJournalEntryRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\JournalEntry::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('company_id') && CompanyContext::id() !== null) {
            $this->merge(['company_id' => CompanyContext::id()]);
        }
    }

    public function rules(): array
    {
        return [
            'company_id' => $this->companyExistsRule(),
            'entry_date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'reference' => ['nullable', 'string', 'max:100'],
            'memo' => ['nullable', 'string'],
            'source' => ['sometimes', Rule::enum(JournalEntrySource::class)],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.account_id' => ['required', 'integer', 'exists:accounts,id'],
            'lines.*.line_number' => ['required', 'integer', 'min:1'],
            'lines.*.description' => ['nullable', 'string', 'max:255'],
            'lines.*.debit' => ['required', 'numeric', 'min:0'],
            'lines.*.credit' => ['required', 'numeric', 'min:0'],
        ];
    }
}
