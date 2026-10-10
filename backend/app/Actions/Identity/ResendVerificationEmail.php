<?php

namespace App\Actions\Identity;

use App\Models\User;
use App\Notifications\Identity\VerifyEmailNotification;
use App\Services\Identity\EmailVerificationService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\RateLimiter;

class ResendVerificationEmail
{
    public const PER_HOUR = 3;

    public function __construct(private readonly EmailVerificationService $verifications) {}

    /**
     * Sends a new link to an unverified account found from the session, then a link's token, then
     * the address. Verified and unknown accounts get nothing, and every accepted request looks the
     * same; at most 3 per hour per account or identifier (L2-002 criteria 3, 5 and 6).
     *
     * @throws HttpResponseException 429 with Retry-After
     */
    public function handle(?User $member, ?string $token, ?string $email, string $ip): void
    {
        $email = $email !== null ? User::canonicalEmail($email) : null;
        $user = $member
            ?? ($token !== null ? $this->verifications->userFor($token) : null)
            ?? ($email !== null ? User::firstWhere('email', $email) : null);

        $identifier = $user ? 'user:'.$user->id : 'anon:'.hash('sha256', $token ?? $email ?? $ip);
        $key = 'verification-resend:'.$identifier;

        if (RateLimiter::tooManyAttempts($key, self::PER_HOUR)) {
            $seconds = RateLimiter::availableIn($key);

            throw new HttpResponseException(response()->json([
                'code' => 'too_many_requests',
                'message' => __('identity.verify.errors.tooMany', ['minutes' => (int) ceil($seconds / 60)]),
            ], 429, ['Retry-After' => $seconds]));
        }
        RateLimiter::hit($key, 3600);

        if ($user && $user->email_verified_at === null) {
            $user->notify(new VerifyEmailNotification($this->verifications->issue($user)));
        }
    }
}
