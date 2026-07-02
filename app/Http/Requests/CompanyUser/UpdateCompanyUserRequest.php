<?php

namespace App\Http\Requests\CompanyUser;

use App\Enums\RoleSlug;
use App\Http\Requests\Concerns\AuthorizesCompanyAccess;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyUserRequest extends FormRequest
{
    use AuthorizesCompanyAccess;

    public function authorize(): bool
    {
        $companyUser = $this->route('company_user');

        return $companyUser !== null && $this->user()?->can('update', $companyUser);
    }

    public function rules(): array
    {
        return [
            'role_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('roles', 'id')->whereNot('slug', RoleSlug::SuperAdmin->value),
            ],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
