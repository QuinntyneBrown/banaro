<?php

namespace App\Http\Controllers\Api\V1\Projects;

use App\Actions\Projects\ShareProject;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\ShareProjectRequest;
use App\Http\Resources\Projects\ProjectResource;
use Illuminate\Http\JsonResponse;

/** Projects members share (L2-012). The owner always comes from the session. */
class ProjectController extends Controller
{
    public function store(ShareProjectRequest $request, ShareProject $share): JsonResponse
    {
        $project = $share->handle($request->user(), $request->validated());

        return (new ProjectResource($project->load('owner.builder.photo')))->response()->setStatusCode(201);
    }
}
