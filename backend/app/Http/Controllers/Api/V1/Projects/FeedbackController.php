<?php

namespace App\Http\Controllers\Api\V1\Projects;

use App\Actions\Projects\GiveFeedback;
use App\Actions\Projects\ListProjectFeedback;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\GiveFeedbackRequest;
use App\Http\Requests\Projects\ListProjectFeedbackRequest;
use App\Http\Resources\Projects\FeedbackResource;
use App\Models\Project;
use App\Services\TrustAndSafety\BlockService;
use Illuminate\Http\JsonResponse;

/** A project's feedback: anyone reads it, a member who is not the owner adds to it (L2-016). */
class FeedbackController extends Controller
{
    /** A project the viewer cannot see has no feedback list either, so it answers 404 (D-052). */
    public function index(ListProjectFeedbackRequest $request, string $project, ListProjectFeedback $list, BlockService $blocks): JsonResponse
    {
        $found = Project::where('public_id', $project)->first();
        $viewer = $request->user();
        if ($found === null || ($viewer !== null && $blocks->isBlockedEitherWay($viewer->id, $found->owner_id))) {
            abort(404);
        }

        $page = $list->handle($found, $viewer, $request->page(), $request->perPage());

        return response()->json([
            'items' => FeedbackResource::collection($page->items())->resolve($request),
            'total' => $page->total(),
            'page' => $page->currentPage(),
            'per_page' => $page->perPage(),
            'last_page' => $page->lastPage(),
        ]);
    }

    public function store(GiveFeedbackRequest $request, string $project, GiveFeedback $give): JsonResponse
    {
        $feedback = $give->handle($request->user(), $request->project(), $request->validated('body'));

        return (new FeedbackResource($feedback))->response()->setStatusCode(201);
    }
}
