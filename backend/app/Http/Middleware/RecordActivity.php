<?php

namespace App\Http\Middleware;

use App\Models\Builder;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Notes when a signed-in builder was last active, for "Online now" and "Recently active" (L2-009).
 * One conditional update writes at most once a minute.
 */
class RecordActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();
        if ($user !== null) {
            $now = Carbon::now();
            $since = $now->copy()->subSeconds((int) config('banaro.presence.record_every_seconds'));
            Builder::where('user_id', $user->getAuthIdentifier())
                ->where(fn ($q) => $q->whereNull('last_active_at')->orWhere('last_active_at', '<=', $since))
                ->update(['last_active_at' => $now]);
        }

        return $next($request);
    }
}
