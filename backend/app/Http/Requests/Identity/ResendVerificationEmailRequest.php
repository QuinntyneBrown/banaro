<?php

namespace App\Http\Requests\Identity;

use App\Rules\EmailAddress;
use Illuminate\Foundation\Http\FormRequest;

class ResendVerificationEmailRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'token' => ['nullable', 'string', 'alpha_num', 'size:64'],
            'email' => ['nullable', ...EmailAddress::rules()],
        ];
    }
}
