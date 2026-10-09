<?php

namespace App\Http\Controllers\Api\V1\UserExperience;

use App\Http\Controllers\Controller;
use App\Services\UserExperience\CatalogueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogueController extends Controller
{
    public function show(Request $request, string $locale, CatalogueService $catalogues): JsonResponse
    {
        abort_unless($catalogues->supports($locale), 404);

        $catalogue = $catalogues->catalogue($locale);
        $response = response()->json($catalogue)
            ->setEtag(hash('sha256', json_encode($catalogue)))
            ->setPublic()
            ->setMaxAge(config('banaro.catalogue_max_age'));
        $response->isNotModified($request);

        return $response;
    }
}
