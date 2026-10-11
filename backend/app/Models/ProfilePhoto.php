<?php

namespace App\Models;

use App\Enums\PhotoStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One uploaded profile photo, stored on the media disk under a random name (L2-008). */
class ProfilePhoto extends Model
{
    use HasUuids;

    protected $guarded = [];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => PhotoStatus::class,
            'scanned_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Builder, $this> */
    public function builder(): BelongsTo
    {
        return $this->belongsTo(Builder::class);
    }

    public function url(): ?string
    {
        return $this->status === PhotoStatus::Ready ? "/api/v1/photos/{$this->id}" : null;
    }
}
