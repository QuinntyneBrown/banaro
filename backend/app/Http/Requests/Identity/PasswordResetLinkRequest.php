<?php

namespace App\Http\Requests\Identity;

use App\Rules\EmailAddress;
use Illuminate\Foundation\Http\FormRequest;

/** An address to send a reset link to, or a link to check. */
class PasswordResetLinkRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = ['email' => ['required', ...EmailAddress::rules()]];
        if ($this->routeIs('password-reset.check')) {
            $rules['token'] = ['required', 'string', 'max:255'];
        }

        return $rules;
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['email.*' => __('identity.errors.email')];
    }
}
