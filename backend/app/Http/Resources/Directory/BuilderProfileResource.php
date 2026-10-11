<?php

namespace App\Http\Resources\Directory;

use App\Models\ExperienceEntry;
use App\Models\ProfileLink;
use App\Services\Directory\PresenceService;
use App\Services\Settings\ProfileVisibilityService;
use Illuminate\Http\Request;

/**
 * The profile a member sees (L2-011 criterion 1): the visitor fields plus distance, match score and
 * reasons, bio, experience, links, what the builder is building, open to, presence, member since and
 * the actions the member may take. Empty and hidden fields are absent, not null (criteria 2 and 4).
 */
class BuilderProfileResource extends PublicBuilderProfileResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $view = $this->resource;
        $builder = $view->builder;
        $visibility = app(ProfileVisibilityService::class);
        $profile = parent::toArray($request);

        // Say hello, report and block arrive with messaging (L2-026), reporting (L2-031) and blocking
        // (L2-032); until then only "Edit profile" on the own profile is offered (D-048).
        $profile['actions'] = [
            'say_hello' => false,
            'report' => false,
            'block' => false,
            'edit' => $view->isOwn,
        ];
        if (! $view->isOwn) {
            $profile['distance_km'] = $view->distanceKm === null ? null : round($view->distanceKm, 1);
            if ($view->match !== null) {
                $profile['match'] = ['score' => $view->match->value, 'reasons' => $view->match->reasons];
            }
        }
        if (filled($builder->bio)) {
            $profile['bio'] = $builder->bio;
        }
        if ($builder->experience->isNotEmpty()) {
            $profile['experience'] = $builder->experience->map(fn (ExperienceEntry $e) => [
                'title' => $e->title,
                'organization' => $e->organization,
                'started_on' => $e->started_on?->format('Y-m-d'),
                'ended_on' => $e->ended_on?->format('Y-m-d'),
            ])->values()->all();
        }
        if ($builder->links->isNotEmpty()) {
            $profile['links'] = $builder->links->map(fn (ProfileLink $l) => ['label' => $l->label, 'url' => $l->url])->values()->all();
        }
        if (filled($builder->building_summary)) {
            $profile['building'] = ['summary' => $builder->building_summary];
        }
        $profile['open_to'] = $builder->open_to ?? [];
        if ($visibility->showsOnlineStatus($builder)) {
            $profile['online'] = app(PresenceService::class)->isOnline($builder->last_active_at);
            $profile['last_seen_at'] = $builder->last_active_at?->toIso8601String();
        }
        $profile['member_since'] = $builder->created_at?->format('Y-m-d');
        if ($builder->privacy->email_contact) {
            $profile['email'] = $builder->user->email;
        }

        return $profile;
    }
}
