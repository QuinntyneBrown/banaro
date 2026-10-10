<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Outermost global middleware: it sees the final response, after the exception handler has turned
 * any exception into one, and writes one JSON line per request once the response is sent.
 */
class LogRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->attributes->set('banaro.started_at', hrtime(true));

        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        $route = $request->route();
        $startedAt = $request->attributes->get('banaro.started_at', hrtime(true));

        Log::channel('requests')->info('request', [
            'request_id' => Context::get('request_id'),
            'method' => $request->getMethod(),
            'route' => $route?->getName() ?? ($route ? '/'.ltrim($route->uri(), '/') : null),
            'status' => $response->getStatusCode(),
            'duration_ms' => round((hrtime(true) - $startedAt) / 1e6, 2),
            'member_id' => $request->user()?->getAuthIdentifier(),
        ]);
    }
}
