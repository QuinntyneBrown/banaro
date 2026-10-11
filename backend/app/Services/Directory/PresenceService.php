<?php

namespace App\Services\Directory;

use Illuminate\Support\Carbon;

/** "Online now" or when a builder was last seen, from their last activity (L2-009 criterion 1). */
class PresenceService
{
    public function isOnline(?Carbon $lastActive): bool
    {
        return $lastActive !== null
            && $lastActive->greaterThanOrEqualTo(Carbon::now()->subMinutes((int) config('banaro.presence.online_minutes')));
    }
}
