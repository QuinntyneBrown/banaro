<?php

namespace App\Actions\Profiles;

use App\Models\Builder;
use App\Models\ProfilePhoto;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/** Clears the builder's photo and deletes its row, then its file (L2-008 criterion 5). */
class RemoveProfilePhoto
{
    public function handle(Builder $builder): void
    {
        $photo = $builder->photo;
        if (! $photo instanceof ProfilePhoto) {
            return;
        }

        DB::transaction(function () use ($builder, $photo) {
            $builder->update(['photo_id' => null]);
            $photo->delete();
        });
        DB::afterCommit(fn () => Storage::disk('media')->delete($photo->path));
    }
}
