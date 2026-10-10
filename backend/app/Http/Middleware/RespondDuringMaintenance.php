<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Maintenance mode for the API (L2-043): every request except health and the translation
 * catalogue answers 503 with Retry-After and a body the web app recognises.
 */
class RespondDuringMaintenance extends PreventRequestsDuringMaintenance
{
    /** @var list<string> */
    protected $except = [
        'health/*',
        // The maintenance page itself needs its text.
        'api/v1/i18n/*',
    ];

    public function handle($request, Closure $next): Response
    {
        try {
            return parent::handle($request, $next);
        } catch (HttpException $e) {
            if ($e->getStatusCode() !== 503 || ! $this->app->maintenanceMode()->active()) {
                throw $e;
            }

            return response()->json(
                ['code' => 'maintenance', 'expectedBackAt' => $this->expectedBackAt()],
                503,
                $e->getHeaders(),
            );
        }
    }

    /** Now plus the `--retry` seconds, the same moment the Retry-After header names. */
    private function expectedBackAt(): ?string
    {
        $retry = $this->app->maintenanceMode()->data()['retry'] ?? null;

        return $retry === null ? null : Carbon::now('UTC')->addSeconds((int) $retry)->format('Y-m-d\TH:i:s\Z');
    }
}
