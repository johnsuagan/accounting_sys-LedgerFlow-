<?php

namespace App\Http\Requests\FiscalYear;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use Illuminate\Foundation\Http\FormRequest;

class UpdateFiscalYearRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        $fiscalYear = $this->route('fiscal_year');

        return $fiscalYear !== null && $this->user()?->can('update', $fiscalYear);
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
