<?php

namespace App\Services\Security;

use Illuminate\Http\Request;

/**
 * A keyed hash that stands in for a client in rate-limit keys and logs, so the raw address is never
 * stored or logged (L2-046 criterion 3). The key is separate from APP_KEY so it can be rotated alone.
 */
class ClientFingerprint
{
    public function for(Request $request): string
    {
        $client = $request->user()?->getAuthIdentifier() !== null
            ? 'user:'.$request->user()->getAuthIdentifier()
            : 'ip:'.$request->ip();

        return $this->hash($client);
    }

    public function ip(Request $request): string
    {
        return $this->hash('ip:'.$request->ip());
    }

    public function hash(string $value): string
    {
        return hash_hmac('sha256', $value, (string) config('security.client_hash_key'));
    }
}
