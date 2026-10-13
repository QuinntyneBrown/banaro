<?php

namespace App\Http\Requests\Identity;

use App\Rules\EmailAddress;
use App\Services\Identity\PasswordPolicy;
use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'email' => ['required', ...EmailAddress::rules()],
            'token' => ['required', 'string', 'max:255'],
            'password' => ['required', ...PasswordPolicy::rules(), 'confirmed'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'password.required' => __('identity.errors.passwordRequired'),
            'password.min' => __('identity.errors.passwordMin'),
            'password.max' => __('identity.errors.passwordMax'),
            'password.confirmed' => __('identity.reset.errors.mismatch'),
        ];
    }
}
