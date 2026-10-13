import { inject, Injectable } from '@angular/core';
import { formatFileSize, PhotoCrop, TranslationService } from 'api';

const MAX_BYTES = 5 * 1024 * 1024;
const MIN_SIDE = 480;

/** The outcome of checking a chosen photo: its crop, or the problem in words. */
export type PhotoCheckResult = { ok: true; crop: PhotoCrop } | { ok: false; problem: string };

/** Reads the real type from the first bytes; `null` when it is not an image Banaro knows. */
function sniff(bytes: Uint8Array): string | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'JPEG';
  if (ascii(1, 4) === 'PNG') return 'PNG';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'WebP';
  if (ascii(0, 3) === 'GIF') return 'GIF';
  if (ascii(4, 8) === 'ftyp' && /^(heic|heix|hevc|mif1|msf1|heif)$/.test(ascii(8, 12)))
    return 'HEIC';
  return null;
}

/**
 * Checks a chosen photo in the browser for fast feedback: type by content, size, and at least
 * 480 × 480 px. The crop is the centred largest square (D-039). The API decides (L2-008).
 */
@Injectable({ providedIn: 'root' })
export class PhotoFileCheck {
  private readonly i18n = inject(TranslationService);

  async check(file: File): Promise<PhotoCheckResult> {
    const type = sniff(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
    const accepted = type === 'JPEG' || type === 'PNG' || type === 'WebP';
    const tooLarge = file.size > MAX_BYTES;
    const named = type ?? (file.name.split('.').pop() ?? '').toUpperCase();
    const size = formatFileSize(file.size);
    if (!accepted && tooLarge) return this.fail('typeAndSize', { type: named, size });
    if (!accepted) {
      return named ? this.fail('type', { type: named }) : this.fail('unreadable');
    }
    if (tooLarge) return this.fail('tooLarge', { size });

    let width: number;
    let height: number;
    try {
      const bitmap = await createImageBitmap(file);
      ({ width, height } = bitmap);
      bitmap.close();
    } catch {
      return this.fail('unreadable');
    }
    if (width < MIN_SIDE || height < MIN_SIDE) return this.fail('tooSmall', { width, height });

    const side = Math.min(width, height);
    return {
      ok: true,
      crop: { x: Math.floor((width - side) / 2), y: Math.floor((height - side) / 2), size: side },
    };
  }

  private fail(key: string, params: Record<string, string | number> = {}): PhotoCheckResult {
    return { ok: false, problem: this.i18n.t(`profiles.photo.errors.${key}`, params) };
  }
}
