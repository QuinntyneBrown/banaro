<?php

namespace App\Http\Controllers\Api\V1\Projects;

use App\Actions\Projects\ListHelpOffers;
use App\Actions\Projects\OfferToHelp;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\ListHelpOffersRequest;
use App\Http\Requests\Projects\OfferToHelpRequest;
use App\Http\Resources\Projects\HelpOfferResource;
use Illuminate\Http\JsonResponse;

/** Offers to help with a project: a member makes one, the owner reads them (L2-017). */
class HelpOfferController extends Controller
{
    public function store(OfferToHelpRequest $request, string $project, OfferToHelp $offer): JsonResponse
    {
        $created = $offer->handle(
            $request->user(),
            $request->project(),
            $request->validated('role'),
            $request->validated('message'),
        );

        return (new HelpOfferResource($created))->response()->setStatusCode(201);
    }

    public function index(ListHelpOffersRequest $request, string $project, ListHelpOffers $list): JsonResponse
    {
        $page = $list->handle($request->project(), $request->page(), $request->perPage());

        return response()->json([
            'items' => HelpOfferResource::collection($page->items())->resolve($request),
            'total' => $page->total(),
            'page' => $page->currentPage(),
            'per_page' => $page->perPage(),
            'last_page' => $page->lastPage(),
        ]);
    }
}
