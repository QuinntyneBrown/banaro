<?php

namespace App\Models;

use App\Enums\BuilderRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

/** A member's public profile; one per account (L2-006, L2-007). */
class Builder extends Model
{
    protected $guarded = ['id'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'role' => BuilderRole::class,
            'open_to' => 'array',
            'onboarding_saved_steps' => 'array',
            'onboarding_completed_at' => 'datetime',
            'last_active_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Builder $builder) {
            $builder->public_id ??= Str::lower((string) Str::ulid());
            $builder->open_to ??= [];
            $builder->onboarding_saved_steps ??= [];
        });
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Neighbourhood, $this> */
    public function neighbourhood(): BelongsTo
    {
        return $this->belongsTo(Neighbourhood::class);
    }

    /** Skills in the member's order (L2-006 criterion 2). @return BelongsToMany<Skill, $this> */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class)->withPivot('position')->orderByPivot('position');
    }

    /** @return HasMany<ExperienceEntry, $this> */
    public function experience(): HasMany
    {
        return $this->hasMany(ExperienceEntry::class)->orderBy('position');
    }

    /** @return HasMany<ProfileLink, $this> */
    public function links(): HasMany
    {
        return $this->hasMany(ProfileLink::class)->orderBy('position');
    }

    /** The owner's privacy choices, read the default way when unset (L2-036). @return HasOne<PrivacySettings, $this> */
    public function privacy(): HasOne
    {
        return $this->hasOne(PrivacySettings::class, 'user_id', 'user_id')->withDefault(PrivacySettings::DEFAULTS);
    }

    /** The current, ready photo (L2-008). @return BelongsTo<ProfilePhoto, $this> */
    public function photo(): BelongsTo
    {
        return $this->belongsTo(ProfilePhoto::class);
    }

    public function isComplete(): bool
    {
        return $this->onboarding_completed_at !== null;
    }
}
