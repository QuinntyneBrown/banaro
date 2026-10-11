<?php

namespace App\Services\Profiles;

use RuntimeException;

/**
 * Turns an accepted upload into the stored photo (L2-008 criteria 1 and 4, ADR-0006): decodes it with
 * GD, applies the square crop, resizes to 480 × 480 px and encodes a new WebP. Encoding a new file
 * leaves every byte of metadata behind, GPS EXIF included.
 */
class PhotoProcessor
{
    public const SIDE = 480;

    private const QUALITY = 82;

    /** @param  array{x: int, y: int, size: int}  $crop */
    public function process(string $path, array $crop): string
    {
        $source = @imagecreatefromstring((string) file_get_contents($path));
        if ($source === false) {
            throw new RuntimeException('The image could not be decoded.');
        }
        $photo = imagecreatetruecolor(self::SIDE, self::SIDE);
        imagecopyresampled($photo, $source, 0, 0, $crop['x'], $crop['y'], self::SIDE, self::SIDE, $crop['size'], $crop['size']);

        ob_start();
        imagewebp($photo, null, self::QUALITY);

        return (string) ob_get_clean();
    }
}
