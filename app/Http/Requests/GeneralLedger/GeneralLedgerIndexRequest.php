<?php

namespace App\Http\Requests\GeneralLedger;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use App\Models\Account;
use App\Models\FiscalYear;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class GeneralLedgerIndexRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Account::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'date_from' => ['nullable', 'date', 'required_with:account_id'],
            'date_to' => ['nullable', 'date', 'required_with:account_id', 'after_or_equal:date_from'],
            'fiscal_year_id' => ['nullable', 'integer', 'exists:fiscal_years,id'],
            'include_descendants' => ['sometimes', 'boolean'],
        ];
    }

    public function shouldGenerate(): bool
    {
        return $this->filled('account_id')
            && $this->filled('date_from')
            && $this->filled('date_to');
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $companyId = $this->currentCompanyId();

            if ($companyId === null) {
                $validator->errors()->add('company', 'Company context is required.');

                return;
            }

            if ($this->filled('account_id')) {
                $account = Account::query()->find($this->integer('account_id'));

                if ($account !== null && (int) $account->company_id !== $companyId) {
                    $validator->errors()->add('account_id', 'Account does not belong to the active company.');
                }
            }

            if ($this->filled('fiscal_year_id')) {
                $fiscalYear = FiscalYear::query()->find($this->integer('fiscal_year_id'));

                if ($fiscalYear !== null && (int) $fiscalYear->company_id !== $companyId) {
                    $validator->errors()->add('fiscal_year_id', 'Fiscal year does not belong to the active company.');
                }
            }
        });
    }

    public function includeDescendants(): bool
    {
        return $this->boolean('include_descendants');
    }
}
