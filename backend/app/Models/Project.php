<?php

namespace App\Models;

use App\Enums\LookingForRole;
use App\Enums\ProjectStage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** A product a member shares (L2-012). The owner is never mass-assigned. */
class Project extends Model
{
    protected $fillable = ['name', 'summary', 'description', 'stage', 'link'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'stage' => ProjectStage::class,
            'last_activity_at' => 'datetime',
            'feedback_count' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            $project->public_id ??= Str::lower((string) Str::ulid());
        });
    }

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** @return HasMany<HelpOffer, $this> */
    public function helpOffers(): HasMany
    {
        return $this->hasMany(HelpOffer::class);
    }

    /** The roles in the order the vocabulary lists them. @return list<string> */
    public function lookingFor(): array
    {
        $roles = DB::table('project_looking_for')->where('project_id', $this->id)->pluck('role')->all();
        $order = array_map(fn ($case) => $case->value, LookingForRole::cases());

        return array_values(array_filter($order, fn (string $role) => in_array($role, $roles, true)));
    }

    /** @param  list<string>  $roles */
    public function setLookingFor(array $roles): void
    {
        DB::table('project_looking_for')->where('project_id', $this->id)->delete();
        DB::table('project_looking_for')->insert(
            array_map(fn (string $role) => ['project_id' => $this->id, 'role' => $role], array_values(array_unique($roles))),
        );
    }
}
