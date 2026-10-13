<?php

namespace App\Jobs\Identity;

use App\Models\User;
use App\Notifications\Identity\ResetPasswordNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Password;

/**
 * Looks the address up off the request path, so the answer and its timing never depend on whether
 * it is registered (L2-004 criterion 1). A new token replaces any earlier one.
 */
class SendPasswordResetLink implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $tries = 5;

    /** @var list<int> */
    public array $backoff = [10, 60, 300, 900];

    public function __construct(public readonly string $email)
    {
        $this->onQueue('mail');
    }

    public function handle(): void
    {
        $user = User::firstWhere('email', User::canonicalEmail($this->email));
        if (! $user) {
            return;
        }

        $user->notify(new ResetPasswordNotification(Password::broker()->createToken($user)));
    }
}
