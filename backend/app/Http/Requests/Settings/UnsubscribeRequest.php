<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The signed token from an unsubscribe link. A missing or empty token is not a validation error:
 * like a forged one it answers 422 `invalid_unsubscribe_link` (L2-037 criterion 3).
 */
class UnsubscribeRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['token' => ['nullable', 'string', 'max:512']];
    }

    public function token(): string
    {
        return (string) $this->validated('token', '');
    }
}
