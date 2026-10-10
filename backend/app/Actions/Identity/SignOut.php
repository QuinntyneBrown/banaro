<?php

namespace App\Actions\Identity;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SignOut
{
    /** Destroys the server session and issues a fresh CSRF token (L2-003 criterion 5). */
    public function handle(Request $request): void
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
