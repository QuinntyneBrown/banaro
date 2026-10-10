<?php

namespace App\Http\Controllers\Api\V1\Identity;

use App\Actions\Identity\JoinBanaro;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\JoinBanaroRequest;
use Illuminate\Http\JsonResponse;

class JoinController extends Controller
{
    /** The same 202 whether or not the address was new (L2-001 criterion 3). */
    public function store(JoinBanaroRequest $request, JoinBanaro $join): JsonResponse
    {
        $join->handle($request->validated('name'), $request->validated('email'), $request->validated('password'));

        return response()->json(new \stdClass, 202);
    }
}
