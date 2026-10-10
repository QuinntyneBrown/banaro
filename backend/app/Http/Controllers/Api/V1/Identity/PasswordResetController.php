<?php

namespace App\Http\Controllers\Api\V1\Identity;

use App\Actions\Identity\ResetPassword;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\PasswordResetLinkRequest;
use App\Http\Requests\Identity\ResetPasswordRequest;
use App\Jobs\Identity\SendPasswordResetLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class PasswordResetController extends Controller
{
    /** The same 202 for any well-formed address; the worker decides whether to e-mail (L2-004 criterion 1). */
    public function requestLink(PasswordResetLinkRequest $request): JsonResponse
    {
        SendPasswordResetLink::dispatch($request->validated('email'));

        return response()->json(new \stdClass, 202);
    }

    public function check(PasswordResetLinkRequest $request): Response
    {
        ResetPassword::userForLink($request->validated('email'), $request->validated('token'));

        return response()->noContent();
    }

    public function store(ResetPasswordRequest $request, ResetPassword $reset): Response
    {
        $reset->handle(
            $request->validated('email'),
            $request->validated('token'),
            $request->validated('password'),
            $request,
        );

        return response()->noContent();
    }
}
