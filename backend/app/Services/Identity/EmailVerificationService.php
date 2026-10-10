<?php

namespace App\Services\Identity;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Issues single-use, 24-hour verification links (L2-002). Only a hash of each token is stored,
 * and issuing a new link ends every earlier one.
 */
class EmailVerificationService
{
    public const LIFETIME_HOURS = 24;

    /** @return string the link to put in the e-mail */
    public function issue(User $user): string
    {
        $token = Str::random(64);

        DB::transaction(function () use ($user, $token) {
            DB::table('email_verifications')->where('user_id', $user->id)->whereNull('used_at')->delete();
            DB::table('email_verifications')->insert([
                'user_id' => $user->id,
                'token_hash' => self::hash($token),
                'expires_at' => Carbon::now()->addHours(self::LIFETIME_HOURS),
                'created_at' => Carbon::now(),
            ]);
        });

        return rtrim(config('app.frontend_url'), '/').'/verify-email?token='.$token;
    }

    public static function hash(string $token): string
    {
        return hash('sha256', $token);
    }
}
