<?php

use Illuminate\Support\Facades\Route;

/*
| Authenticated API under /api/v1. Every route here requires a Sanctum session; intentional
| anonymous routes belong in routes/api_public.php.
*/
Route::middleware('auth:sanctum')->group(function () {
    //
});
