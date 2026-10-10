<?php

namespace App\Actions\Identity;

use App\Models\User;
use App\Notifications\Identity\PasswordChangedNotification;
use App\Services\Identity\PasswordPolicy;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ResetPassword
{
    /**
     * Sets a new password through a reset link under 60 minutes old, once (L2-004). The link proves
     * control of the address, so it also verifies it (criterion 8). Changing the hash ends every
     * other session on its next request, through Sanctum's AuthenticateSession, and this request's
     * session ends at once (criterion 10).
     *
     * @throws HttpResponseException 422 `reset_link_invalid`
     * @throws ValidationException the new password is the current one (criteria 4 and 6)
     */
    public function handle(string $email, string $token, string $password, Request $request): void
    {
        $user = self::userForLink($email, $token);

        if (PasswordPolicy::check($password, $user->password)) {
            throw ValidationException::withMessages(['password' => __('identity.reset.errors.same')]);
        }

        DB::transaction(function () use ($user, $password) {
            $user->forceFill([
                'password' => PasswordPolicy::hash($password),
                'remember_token' => Str::random(60),
                'email_verified_at' => $user->email_verified_at ?? Carbon::now(),
            ])->save();
            Password::broker()->deleteToken($user);
        });

        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $user->notify(new PasswordChangedNotification);
    }

    /** @throws HttpResponseException 422 `reset_link_invalid` for an unknown, expired or used link */
    public static function userForLink(string $email, string $token): User
    {
        $user = User::firstWhere('email', User::canonicalEmail($email));
        if (! $user || ! Password::broker()->tokenExists($user, $token)) {
            throw new HttpResponseException(response()->json([
                'code' => 'reset_link_invalid',
                'message' => __('identity.reset.error.title'),
            ], 422));
        }

        return $user;
    }
}
