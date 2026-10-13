<?php

namespace App\Http\Controllers\Api\V1\Identity;

use App\Actions\Identity\VerifyEmail;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\VerifyEmailRequest;
use Illuminate\Http\Response;

class EmailVerificationController extends Controller
{
    public function store(VerifyEmailRequest $request, VerifyEmail $verify): Response
    {
        $verify->handle($request->validated('token'));

        return response()->noContent();
    }
}
