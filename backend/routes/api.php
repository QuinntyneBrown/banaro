<?php

use App\Http\Controllers\Api\V1\Identity\SessionController;
use App\Http\Controllers\Api\V1\Profiles\OnboardingController;
use App\Http\Controllers\Api\V1\Profiles\OwnProfileController;
use App\Http\Middleware\RequireCompleteProfile;
use App\Http\Middleware\RequireVerifiedEmail;
use Illuminate\Support\Facades\Route;

/*
| Authenticated API under /api/v1. Every route here requires a Sanctum session; intentional
| anonymous routes belong in routes/api_public.php.
*/
Route::middleware('auth:sanctum')->group(function () {
    // L2-003: any signed-in account can sign out, verified or not.
    Route::delete('session', [SessionController::class, 'destroy'])->name('session.destroy');

    // Member features: a verified address is required (L2-002 criterion 4).
    Route::middleware(RequireVerifiedEmail::class)->group(function () {
        // L2-006: the member's own onboarding.
        Route::get('me/onboarding', [OnboardingController::class, 'show'])->name('onboarding.show');
        Route::put('me/onboarding/about', [OnboardingController::class, 'updateAbout'])->name('onboarding.about');
        Route::put('me/onboarding/skills', [OnboardingController::class, 'updateSkills'])->name('onboarding.skills');
        Route::put('me/onboarding/goals', [OnboardingController::class, 'updateGoals'])->name('onboarding.goals');
        Route::post('me/onboarding/complete', [OnboardingController::class, 'complete'])->name('onboarding.complete');

        // Everything below works on a finished profile (L2-006 criterion 1).
        Route::middleware(RequireCompleteProfile::class)->group(function () {
            // L2-007: the member's own profile.
            Route::get('me/profile', [OwnProfileController::class, 'show'])->name('profile.show');
            Route::put('me/profile', [OwnProfileController::class, 'update'])->name('profile.update');
        });
    });
});
