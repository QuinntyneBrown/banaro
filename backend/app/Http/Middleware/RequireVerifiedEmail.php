<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Member features need a verified address: an unverified account gets 403 `email_unverified`, and
 * the app sends it to /verify-email (L2-002 criterion 4).
 */
class RequireVerifiedEmail
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->email_verified_at === null) {
            return response()->json([
                'code' => 'email_unverified',
                'message' => __('identity.verify.errors.unverified'),
            ], 403);
        }

        return $next($request);
    }
}
