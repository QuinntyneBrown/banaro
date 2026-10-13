<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ends a session once it is 90 days past sign-in, however active (L2-005 criterion 5). Runs after
 * the session starts and before authentication, so the request continues as a visitor's.
 */
class EnforceAbsoluteSessionLifetime
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasSession()) {
            $authenticatedAt = $request->session()->get('authenticated_at');
            $limit = Carbon::now()->subDays(config('security.session_absolute_lifetime_days'))->getTimestamp();

            if ($authenticatedAt !== null && $authenticatedAt < $limit) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
        }

        return $next($request);
    }
}
