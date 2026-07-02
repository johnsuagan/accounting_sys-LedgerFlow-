<?php

namespace App\Http\Requests\Account;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Support\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreAccountRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    /** @var list<string> */
    protected array $prohibitedMergeFields = [
        'merge_into_id',
        'merge_from_id',
        'target_account_id',
        'source_account_id',
        'merged_account_id',
    ];

    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Account::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('company_id') && CompanyContext::id() !== null) {
            $this->merge(['company_id' => CompanyContext::id()]);
        }
    }

    public function rules(): array
    {
        $companyId = $this->currentCompanyId();

        $rules = [
            'company_id' => $this->companyExistsRule(),
            'account_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('accounts', 'account_code')->where('company_id', $companyId),
            ],
            'account_name' => ['required', 'string', 'max:255'],
            'account_type' => ['required', Rule::enum(AccountType::class)],
            'account_subtype' => ['required', Rule::enum(AccountSubtype::class)],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('accounts', 'id')->where(fn ($query) => $query->where('company_id', $companyId)),
            ],
            'is_header' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
        ];

        foreach ($this->prohibitedMergeFields as $field) {
            $rules[$field] = ['prohibited'];
        }

        return $rules;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $companyId = $this->currentCompanyId();

            if ($companyId === null || (int) $this->input('company_id') !== $companyId) {
                $validator->errors()->add('company_id', 'Company must match the active company context.');
            }

            $this->validateSubtypeMatchesType($validator);
            $this->validateParentIsHeader($validator);
        });
    }

    protected function validateSubtypeMatchesType(Validator $validator): void
    {
        $type = AccountType::tryFrom((string) $this->input('account_type'));
        $subtype = AccountSubtype::tryFrom((string) $this->input('account_subtype'));

        if ($type === null || $subtype === null) {
            return;
        }

        if ($subtype->accountType() !== $type) {
            $validator->errors()->add('account_subtype', 'Account subtype must match the selected account type.');
        }
    }

    protected function validateParentIsHeader(Validator $validator): void
    {
        if ($this->input('parent_id') === null) {
            return;
        }

        $parent = \App\Models\Account::query()->find($this->input('parent_id'));

        if ($parent !== null && ! $parent->is_header) {
            $validator->errors()->add('parent_id', 'Parent account must be a header account.');
        }
    }
}
