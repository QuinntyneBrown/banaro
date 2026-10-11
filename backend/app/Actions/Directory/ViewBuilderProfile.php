<?php

namespace App\Actions\Directory;

use App\Enums\ProfileAudience;
use App\Models\Builder;
use App\Models\User;
use App\Services\Directory\DistanceService;
use App\Services\Matching\MatchScoreService;
use App\Services\Settings\ProfileVisibilityService;

/**
 * One builder's profile as one viewer may see it (L2-011). A builder that does not exist, has not
 * finished onboarding, or whose profile the viewer may not see answers the same 404, so the reason
 * never shows (criterion 3).
 */
class ViewBuilderProfile
{
    public function __construct(
        private readonly DistanceService $distances,
        private readonly MatchScoreService $scores,
        private readonly ProfileVisibilityService $visibility,
    ) {}

    public function handle(string $publicId, ?User $user): BuilderProfileView
    {
        $builder = Builder::query()
            ->where('public_id', $publicId)
            ->whereNotNull('onboarding_completed_at')
            ->with(['neighbourhood', 'skills', 'experience', 'links', 'photo', 'privacy', 'user'])
            ->first();
        $viewer = $user?->builder()->whereNotNull('onboarding_completed_at')->first();
        if ($builder === null) {
            abort(404);
        }
        $isOwn = $viewer !== null && $viewer->id === $builder->id;
        // Visitors and unfinished accounts see only profiles open to everyone (L2-036 criterion 2).
        if ($viewer === null && $builder->privacy->profile_visibility !== ProfileAudience::Everyone) {
            abort(404);
        }

        if ($viewer === null || $isOwn) {
            return new BuilderProfileView($builder, $viewer, $isOwn);
        }

        $km = $this->distances->between($viewer->neighbourhood_id, $builder->neighbourhood_id);
        $shown = $km === null ? null : $this->visibility->shownDistance($builder, $km);

        return new BuilderProfileView($builder, $viewer, false, $shown, $this->scores->scoreFor($viewer, $builder, $shown));
    }
}
