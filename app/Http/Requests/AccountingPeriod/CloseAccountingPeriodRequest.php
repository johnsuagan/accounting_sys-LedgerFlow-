<?php

namespace App\Http\Requests\AccountingPeriod;

use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use Illuminate\Foundation\Http\FormRequest;

class CloseAccountingPeriodRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        $period = $this->route('accounting_period');

        return $period !== null && $this->user()?->can('close', $period);
    }

    public function rules(): array
    {
        return [];
    }
}
