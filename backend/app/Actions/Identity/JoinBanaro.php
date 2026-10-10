<?php

namespace App\Actions\Identity;

use App\Models\User;
use App\Notifications\Identity\AccountAlreadyExistsNotification;
use App\Notifications\Identity\VerifyEmailNotification;
use App\Services\Identity\EmailVerificationService;
use App\Services\Identity\PasswordPolicy;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class JoinBanaro
{
    public function __construct(private readonly EmailVerificationService $verifications) {}

    /**
     * Creates an unverified account and queues the verification e-mail; for a registered address
     * it creates nothing and tells the owner instead. Both paths hash the password, so they take
     * similar time (L2-001).
     */
    public function handle(string $name, string $email, string $password): void
    {
        $email = User::canonicalEmail($email);
        $hash = PasswordPolicy::hash($password);

        $existing = User::firstWhere('email', $email);
        if ($existing) {
            $existing->notify(new AccountAlreadyExistsNotification);

            return;
        }

        try {
            $user = DB::transaction(fn () => User::create([
                'name' => $name,
                'email' => $email,
                'password' => $hash,
                'code_of_conduct_version' => config('banaro.code_of_conduct_version'),
                'code_of_conduct_accepted_at' => Carbon::now(),
            ]));
        } catch (UniqueConstraintViolationException) {
            // A concurrent join won the race: treat it as the registered-address path.
            User::firstWhere('email', $email)?->notify(new AccountAlreadyExistsNotification);

            return;
        }

        $user->notify(new VerifyEmailNotification($this->verifications->issue($user)));
    }
}
