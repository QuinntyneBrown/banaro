<?php

namespace App\Http\Resources\Directory;

use App\Services\Directory\PresenceService;
use App\Services\Settings\ProfileVisibilityService;
use Illuminate\Http\Request;

/**
 * The card a member sees: the visitor card plus distance, match score, what the builder is building,
 * what they are open to and their online status (L2-009 criterion 1).
 */
class BuilderCardResource extends PublicBuilderCardResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $builder = $this->resource;
        $card = parent::toArray($request);
        $photo = array_pop($card);

        $card += [
            'distance_km' => $builder->distance_km === null ? null : round((float) $builder->distance_km, 1),
            'match_score' => $builder->match_score === null ? null : (int) $builder->match_score,
            'building' => $builder->building_summary,
            'open_to' => $builder->open_to ?? [],
        ];
        // Hidden online status is left out, not nulled (L2-036 criterion 1).
        if (app(ProfileVisibilityService::class)->showsOnlineStatus($builder)) {
            $card += [
                'online' => app(PresenceService::class)->isOnline($builder->last_active_at),
                'last_seen_at' => $builder->last_active_at?->toIso8601String(),
            ];
        }

        return $card + ['photo_url' => $photo];
    }
}
