<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Member features that work on a profile need a finished onboarding: until then the API answers
 * 409 `onboarding_incomplete` and the app routes to /welcome (L2-006 criterion 1).
 */
class RequireCompleteProfile
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->builder()->whereNotNull('onboarding_completed_at')->exists()) {
            return response()->json([
                'code' => 'onboarding_incomplete',
                'message' => __('profiles.onboarding.errors.incomplete'),
            ], 409);
        }

        return $next($request);
    }
}
