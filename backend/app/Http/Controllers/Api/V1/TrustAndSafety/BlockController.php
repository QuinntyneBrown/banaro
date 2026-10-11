<?php

namespace App\Http\Controllers\Api\V1\TrustAndSafety;

use App\Actions\TrustAndSafety\BlockBuilder;
use App\Actions\TrustAndSafety\UnblockBuilder;
use App\Http\Controllers\Controller;
use App\Http\Resources\TrustAndSafety\BlockedBuilderResource;
use App\Services\TrustAndSafety\BlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** The member's own blocks; the blocker always comes from the session (L2-032, L2-044). */
class BlockController extends Controller
{
    public function index(Request $request, BlockService $blocks): JsonResponse
    {
        return response()->json(
            BlockedBuilderResource::collection($blocks->blockedByMember($request->user()->id))->resolve($request),
        );
    }

    public function store(Request $request, string $builder, BlockBuilder $block): JsonResponse
    {
        $created = $block->handle($request->user(), $builder);

        return (new BlockedBuilderResource($created->load('blocked.builder.photo')))
            ->response()
            ->setStatusCode(200);
    }

    public function destroy(Request $request, string $builder, UnblockBuilder $unblock): Response
    {
        $unblock->handle($request->user(), $builder);

        return response()->noContent();
    }
}
