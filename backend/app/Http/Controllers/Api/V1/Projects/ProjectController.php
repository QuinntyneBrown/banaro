<?php

namespace App\Http\Controllers\Api\V1\Projects;

use App\Actions\Projects\ShareProject;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\ShareProjectRequest;
use App\Http\Resources\Projects\ProjectResource;
use App\Models\Project;
use App\Services\TrustAndSafety\BlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Projects members share (L2-012, L2-013). The owner always comes from the session. */
class ProjectController extends Controller
{
    /**
     * Anyone may read a project (D-051); one whose owner and the member have blocked each other
     * answers the same 404 as a missing one (D-052).
     */
    public function show(Request $request, string $project, BlockService $blocks): ProjectResource
    {
        $found = Project::where('public_id', $project)->with('owner.builder.photo')->first();
        $viewer = $request->user();
        if ($found === null || ($viewer !== null && $blocks->isBlockedEitherWay($viewer->id, $found->owner_id))) {
            abort(404);
        }

        return new ProjectResource($found);
    }

    public function store(ShareProjectRequest $request, ShareProject $share): JsonResponse
    {
        $project = $share->handle($request->user(), $request->validated());

        return (new ProjectResource($project->load('owner.builder.photo')))->response()->setStatusCode(201);
    }
}
