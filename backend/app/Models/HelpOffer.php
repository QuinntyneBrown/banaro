<?php

namespace App\Models;

use App\Enums\HelpOfferStatus;
use App\Enums\LookingForRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One member's offer to help with a project (L2-017). The message is plain text. */
class HelpOffer extends Model
{
    protected $fillable = ['role', 'message'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'role' => LookingForRole::class,
            'status' => HelpOfferStatus::class,
            'answered_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** @return BelongsTo<User, $this> */
    public function offerer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'offerer_id');
    }
}
