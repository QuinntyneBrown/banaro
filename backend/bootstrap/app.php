<?php

use App\Http\Controllers\Health\LivenessController;
use App\Http\Controllers\Health\ReadinessController;
use App\Http\Middleware\AssignRequestId;
use App\Http\Middleware\LogRequest;
use App\Http\Middleware\RespondDuringMaintenance;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        apiPrefix: 'api/v1',
        then: function () {
            // Health routes sit outside /api/v1 and the api middleware group (L2-053).
            Route::get('health/live', LivenessController::class);
            Route::get('health/ready', ReadinessController::class);

            Route::middleware('api')->prefix('api/v1')->group(base_path('routes/api_public.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        // LogRequest stays outermost so it logs the final status after exception handling.
        $middleware->prepend([LogRequest::class, AssignRequestId::class]);
        $middleware->replace(PreventRequestsDuringMaintenance::class, RespondDuringMaintenance::class);
        $middleware->statefulApi();
        // Opening a verification link and checking a reset link prove themselves with the link's
        // secret token and touch no session, and the pages make these calls during server-side
        // rendering, which carries no CSRF token (decision D-021).
        $middleware->validateCsrfTokens(except: ['api/v1/email/verify', 'api/v1/reset-password/check']);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->context(fn () => ['request_id' => Context::get('request_id')]);

        $exceptions->render(function (Throwable $e, Request $request) {
            $handled = $e instanceof HttpExceptionInterface
                || $e instanceof ValidationException
                || $e instanceof AuthenticationException
                || $e instanceof HttpResponseException;

            if ($handled || config('app.debug')) {
                return null;
            }

            return response()->json(['message' => 'Server Error', 'requestId' => Context::get('request_id')], 500);
        });
    })->create();
