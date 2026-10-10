<?php

namespace App\Http\Controllers\Api\V1\Identity;

use App\Actions\Identity\SignIn;
use App\Actions\Identity\SignOut;
use App\Http\Controllers\Controller;
use App\Http\Requests\Identity\SignInRequest;
use App\Http\Resources\Identity\SessionResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class SessionController extends Controller
{
    public function show(): SessionResource
    {
        return new SessionResource(Auth::guard('web')->user());
    }

    public function store(SignInRequest $request, SignIn $signIn): SessionResource
    {
        return new SessionResource($signIn->handle(
            $request->validated('email'),
            $request->validated('password'),
            $request,
        ));
    }

    public function destroy(Request $request, SignOut $signOut): Response
    {
        $signOut->handle($request);

        return response()->noContent();
    }
}
