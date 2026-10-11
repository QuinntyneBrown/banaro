<?php

namespace App\Actions\Profiles;

use App\Enums\PhotoStatus;
use App\Jobs\Profiles\ScanProfilePhoto;
use App\Models\Builder;
use App\Models\ProfilePhoto;
use App\Services\Profiles\PhotoProcessor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Processes an accepted upload, stores it in quarantine under a random name and queues the scan
 * (L2-008 criteria 1 and 4). The builder's current photo is untouched until the scan passes.
 */
class UploadProfilePhoto
{
    public function __construct(private readonly PhotoProcessor $processor) {}

    /** @param  array{x: int, y: int, size: int}  $crop */
    public function handle(Builder $builder, UploadedFile $file, array $crop): ProfilePhoto
    {
        $contents = $this->processor->process($file->getRealPath(), $crop);
        $id = (string) Str::uuid();
        $path = "quarantine/{$id}.webp";
        Storage::disk('media')->put($path, $contents);

        $photo = ProfilePhoto::create([
            'id' => $id,
            'builder_id' => $builder->id,
            'path' => $path,
            'status' => PhotoStatus::Pending,
        ]);
        ScanProfilePhoto::dispatch($photo->id)->afterCommit();

        return $photo;
    }
}
