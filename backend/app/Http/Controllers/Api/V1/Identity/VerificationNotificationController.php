<?php

namespace App\Http\Controllers\Api\V1\Identity;

use App\Actions\Identity\ResendVerificationEmail;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\ResendVerificationEmailRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class VerificationNotificationController extends Controller
{
    /** The same 202 whether a link was sent or not (L2-002 criterion 5). */
    public function store(ResendVerificationEmailRequest $request, ResendVerificationEmail $resend): JsonResponse
    {
        $resend->handle(
            Auth::guard('web')->user(),
            $request->validated('token'),
            $request->validated('email'),
            (string) $request->ip(),
        );

        return response()->json(new \stdClass, 202);
    }
}
