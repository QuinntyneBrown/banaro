<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\SetEmailPreferenceRequest;
use App\Http\Resources\Settings\EmailPreferencesResource;
use App\Services\Settings\EmailPreferenceService;
use Illuminate\Http\Request;

/** The signed-in member's own e-mail categories; no route names another account (L2-037, L2-044). */
class EmailPreferenceController extends Controller
{
    public function show(Request $request, EmailPreferenceService $preferences): EmailPreferencesResource
    {
        return new EmailPreferencesResource($preferences->all($request->user()));
    }

    public function update(SetEmailPreferenceRequest $request, EmailPreferenceService $preferences): EmailPreferencesResource
    {
        return new EmailPreferencesResource(
            $preferences->set($request->user(), $request->category(), $request->enabled()),
        );
    }
}
