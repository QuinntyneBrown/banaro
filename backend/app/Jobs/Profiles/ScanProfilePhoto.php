<?php

namespace App\Jobs\Profiles;

use App\Contracts\MediaScanner;
use App\Enums\PhotoStatus;
use App\Enums\ScanVerdict;
use App\Models\ProfilePhoto;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Scans a quarantined photo (L2-008 criterion 4). A clean photo leaves quarantine and replaces the
 * builder's previous photo, which is deleted; an infected one is deleted. Scanner faults retry with
 * back-off, and a photo still unscanned after the last attempt is rejected (D-038).
 */
class ScanProfilePhoto implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [10, 60];

    public function __construct(public readonly string $photoId) {}

    public function handle(MediaScanner $scanner): void
    {
        $photo = ProfilePhoto::with('builder.photo')->find($this->photoId);
        if ($photo === null || $photo->status !== PhotoStatus::Pending) {
            return;
        }
        $media = Storage::disk('media');

        if ($scanner->scan($media->get($photo->path)) === ScanVerdict::Infected) {
            $this->reject($photo);

            return;
        }

        $path = "photos/{$photo->id}.webp";
        $media->move($photo->path, $path);
        $previous = $photo->builder->photo;
        DB::transaction(function () use ($photo, $path, $previous) {
            $photo->update(['path' => $path, 'status' => PhotoStatus::Ready, 'scanned_at' => now()]);
            $photo->builder->update(['photo_id' => $photo->id]);
            $previous?->delete();
        });
        if ($previous !== null) {
            $media->delete($previous->path);
        }
    }

    public function failed(?Throwable $exception): void
    {
        $photo = ProfilePhoto::find($this->photoId);
        if ($photo !== null && $photo->status === PhotoStatus::Pending) {
            $this->reject($photo);
        }
    }

    private function reject(ProfilePhoto $photo): void
    {
        Storage::disk('media')->delete($photo->path);
        $photo->update(['status' => PhotoStatus::Rejected, 'scanned_at' => now()]);
    }
}
