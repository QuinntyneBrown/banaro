<?php

namespace App\Actions\Settings;

use App\Enums\EmailCategory;
use App\Services\Settings\EmailPreferenceService;
use App\Services\Settings\UnsubscribeTokenService;
use Illuminate\Http\Exceptions\HttpResponseException;

/** Turns off the category a signed link names, with no session (L2-037 criteria 2 and 3). */
class Unsubscribe
{
    public function __construct(
        private readonly UnsubscribeTokenService $tokens,
        private readonly EmailPreferenceService $preferences,
    ) {}

    /** @throws HttpResponseException 422 `invalid_unsubscribe_link` when the token is forged or its account is gone */
    public function handle(string $token): EmailCategory
    {
        $link = $this->tokens->verify($token);

        if ($link === null) {
            throw new HttpResponseException(response()->json([
                'code' => 'invalid_unsubscribe_link',
                'message' => __('settings.unsubscribe.invalid'),
            ], 422));
        }

        $this->preferences->set($link['user'], $link['category'], false);

        return $link['category'];
    }
}
