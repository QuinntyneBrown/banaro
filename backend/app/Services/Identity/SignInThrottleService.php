<?php

namespace App\Services\Identity;

use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\RateLimiter;

/**
 * Limits credential guessing: 5 failures per account or 20 per IP address in 15 minutes
 * (L2-003 criterion 3). Unknown addresses count the same way, so a 429 reveals nothing about
 * which addresses are registered.
 */
class SignInThrottleService
{
    public const WINDOW_SECONDS = 15 * 60;

    public const PER_ACCOUNT = 5;

    public const PER_IP = 20;

    /** @throws HttpResponseException 429 with Retry-After once either limit is reached */
    public function check(string $email, string $ip): void
    {
        $limits = [
            $this->accountKey($email) => self::PER_ACCOUNT,
            $this->ipKey($ip) => self::PER_IP,
        ];

        foreach ($limits as $key => $max) {
            if (RateLimiter::tooManyAttempts($key, $max)) {
                $seconds = RateLimiter::availableIn($key);

                throw new HttpResponseException(response()->json([
                    'code' => 'too_many_attempts',
                    'message' => __('identity.signIn.errors.tooMany', ['minutes' => (int) ceil($seconds / 60)]),
                ], 429, ['Retry-After' => $seconds]));
            }
        }
    }

    public function recordFailure(string $email, string $ip): void
    {
        RateLimiter::hit($this->accountKey($email), self::WINDOW_SECONDS);
        RateLimiter::hit($this->ipKey($ip), self::WINDOW_SECONDS);
    }

    public function clearAccount(string $email): void
    {
        RateLimiter::clear($this->accountKey($email));
    }

    private function accountKey(string $email): string
    {
        return 'sign-in:account:'.hash('sha256', User::canonicalEmail($email));
    }

    private function ipKey(string $ip): string
    {
        return 'sign-in:ip:'.hash('sha256', $ip);
    }
}
