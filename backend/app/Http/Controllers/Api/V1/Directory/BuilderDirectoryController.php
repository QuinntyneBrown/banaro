<?php

namespace App\Http\Controllers\Api\V1\Directory;

use App\Actions\Directory\SearchDirectory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Directory\SearchDirectoryRequest;
use App\Http\Resources\Directory\BuilderCardResource;
use App\Http\Resources\Directory\PublicBuilderCardResource;
use Illuminate\Http\JsonResponse;

/** The builder directory for members and visitors (L2-009). */
class BuilderDirectoryController extends Controller
{
    public function index(SearchDirectoryRequest $request, SearchDirectory $search): JsonResponse
    {
        $member = $request->isMember();
        $viewer = $member ? $request->user()->builder()->first() : null;
        $result = $search->handle(
            $viewer,
            $request->validated('q'),
            $request->sort(),
            (int) ($request->validated('page') ?? 1),
            (int) ($request->validated('per_page') ?? SearchDirectoryRequest::PER_PAGE),
            $request->filters(),
        );
        $card = $member ? BuilderCardResource::class : PublicBuilderCardResource::class;

        return response()->json([
            'items' => $card::collection($result->items)->resolve($request),
            'total' => $result->total,
            'page' => $result->page,
            'per_page' => $result->perPage,
            'last_page' => $result->lastPage,
            // Members only: option counts and the distance limit in force (L2-010).
            'meta' => [
                'facets' => $result->facets,
                'distance_km' => $result->distanceKm,
            ],
        ]);
    }
}
