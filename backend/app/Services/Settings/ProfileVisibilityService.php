<?php

namespace App\Services\Settings;

use App\Enums\LocationPrecision;
use App\Enums\ProfileAudience;
use App\Models\Builder;
use Illuminate\Database\Eloquent\Builder as Query;
use Illuminate\Database\Query\JoinClause;

/**
 * The one rule for what others see of a builder (L2-036). Listings join the owner's settings as
 * `ps`; a missing row reads as the defaults. Resources ask the per-builder methods, so a hidden
 * field is left out rather than nulled.
 */
class ProfileVisibilityService
{
    /** Joins the owners' privacy settings as `ps` onto a builder query. @param Query<Builder> $query */
    public function joinSettings(Query $query): void
    {
        $query->leftJoin('privacy_settings as ps', fn (JoinClause $join) => $join->on('ps.user_id', '=', 'builders.user_id'));
    }

    /** Leaves members-only profiles out when nobody is signed in (L2-036 criterion 2). @param Query<Builder> $query */
    public function applyScope(Query $query, bool $signedIn): void
    {
        if (! $signedIn) {
            $query->whereRaw('COALESCE(ps.profile_visibility, ?) = ?', [
                ProfileAudience::MembersOnly->value,
                ProfileAudience::Everyone->value,
            ]);
        }
    }

    /**
     * The distance others see, as SQL over the exact kilometres `$km`: rounded to the nearest 5 km
     * for "City only", so neither the card, the sort nor a distance filter reveals more
     * (L2-036 criterion 3, D-046).
     */
    public function sqlDistance(string $km): string
    {
        $city = LocationPrecision::CityOnly->value;

        return "(CASE WHEN ps.location_precision = '{$city}' THEN ROUND({$km} / 5.0) * 5 ELSE {$km} END)";
    }

    public function isCityOnly(Builder $builder): bool
    {
        return $builder->privacy->location_precision === LocationPrecision::CityOnly;
    }

    public function showsOnlineStatus(Builder $builder): bool
    {
        return (bool) $builder->privacy->show_online_status;
    }
}
