<?php

namespace App\Http\Requests\Account;

use App\Enums\AccountSubtype;
use App\Enums\AccountType;
use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Models\Account;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateAccountRequest extends FormRequest
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
        /** @var Account|null $account */
        $account = $this->route('account');

        return $account !== null && $this->user()?->can('update', $account);
    }

    public function rules(): array
    {
        /** @var Account|null $account */
        $account = $this->route('account');
        $companyId = $account?->company_id;

        $rules = [
            'account_code' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('accounts', 'account_code')
                    ->where('company_id', $companyId)
                    ->ignore($account?->id),
            ],
            'account_name' => ['sometimes', 'required', 'string', 'max:255'],
            'account_type' => ['sometimes', 'required', Rule::enum(AccountType::class)],
            'account_subtype' => ['sometimes', 'required', Rule::enum(AccountSubtype::class)],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('accounts', 'id')->where(fn ($query) => $query->where('company_id', $companyId)),
            ],
            'is_header' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
            'is_system' => ['prohibited'],
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

            /** @var Account|null $account */
            $account = $this->route('account');

            if ($account === null) {
                return;
            }

            if ($this->has('account_type') || $this->has('account_subtype')) {
                $typeValue = (string) $this->input('account_type', $account->account_type->value);
                $subtypeValue = (string) $this->input('account_subtype', $account->account_subtype->value);

                $type = AccountType::tryFrom($typeValue);
                $subtype = AccountSubtype::tryFrom($subtypeValue);

                if ($type !== null && $subtype !== null && $subtype->accountType() !== $type) {
                    $validator->errors()->add('account_subtype', 'Account subtype must match the selected account type.');
                }
            }

            if ($this->input('parent_id') !== null) {
                $parent = Account::query()->find($this->input('parent_id'));

                if ($parent !== null && ! $parent->is_header) {
                    $validator->errors()->add('parent_id', 'Parent account must be a header account.');
                }
            }
        });
    }
}
