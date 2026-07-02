<?php

namespace App\Http\Requests\Auth;

use App\Enums\PracticeSetBusinessType;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->input('business_type') === '') {
            $merge['business_type'] = null;
        }

        if ($this->input('practice_set_name') === '') {
            $merge['practice_set_name'] = null;
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'practice_set_name' => ['nullable', 'string', 'max:255'],
            'business_type' => ['nullable', 'string', Rule::enum(PracticeSetBusinessType::class)],
            'terms' => ['accepted'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'terms.accepted' => 'You must agree to the Terms and Privacy Policy to continue.',
        ];
    }
}
