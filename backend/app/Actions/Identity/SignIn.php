<?php

namespace App\Actions\Identity;

use App\Models\User;
use App\Notifications\Identity\NewSignInNotification;
use App\Services\Identity\PasswordPolicy;
use App\Services\Identity\SignInHistory;
use App\Services\Identity\SignInThrottleService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class SignIn
{
    /** A cost-12 hash checked when no account matches, so unknown addresses take as long (L2-003 criterion 2). */
    private const DUMMY_HASH = '$2y$12$e8Ku5IasaXd00BF06JTnp.9czUns8UKaP3i9rloo8NiLkVTQaDJmW';

    public function __construct(
        private readonly SignInThrottleService $throttle,
        private readonly SignInHistory $history,
    ) {}

    /**
     * Starts a session under a new identifier for matching credentials; anything else is one
     * generic failure that counts toward the throttle (L2-003).
     *
     * @throws HttpResponseException 422 `invalid_credentials`, or 429 from the throttle
     */
    public function handle(string $email, string $password, Request $request): User
    {
        $ip = (string) $request->ip();
        $this->throttle->check($email, $ip);

        $user = User::firstWhere('email', User::canonicalEmail($email));
        // Over-long passwords are a failed attempt, never an error that names the field (criterion 9).
        $tooLong = mb_strlen($password) > PasswordPolicy::MAX;
        $matches = PasswordPolicy::check($tooLong ? '' : $password, $user?->password ?? self::DUMMY_HASH);

        if (! $user || $tooLong || ! $matches) {
            $this->throttle->recordFailure($email, $ip);

            throw new HttpResponseException(response()->json([
                'code' => 'invalid_credentials',
                'message' => __('identity.signIn.errors.mismatch'),
            ], 422));
        }

        $this->throttle->clearAccount($email);
        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $request->session()->put('authenticated_at', now()->getTimestamp());

        // A new device on an account that signed in before gets a security e-mail (criterion 10).
        $userAgent = (string) $request->userAgent();
        if ($this->history->record($user, $userAgent, $ip)) {
            $user->notify(new NewSignInNotification(Carbon::now(), SignInHistory::browser($userAgent)));
        }

        return $user;
    }
}
