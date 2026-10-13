<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds the transport and browser hardening headers to every response (L2-045 criterion 3).
 * The API serves only JSON and files, so its policy allows no script, style or frame at all.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        foreach (config('security.headers') as $name => $value) {
            $response->headers->set($name, $value);
        }

        return $response;
    }
}
