<?php

namespace App\Http\Requests\Company;

use App\Services\Company\CompanyContextService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SwitchCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'company_id' => [
                'required',
                'integer',
                Rule::exists('companies', 'id')->where('is_active', true),
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $user = $this->user();

            if ($user === null) {
                return;
            }

            $companyId = (int) $this->input('company_id');

            if (! app(CompanyContextService::class)->userCanAccessCompany($user, $companyId)) {
                $validator->errors()->add('company_id', 'You do not have access to this company.');
            }
        });
    }
}
