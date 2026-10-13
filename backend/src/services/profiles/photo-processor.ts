import sharp from 'sharp';
import { ValidationError } from '../../http/validation/validate';
import { t } from '../user-experience/catalogue-service';

const SIDE = 480;
const MAX_BYTES = 5 * 1024 * 1024;
const QUALITY = 82;

/** Sniffed content type and the extensions a file of that type may carry (L2-045 criterion 6). */
const TYPES = [
  {
    sniff: (b: Buffer) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
    ext: ['jpg', 'jpeg'],
  },
  {
    sniff: (b: Buffer) =>
      b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ext: ['png'],
  },
  {
    sniff: (b: Buffer) =>
      b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP',
    ext: ['webp'],
  },
];

export interface Crop {
  x: number;
  y: number;
  size: number;
}

const fail = (field: 'photo' | 'crop', key: string): never => {
  throw new ValidationError({ [field]: [t(key)] });
};

/**
 * Checks an upload, naming the first problem (L2-008 criterion 2): at most 5 MB, a JPEG, PNG or WebP
 * by its bytes and by its name, at least 480 × 480 px, and a square crop of at least 480 px inside it.
 */
export async function checkUpload(
  file: File | null,
  crop: Record<string, string> | undefined,
): Promise<{ contents: Buffer; crop: Crop }> {
  if (!file) return fail('photo', 'profiles.errors.photoType');
  if (file.size > MAX_BYTES) return fail('photo', 'profiles.errors.photoTooLarge');

  const contents = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const type = TYPES.find((candidate) => candidate.sniff(contents));
  if (!type || !TYPES.some((candidate) => candidate.ext.includes(extension))) {
    return fail('photo', 'profiles.errors.photoType');
  }
  if (!type.ext.includes(extension)) return fail('photo', 'profiles.errors.photoMismatch');

  const { width = 0, height = 0 } = await sharp(contents)
    .metadata()
    .catch(() => fail('photo', 'profiles.errors.photoType'));
  if (width < SIDE || height < SIDE) return fail('photo', 'profiles.errors.photoTooSmall');

  const [x, y, size] = ['x', 'y', 'size'].map((key) =>
    /^\d+$/.test(crop?.[key] ?? '') ? Number(crop![key]) : NaN,
  );
  const inside =
    [x, y, size].every(Number.isInteger) && size >= SIDE && x + size <= width && y + size <= height;
  if (!inside) return fail('crop', 'profiles.errors.photoCrop');

  return { contents, crop: { x, y, size } };
}

/**
 * Turns an accepted upload into the stored photo (L2-008 criteria 1 and 4, ADR-0010): applies the
 * square crop, resizes to 480 × 480 px and encodes a new WebP. sharp writes no metadata unless asked,
 * so none survives, GPS included.
 */
export function processPhoto(contents: Buffer, crop: Crop): Promise<Buffer> {
  return sharp(contents)
    .extract({ left: crop.x, top: crop.y, width: crop.size, height: crop.size })
    .resize(SIDE, SIDE)
    .webp({ quality: QUALITY })
    .toBuffer();
}
