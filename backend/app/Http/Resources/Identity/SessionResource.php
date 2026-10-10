<?php

namespace App\Http\Resources\Identity;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The signed-in member, or `null` for a visitor.
 *
 * @property-read User|null $resource
 */
class SessionResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $user = $this->resource;
        $builder = $user?->builder()->first();

        return ['member' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified' => $user->email_verified_at !== null,
            // Member pages wait for a finished onboarding (L2-006 criterion 1).
            'onboarding_complete' => (bool) $builder?->isComplete(),
            'builder_id' => $builder?->public_id,
        ] : null];
    }
}
