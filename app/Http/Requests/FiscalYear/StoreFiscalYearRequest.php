<?php

namespace App\Http\Requests\FiscalYear;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use Illuminate\Foundation\Http\FormRequest;

class StoreFiscalYearRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\FiscalYear::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'company_id' => $this->companyExistsRule(),
            'name' => ['required', 'string', 'max:50'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
