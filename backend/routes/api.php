<?php

use App\Http\Controllers\Api\V1\Identity\SessionController;
use App\Http\Controllers\Api\V1\Notifications\NotificationController;
use App\Http\Controllers\Api\V1\Profiles\OnboardingController;
use App\Http\Controllers\Api\V1\Profiles\OwnProfileController;
use App\Http\Controllers\Api\V1\Profiles\ProfilePhotoController;
use App\Http\Controllers\Api\V1\Projects\FeedbackController;
use App\Http\Controllers\Api\V1\Projects\ProjectController;
use App\Http\Controllers\Api\V1\Settings\EmailPreferenceController;
use App\Http\Controllers\Api\V1\Settings\PrivacyController;
use App\Http\Controllers\Api\V1\TrustAndSafety\BlockController;
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

        // L2-032: the member's own blocks.
        Route::get('blocks', [BlockController::class, 'index'])->name('blocks.index');
        Route::put('blocks/{builder}', [BlockController::class, 'store'])->where('builder', '[0-9a-z]{26}')->name('blocks.store');
        Route::delete('blocks/{builder}', [BlockController::class, 'destroy'])->where('builder', '[0-9a-z]{26}')->name('blocks.destroy');

        // L2-036: the member's own privacy settings.
        Route::get('settings/privacy', [PrivacyController::class, 'show'])->name('settings.privacy.show');
        Route::put('settings/privacy', [PrivacyController::class, 'update'])->name('settings.privacy.update');

        // L2-037: the member's own e-mail categories.
        Route::get('settings/email-preferences', [EmailPreferenceController::class, 'show'])->name('settings.email-preferences.show');
        Route::put('settings/email-preferences/{category}', [EmailPreferenceController::class, 'update'])->name('settings.email-preferences.update');

        // L2-027: the member's own notifications.
        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
        Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
        Route::post('notifications/{notification}/read', [NotificationController::class, 'read'])->whereUuid('notification')->name('notifications.read');

        // Everything below works on a finished profile (L2-006 criterion 1).
        Route::middleware(RequireCompleteProfile::class)->group(function () {
            // L2-007: the member's own profile.
            Route::get('me/profile', [OwnProfileController::class, 'show'])->name('profile.show');
            Route::put('me/profile', [OwnProfileController::class, 'update'])->name('profile.update');

            // L2-012: share a project.
            Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
            // L2-014: the owner edits or deletes it.
            Route::put('projects/{project}', [ProjectController::class, 'update'])->where('project', '[0-9a-z]{26}')->name('projects.update');
            Route::delete('projects/{project}', [ProjectController::class, 'destroy'])->where('project', '[0-9a-z]{26}')->name('projects.destroy');

            // L2-016: a member who is not the owner leaves feedback; at most 10 an hour.
            Route::post('projects/{project}/feedback', [FeedbackController::class, 'store'])
                ->where('project', '[0-9a-z]{26}')
                ->middleware('throttle:project-feedback')
                ->name('projects.feedback.store');

            // L2-008: the member's own photo.
            Route::post('me/photo', [ProfilePhotoController::class, 'store'])
                ->middleware('throttle:photo-upload')
                ->name('photo.store');
            Route::get('me/photo/{photo}', [ProfilePhotoController::class, 'show'])->whereUuid('photo')->name('photo.show');
            Route::delete('me/photo', [ProfilePhotoController::class, 'destroy'])->name('photo.destroy');
        });
    });
});
