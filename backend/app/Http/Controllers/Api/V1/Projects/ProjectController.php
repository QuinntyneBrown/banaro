<?php

namespace App\Http\Controllers\Api\V1\Projects;

use App\Actions\Projects\BrowseProjects;
use App\Actions\Projects\DeleteProject;
use App\Actions\Projects\ShareProject;
use App\Actions\Projects\UpdateProject;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\BrowseProjectsRequest;
use App\Http\Requests\Projects\ShareProjectRequest;
use App\Http\Resources\Projects\ProjectCardResource;
use App\Http\Resources\Projects\ProjectResource;
use App\Models\Project;
use App\Services\TrustAndSafety\BlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

/** Projects members share (L2-012, L2-013). The owner always comes from the session. */
class ProjectController extends Controller
{
    /** Anyone may browse projects (L2-015). */
    public function index(BrowseProjectsRequest $request, BrowseProjects $browse): JsonResponse
    {
        $result = $browse->handle(
            $request->user(),
            $request->validated('q'),
            array_values(array_unique($request->validated('stage') ?? [])),
            array_values(array_unique($request->validated('looking_for') ?? [])),
            (int) ($request->validated('page') ?? 1),
            BrowseProjectsRequest::PER_PAGE,
        );

        return response()->json([
            'items' => ProjectCardResource::collection($result['items'])->resolve($request),
            'total' => $result['total'],
            'page' => $result['page'],
            'per_page' => BrowseProjectsRequest::PER_PAGE,
            'last_page' => $result['last_page'],
        ]);
    }

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

    /** Only the owner; anyone else gets 403 and nothing changes (L2-014 criterion 2). */
    public function update(ShareProjectRequest $request, string $project, UpdateProject $update): ProjectResource
    {
        $found = $this->find($project);
        Gate::authorize('update', $found);

        return new ProjectResource($update->handle($found, $request->validated())->load('owner.builder.photo'));
    }

    public function destroy(string $project, DeleteProject $delete): Response
    {
        $found = $this->find($project);
        Gate::authorize('delete', $found);
        $delete->handle($found);

        return response()->noContent();
    }

    private function find(string $publicId): Project
    {
        return Project::where('public_id', $publicId)->firstOr(fn () => abort(404));
    }
}
