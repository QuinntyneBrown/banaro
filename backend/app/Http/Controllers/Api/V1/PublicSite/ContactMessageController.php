<?php

namespace App\Http\Controllers\Api\V1\PublicSite;

use App\Actions\PublicSite\ContactMessageData;
use App\Actions\PublicSite\SendContactMessage;
use App\Http\Controllers\Controller;
use App\Http\Requests\PublicSite\SendContactMessageRequest;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    /** The response is the same whether the message was queued or discarded (L2-040 criterion 3). */
    public function store(SendContactMessageRequest $request, SendContactMessage $send): JsonResponse
    {
        $send->handle(ContactMessageData::fromValidated($request->validated()));

        return response()->json(new \stdClass, 202);
    }
}
