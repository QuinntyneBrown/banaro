<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Actions\Settings\Unsubscribe;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UnsubscribeRequest;
use Illuminate\Http\JsonResponse;

/** Anonymous: the signed token in the link is the credential (L2-037 criterion 2). */
class UnsubscribeController extends Controller
{
    public function store(UnsubscribeRequest $request, Unsubscribe $unsubscribe): JsonResponse
    {
        return response()->json(['category' => $unsubscribe->handle($request->token())->value]);
    }
}
