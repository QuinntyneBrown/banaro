<?php

namespace App\Http\Requests\Profiles;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Validator;

/**
 * A photo upload (L2-008 criterion 2, L2-045 criterion 6): at most 5 MB, a JPEG, PNG or WebP by its
 * bytes and by its name, at least 480 × 480 px, with a square crop of at least 480 px inside it.
 */
class UploadProfilePhotoRequest extends FormRequest
{
    public const MIN_SIDE = 480;

    public const MAX_KILOBYTES = 5 * 1024;

    /** Sniffed content type => the extensions a file of that type may carry. */
    private const TYPES = [
        'image/jpeg' => ['jpg', 'jpeg'],
        'image/png' => ['png'],
        'image/webp' => ['webp'],
    ];

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'photo' => ['bail', 'required', 'file', 'max:'.self::MAX_KILOBYTES, $this->image(...)],
            'crop' => ['required', 'array'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'photo.required' => __('profiles.errors.photoType'),
            'photo.file' => __('profiles.errors.photoType'),
            'photo.max' => __('profiles.errors.photoTooLarge'),
            'crop.*' => __('profiles.errors.photoCrop'),
        ];
    }

    /** @return list<Closure> */
    public function after(): array
    {
        return [function (Validator $validator) {
            if ($validator->errors()->hasAny(['photo', 'crop'])) {
                return;
            }
            [$width, $height] = getimagesize($this->file('photo')->getRealPath());
            $crop = $this->input('crop');
            $x = filter_var($crop['x'] ?? null, FILTER_VALIDATE_INT);
            $y = filter_var($crop['y'] ?? null, FILTER_VALIDATE_INT);
            $size = filter_var($crop['size'] ?? null, FILTER_VALIDATE_INT);
            $inside = $x !== false && $y !== false && $size !== false
                && $x >= 0 && $y >= 0 && $size >= self::MIN_SIDE
                && $x + $size <= $width && $y + $size <= $height;
            if (! $inside) {
                $validator->errors()->add('crop', __('profiles.errors.photoCrop'));
            }
        }];
    }

    /** Checks the file's real type, that its name agrees, and its pixel size, naming the first problem. */
    private function image(string $attribute, mixed $file, Closure $fail): void
    {
        if (! $file instanceof UploadedFile) {
            $fail(__('profiles.errors.photoType'));

            return;
        }
        $sniffed = (new \finfo(FILEINFO_MIME_TYPE))->file($file->getRealPath());
        $extension = strtolower($file->getClientOriginalExtension());
        $allowed = array_merge(...array_values(self::TYPES));
        if (! isset(self::TYPES[$sniffed]) || ! in_array($extension, $allowed, true)) {
            $fail(__('profiles.errors.photoType'));

            return;
        }
        if (! in_array($extension, self::TYPES[$sniffed], true)) {
            $fail(__('profiles.errors.photoMismatch'));

            return;
        }
        $size = @getimagesize($file->getRealPath());
        if ($size === false) {
            $fail(__('profiles.errors.photoType'));

            return;
        }
        if ($size[0] < self::MIN_SIDE || $size[1] < self::MIN_SIDE) {
            $fail(__('profiles.errors.photoTooSmall'));
        }
    }

    /** @return array{x: int, y: int, size: int} */
    public function crop(): array
    {
        $crop = $this->input('crop');

        return ['x' => (int) $crop['x'], 'y' => (int) $crop['y'], 'size' => (int) $crop['size']];
    }
}
