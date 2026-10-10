<?php

namespace App\Services\Identity;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Remembers the devices an account signed in from for 90 days. A device is the browser family plus
 * the IP network (/24 for IPv4, /48 for IPv6), hashed (L2-003 criterion 10).
 */
class SignInHistory
{
    public const REMEMBER_DAYS = 90;

    /** Records a sign-in; true when it came from a new device on an account that signed in before. */
    public function record(User $user, string $userAgent, string $ip): bool
    {
        $since = Carbon::now()->subDays(self::REMEMBER_DAYS);
        $device = hash('sha256', self::browser($userAgent).'|'.self::network($ip));

        $history = DB::table('sign_ins')->where('user_id', $user->id);
        $hasHistory = (clone $history)->exists();
        $known = (clone $history)->where('device_hash', $device)->where('created_at', '>=', $since)->exists();

        DB::table('sign_ins')->where('user_id', $user->id)->where('created_at', '<', $since)->delete();
        DB::table('sign_ins')->insert(['user_id' => $user->id, 'device_hash' => $device, 'created_at' => Carbon::now()]);

        return $hasHistory && ! $known;
    }

    /** "Firefox on macOS", from the user agent; enough to recognise a device, never stored. */
    public static function browser(string $userAgent): string
    {
        $browser = match (true) {
            str_contains($userAgent, 'Edg/') => 'Edge',
            str_contains($userAgent, 'OPR/') => 'Opera',
            str_contains($userAgent, 'Firefox/') => 'Firefox',
            str_contains($userAgent, 'Chrome/') => 'Chrome',
            str_contains($userAgent, 'Safari/') => 'Safari',
            default => null,
        };
        $system = match (true) {
            str_contains($userAgent, 'iPhone'), str_contains($userAgent, 'iPad') => 'iOS',
            str_contains($userAgent, 'Android') => 'Android',
            str_contains($userAgent, 'Windows') => 'Windows',
            str_contains($userAgent, 'Mac OS X') => 'macOS',
            str_contains($userAgent, 'Linux') => 'Linux',
            default => null,
        };

        if ($browser === null) {
            return __('email.newSignIn.unknownBrowser');
        }

        return $system ? __('email.newSignIn.browserOn', ['browser' => $browser, 'system' => $system]) : $browser;
    }

    private static function network(string $ip): string
    {
        $packed = @inet_pton($ip);
        if ($packed === false) {
            return $ip;
        }

        return inet_ntop(strlen($packed) === 4
            ? substr($packed, 0, 3)."\0"
            : substr($packed, 0, 6).str_repeat("\0", 10));
    }
}
