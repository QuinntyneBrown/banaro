<?php

namespace App\Http\Requests\Identity;

use App\Rules\EmailAddress;
use Illuminate\Foundation\Http\FormRequest;

class SignInRequest extends FormRequest
{
    /**
     * The password has no length rule: an over-long one is a failed attempt, not a field error
     * (L2-003 criterion 9).
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', ...EmailAddress::rules()],
            'password' => ['required', 'string'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'email.*' => __('identity.errors.email'),
            'password.*' => __('identity.errors.passwordRequired'),
        ];
    }
}
