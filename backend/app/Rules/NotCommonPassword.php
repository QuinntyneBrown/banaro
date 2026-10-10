<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/** Rejects the 10,000 most common passwords, ignoring case (L2-001 criterion 8). */
class NotCommonPassword implements ValidationRule
{
    /** @var array<string, true>|null */
    private static ?array $list = null;

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && isset(self::list()[mb_strtolower($value)])) {
            $fail(__('identity.errors.passwordCommon'));
        }
    }

    /** @return array<string, true> */
    private static function list(): array
    {
        if (self::$list === null) {
            $lines = file(resource_path('security/common-passwords.txt'), FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            self::$list = array_fill_keys(array_map('mb_strtolower', $lines), true);
        }

        return self::$list;
    }
}
