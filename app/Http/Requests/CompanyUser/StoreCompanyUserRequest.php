<?php

namespace App\Http\Requests\CompanyUser;

use App\Enums\RoleSlug;
use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompanyUserRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'company_id' => $this->companyExistsRule(),
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->whereNot('slug', RoleSlug::SuperAdmin->value),
            ],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
