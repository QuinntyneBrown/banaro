<?php

namespace App\Http\Controllers\Api\V1\Profiles;

use App\Actions\Profiles\RemoveProfilePhoto;
use App\Actions\Profiles\UploadProfilePhoto;
use App\Enums\PhotoStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profiles\UploadProfilePhotoRequest;
use App\Http\Resources\Profiles\ProfilePhotoResource;
use App\Models\ProfilePhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The member's own profile photo (L2-008). Uploads and their progress are found only among the
 * member's own photos, so another member's upload answers 404 (L2-044 criterion 1).
 */
class ProfilePhotoController extends Controller
{
    public function store(UploadProfilePhotoRequest $request, UploadProfilePhoto $upload): JsonResponse
    {
        $builder = $request->user()->builder()->firstOrFail();
        $photo = $upload->handle($builder, $request->file('photo'), $request->crop());

        return (new ProfilePhotoResource($photo))->response()->setStatusCode(202);
    }

    public function show(Request $request, string $photo): ProfilePhotoResource
    {
        $builder = $request->user()->builder()->firstOrFail();

        return new ProfilePhotoResource(ProfilePhoto::where('builder_id', $builder->id)->findOrFail($photo));
    }

    public function destroy(Request $request, RemoveProfilePhoto $remove): Response
    {
        $remove->handle($request->user()->builder()->firstOrFail());

        return response()->noContent();
    }

    /** Streams a ready photo; one in quarantine, rejected or replaced answers 404. */
    public function serve(string $photo): StreamedResponse
    {
        $found = ProfilePhoto::where('status', PhotoStatus::Ready)->findOrFail($photo);

        return Storage::disk('media')->response($found->path, null, [
            'Content-Type' => 'image/webp',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
