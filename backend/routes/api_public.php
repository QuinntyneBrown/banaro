<?php

use App\Http\Controllers\Api\V1\Identity\JoinController;
use App\Http\Controllers\Api\V1\Identity\SessionController;
use App\Http\Controllers\Api\V1\PublicSite\ContactMessageController;
use App\Http\Controllers\Api\V1\UserExperience\CatalogueController;
use Illuminate\Support\Facades\Route;

/*
| Intentional anonymous routes under /api/v1. Each route here must be named by an L2 requirement
| as anonymous.
*/

// L2-052: visitors need text too.
Route::get('i18n/{locale}', [CatalogueController::class, 'show'])
    ->where('locale', '[A-Za-z]{2}-[A-Za-z]{2}')
    ->name('i18n.show');

// L2-001: visitors join.
Route::post('join', [JoinController::class, 'store'])
    ->middleware('throttle:join')
    ->name('join');

// L2-040: visitors can write to the team.
Route::post('contact-messages', [ContactMessageController::class, 'store'])
    ->middleware('throttle:contact')
    ->name('contact-messages.store');

// L2-003: visitors read their (empty) session and sign in.
Route::get('session', [SessionController::class, 'show'])->name('session.show');
Route::post('session', [SessionController::class, 'store'])->name('session.store');
