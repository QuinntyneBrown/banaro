<?php

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
