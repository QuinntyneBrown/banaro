<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Actions\Settings\UpdatePrivacySettings;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdatePrivacySettingsRequest;
use App\Http\Resources\Settings\PrivacySettingsResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** The signed-in member's own privacy settings; no route names another account (L2-036, L2-044). */
class PrivacyController extends Controller
{
    public function show(Request $request): PrivacySettingsResource
    {
        return new PrivacySettingsResource($request->user()->privacy);
    }

    /** Always 200: the settings exist from the start, even before their first save stores a row. */
    public function update(UpdatePrivacySettingsRequest $request, UpdatePrivacySettings $update): JsonResponse
    {
        return (new PrivacySettingsResource($update->handle($request->user(), $request->validated())))
            ->response()
            ->setStatusCode(200);
    }
}
