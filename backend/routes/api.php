<?php

use App\Http\Controllers\Api\V1\Identity\SessionController;
use Illuminate\Support\Facades\Route;

/*
| Authenticated API under /api/v1. Every route here requires a Sanctum session; intentional
| anonymous routes belong in routes/api_public.php.
*/
Route::middleware('auth:sanctum')->group(function () {
    // L2-003: any signed-in account can sign out, verified or not.
    Route::delete('session', [SessionController::class, 'destroy'])->name('session.destroy');
});
