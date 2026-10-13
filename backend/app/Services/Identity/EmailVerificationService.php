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

    /**
     * Verifies the account behind an unused, unexpired link and marks the link used, in one
     * transaction; the row lock makes two openings of one link verify once (L2-002 criteria 1, 2).
     *
     * @return bool false for an unknown, used or expired link, which changes nothing
     */
    public function consume(string $token): bool
    {
        return DB::transaction(function () use ($token) {
            $row = DB::table('email_verifications')
                ->where('token_hash', self::hash($token))
                ->lockForUpdate()
                ->first();

            if (! $row || $row->used_at !== null || Carbon::parse($row->expires_at)->lte(Carbon::now())) {
                return false;
            }

            DB::table('email_verifications')->where('id', $row->id)->update(['used_at' => Carbon::now()]);
            User::whereKey($row->user_id)->whereNull('email_verified_at')->update(['email_verified_at' => Carbon::now()]);

            return true;
        });
    }

    /** The account a link was issued to, whether or not the link is still usable. */
    public function userFor(string $token): ?User
    {
        $userId = DB::table('email_verifications')->where('token_hash', self::hash($token))->value('user_id');

        return $userId ? User::find($userId) : null;
    }

    public static function hash(string $token): string
    {
        return hash('sha256', $token);
    }
}
