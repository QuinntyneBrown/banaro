<?php

namespace App\Services\Identity;

use App\Rules\NotCommonPassword;
use Illuminate\Support\Facades\Hash;

/** Password rules and hashing shared by join, reset and sign-in (L2-001, L2-004). */
class PasswordPolicy
{
    public const MIN = 12;

    public const MAX = 128;

    /** @return list<mixed> */
    public static function rules(): array
    {
        return ['string', 'min:'.self::MIN, 'max:'.self::MAX, new NotCommonPassword];
    }

    /**
     * Hashes with the configured adaptive algorithm after a SHA-256 pre-hash, so bcrypt's 72-byte
     * limit never silently ignores part of a long password (L2-001 criterion 7).
     */
    public static function hash(string $password): string
    {
        return Hash::make(self::prehash($password));
    }

    public static function check(string $password, string $hash): bool
    {
        return Hash::check(self::prehash($password), $hash);
    }

    private static function prehash(string $password): string
    {
        return base64_encode(hash('sha256', $password, true));
    }
}
