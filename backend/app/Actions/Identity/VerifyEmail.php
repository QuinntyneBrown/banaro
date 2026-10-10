<?php

namespace App\Actions\Identity;

use App\Services\Identity\EmailVerificationService;
use Illuminate\Http\Exceptions\HttpResponseException;

class VerifyEmail
{
    public function __construct(private readonly EmailVerificationService $verifications) {}

    /**
     * Verifies through a link. One code covers expired, unknown and used links, so the answer does
     * not say which check failed (L2-002 criterion 2). Opening a link signs no one in (criterion 7).
     *
     * @throws HttpResponseException 422 `verification_link_invalid`
     */
    public function handle(string $token): void
    {
        if (! $this->verifications->consume($token)) {
            throw new HttpResponseException(response()->json([
                'code' => 'verification_link_invalid',
                'message' => __('identity.verify.errors.invalid'),
            ], 422));
        }
    }
}
