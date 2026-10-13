<?php

namespace App\Services\Settings;

use App\Enums\EmailCategory;
use App\Models\User;

/**
 * Signs and checks the one-click unsubscribe token in e-mail links (L2-029 criterion 3, L2-037).
 * The token is base64url("{user id}:{category}") + "." + base64url(HMAC-SHA256); it has no expiry (D-055).
 */
class UnsubscribeTokenService
{
    public function issue(User $user, EmailCategory $category): string
    {
        $payload = $this->encode($user->id.':'.$category->value);

        return $payload.'.'.$this->encode($this->sign($payload));
    }

    /** @return array{user: User, category: EmailCategory}|null null when the token is forged or its account is gone */
    public function verify(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 2) {
            return null;
        }

        [$payload, $signature] = $parts;
        if (! hash_equals($this->encode($this->sign($payload)), $signature)) {
            return null;
        }

        $decoded = base64_decode(strtr($payload, '-_', '+/'), true);
        if ($decoded === false || ! str_contains($decoded, ':')) {
            return null;
        }

        [$id, $category] = explode(':', $decoded, 2);
        $category = EmailCategory::tryFrom($category);
        $user = ctype_digit($id) ? User::find((int) $id) : null;

        return $user && $category ? ['user' => $user, 'category' => $category] : null;
    }

    private function sign(string $payload): string
    {
        return hash_hmac('sha256', $payload, (string) config('security.unsubscribe_key'), true);
    }

    private function encode(string $raw): string
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }
}
