<?php

namespace App\Http\Controllers\Api\V1\Directory;

use App\Actions\Directory\ViewBuilderProfile;
use App\Http\Controllers\Controller;
use App\Http\Resources\Directory\BuilderProfileResource;
use App\Http\Resources\Directory\PublicBuilderProfileResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** One builder's profile for members and, when it is open to everyone, visitors (L2-011). */
class BuilderProfileController extends Controller
{
    public function show(Request $request, string $builder, ViewBuilderProfile $view): JsonResource
    {
        $profile = $view->handle($builder, $request->user());

        return $profile->viewer === null
            ? new PublicBuilderProfileResource($profile)
            : new BuilderProfileResource($profile);
    }
}
