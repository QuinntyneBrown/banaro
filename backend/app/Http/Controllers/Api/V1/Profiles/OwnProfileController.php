<?php

namespace App\Http\Controllers\Api\V1\Profiles;

use App\Actions\Profiles\UpdateOwnProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profiles\UpdateOwnProfileRequest;
use App\Http\Resources\Profiles\OwnProfileResource;
use Illuminate\Http\Request;

/** The signed-in member's own profile; no route takes a builder id (L2-044 criterion 1). */
class OwnProfileController extends Controller
{
    public function show(Request $request): OwnProfileResource
    {
        return new OwnProfileResource($request->user()->builder()->firstOrFail());
    }

    public function update(UpdateOwnProfileRequest $request, UpdateOwnProfile $update): OwnProfileResource
    {
        return new OwnProfileResource($update->handle($request->user(), $request->validated())->fresh());
    }
}
