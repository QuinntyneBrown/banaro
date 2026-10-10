<?php

namespace App\Http\Requests\Identity;

use App\Rules\EmailAddress;
use App\Services\Identity\PasswordPolicy;
use Illuminate\Foundation\Http\FormRequest;

class JoinBanaroRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', ...EmailAddress::rules()],
            'password' => ['required', ...PasswordPolicy::rules()],
            'agreed_to_code_of_conduct' => ['accepted'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => __('identity.errors.nameRequired'),
            'name.max' => __('identity.errors.nameMax'),
            'email.*' => __('identity.errors.email'),
            'password.required' => __('identity.errors.passwordRequired'),
            'password.min' => __('identity.errors.passwordMin'),
            'password.max' => __('identity.errors.passwordMax'),
            'agreed_to_code_of_conduct.accepted' => __('identity.errors.agree'),
        ];
    }
}
