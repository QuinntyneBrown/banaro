<?php

namespace App\Http\Controllers\Health;

use App\Services\Operations\ReadinessService;
use Illuminate\Http\JsonResponse;

class ReadinessController
{
    public function __invoke(ReadinessService $readiness): JsonResponse
    {
        return $readiness->check()
            ? response()->json(['status' => 'ready'])
            : response()->json(['status' => 'unavailable'], 503);
    }
}
