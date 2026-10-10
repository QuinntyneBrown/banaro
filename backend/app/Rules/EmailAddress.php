<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * E-mail address rule for every form. Laravel 11's `email` rule lets CR and LF through
 * (ADR-0005), so this rejects any control character before the RFC check runs.
 */
class EmailAddress implements ValidationRule
{
    /** @return list<mixed> */
    public static function rules(): array
    {
        return ['string', 'max:254', new self, 'email:rfc,strict'];
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || preg_match('/[\x00-\x1F\x7F]/', $value)) {
            $fail('validation.email')->translate();
        }
    }
}
