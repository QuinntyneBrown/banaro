// Acceptance Test
// Traces to: L2-008, L2-044, L2-045, L2-046
// Description:
// Given a JPEG, PNG or WebP of at most 5 MB and at least 480 × 480 px, when a member uploads it with a
// square crop, then a 480 × 480 px WebP without metadata is stored in quarantine, scanned by the
// worker, and only then shown as their photo, replacing and deleting any previous one.
// Given a file of another type, over 5 MB, under 480 px, whose content does not match its name, or a
// crop outside the image, when uploaded, then it is rejected with 422 naming the problem and nothing
// is stored. Given a file the scanner rejects or cannot scan, then it is deleted and the previous
// photo stays. Given a member with a photo, when they remove it, then the file is deleted and the
// profile has no photo. No member reaches another's upload, uploads are throttled, and readiness
// fails in production while the development scanner is bound.

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GET as ready } from '@/app/health/ready/route';
import { DELETE, POST } from '@/app/api/v1/me/photo/route';
import { GET as showOwn } from '@/app/api/v1/me/photo/[photo]/route';
import { GET as ownProfile } from '@/app/api/v1/me/profile/route';
import { GET as serve } from '@/app/api/v1/photos/[photo]/route';
import { GET as sessionRoute } from '@/app/api/v1/session/route';
import { nowStamp } from '@/src/clock';
import type { MediaScanner } from '@/src/contracts/media-scanner';
import { deps, setDeps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { builders, profilePhotos } from '@/src/db/schema/builders';
import type { User } from '@/src/db/schema/users';
import { LocalMediaStore } from '@/src/integrations/local-media-store';
import { scanProfilePhoto } from '@/src/jobs/profiles/scan-profile-photo';
import { BullQueue } from '@/src/queue/bull-queue';
import { work } from '@/src/queue/work';
import { ulid } from '@/src/ulid';
import { Browser } from '../../support/browser';
import { FakeQueue } from '../../support/fakes';
import { actingAs, createUser, neighbourhoodId, seedReferenceData } from '../../support/members';

let member: User;
let browser: Browser;
let queue: FakeQueue;
let media: LocalMediaStore;

const builderMember = async (name: string) => {
  const user = await createUser({ name });
  await orm(deps().db)
    .insert(builders)
    .values({
      userId: user.id,
      publicId: ulid(),
      name,
      role: 'founder',
      neighbourhoodId: await neighbourhoodId('leslieville'),
      onboardingSavedSteps: ['about', 'skills', 'goals'],
      onboardingCompletedAt: nowStamp(),
    });
  return user;
};

/** A solid image in the given format. */
const image = (format: 'jpeg' | 'png' | 'webp' | 'gif', width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: { r: 200, g: 120, b: 40 } } })
    .toFormat(format)
    .toBuffer();

/** A JPEG carrying an APP1 Exif segment with GPS coordinates, as phone cameras write them. */
const jpegWithGps = async (size: number) => {
  const jpeg = await image('jpeg', size, size);
  const payload = Buffer.from('Exif\0\0GPSLatitude 43.6629 GPSLongitude -79.3957', 'latin1');
  const length = Buffer.alloc(2);
  length.writeUInt16BE(payload.length + 2);
  return Buffer.concat([
    jpeg.subarray(0, 2),
    Buffer.from([0xff, 0xe1]),
    length,
    payload,
    jpeg.subarray(2),
  ]);
};

const upload = (
  name: string,
  contents: Buffer,
  crop: Record<string, number> = { x: 0, y: 0, size: 480 },
  as = browser,
) => {
  const form = new FormData();
  form.append('photo', new File([new Uint8Array(contents)], name));
  for (const [key, value] of Object.entries(crop)) form.append(`crop[${key}]`, String(value));
  return as.send(POST, 'POST', '/api/v1/me/photo', { body: form });
};

const idOf = async (response: Response) => ((await response.json()) as { id: string }).id;

const scanAll = async () => {
  const pending = await orm(deps().db)
    .select()
    .from(profilePhotos)
    .where(eq(profilePhotos.status, 'pending'));
  for (const photo of pending) await scanProfilePhoto.handle(photo.id, deps());
};

const photoRow = async (id: string) =>
  (await orm(deps().db).select().from(profilePhotos).where(eq(profilePhotos.id, id)))[0];

const builderOf = async (user = member) =>
  (await orm(deps().db).select().from(builders).where(eq(builders.userId, user.id)))[0];

const served = (id: string) =>
  new Browser().get(serve, `/api/v1/photos/${id}`, { params: { photo: id } });

const errorsOf = async (response: Response) =>
  ((await response.json()) as { errors: Record<string, string[]> }).errors;

describe('profile photo', () => {
  beforeEach(async () => {
    await seedReferenceData();
    queue = new FakeQueue();
    media = new LocalMediaStore(mkdtempSync(path.join(tmpdir(), 'banaro-media-')));
    setDeps({ queue, media });
    member = await builderMember('Amara Osei');
    browser = await actingAs(member);
  });

  afterEach(() => {
    process.env.APP_ENV = 'testing';
  });

  it('quarantines and scans a valid upload, which then becomes the photo', async () => {
    const response = await upload('amara.jpg', await image('jpeg', 800, 600), {
      x: 100,
      y: 50,
      size: 500,
    });

    expect(response.status).toBe(202);
    const body = (await response.json()) as { id: string; status: string; url: string | null };
    expect(body).toMatchObject({ status: 'pending', url: null });
    expect(queue.payloads(scanProfilePhoto)).toEqual([body.id]);
    const photo = await photoRow(body.id);
    expect(photo.path).toMatch(/^quarantine\//);
    expect(await media.exists(photo.path)).toBe(true);
    expect((await builderOf()).photoId).toBeNull();
    expect((await served(body.id)).status).toBe(404);

    await scanAll();

    const scanned = await photoRow(body.id);
    expect(scanned.status).toBe('ready');
    expect(scanned.path).toMatch(/^photos\//);
    expect(await media.exists(`quarantine/${body.id}.webp`)).toBe(false);
    expect((await builderOf()).photoId).toBe(body.id);
    const own = await browser.get(showOwn, `/api/v1/me/photo/${body.id}`, {
      params: { photo: body.id },
    });
    expect(await own.json()).toEqual({
      id: body.id,
      status: 'ready',
      url: `/api/v1/photos/${body.id}`,
    });
    const profile = (await (await browser.get(ownProfile, '/api/v1/me/profile')).json()) as {
      photo_url: string;
    };
    expect(profile.photo_url).toBe(`/api/v1/photos/${body.id}`);

    const file = await served(body.id);
    expect(file.status).toBe(200);
    expect(file.headers.get('Content-Type')).toBe('image/webp');
    expect(file.headers.get('Cache-Control')).toBe('private, max-age=3600');
    const metadata = await sharp(Buffer.from(await file.arrayBuffer())).metadata();
    expect([metadata.width, metadata.height, metadata.format]).toEqual([480, 480, 'webp']);
  });

  it('is scanned by the worker from the real queue', async () => {
    setDeps({ queue: new BullQueue() });
    const id = await idOf(await upload('a.jpg', await image('jpeg', 480, 480)));

    expect(await work(deps(), 'default')).toBe(1);

    expect((await photoRow(id)).status).toBe('ready');
    expect((await builderOf()).photoId).toBe(id);
  });

  it('names the photo in the session so the header can show it', async () => {
    const before = (await (await browser.get(sessionRoute, '/api/v1/session')).json()) as {
      member: { photo_url: string | null };
    };
    expect(before.member.photo_url).toBeNull();

    const id = await idOf(await upload('a.jpg', await image('jpeg', 480, 480)));
    await scanAll();

    const after = (await (await browser.get(sessionRoute, '/api/v1/session')).json()) as {
      member: { photo_url: string };
    };
    expect(after.member.photo_url).toBe(`/api/v1/photos/${id}`);
  });

  it('accepts PNG and WebP', async () => {
    expect((await upload('a.png', await image('png', 480, 480))).status).toBe(202);
    expect((await upload('b.webp', await image('webp', 640, 480))).status).toBe(202);
  });

  it('strips metadata, GPS included', async () => {
    const id = await idOf(await upload('phone.jpg', await jpegWithGps(600)));

    const stored = (await media.get((await photoRow(id)).path)).toString('latin1');
    expect(stored).not.toContain('Exif');
    expect(stored).not.toContain('GPS');
  });

  it('rejects invalid files, names the problem and stores nothing', async () => {
    const heicAsJpeg = Buffer.concat([
      Buffer.from('\x00\x00\x00\x18ftypheic\x00\x00\x00\x00mif1heic', 'latin1'),
      Buffer.alloc(2048),
    ]);
    const cases: [string, Buffer, string][] = [
      ['cat.gif', await image('gif', 600, 600), 'Choose a JPEG, PNG or WebP image.'],
      ['holiday.jpg', heicAsJpeg, 'Choose a JPEG, PNG or WebP image.'],
      [
        'photo.png',
        await image('jpeg', 600, 600),
        "That file's name doesn't match what's inside it. Choose a JPEG, PNG or WebP image.",
      ],
      ['small.jpg', await image('jpeg', 479, 900), 'Choose an image at least 480 × 480 pixels.'],
      ['huge.jpg', Buffer.alloc(5 * 1024 * 1024 + 1024), 'Choose an image of 5 MB or less.'],
    ];

    for (const [name, contents, message] of cases) {
      const response = await upload(name, contents);
      expect(response.status, name).toBe(422);
      expect((await errorsOf(response)).photo?.[0], name).toBe(message);
    }

    const outside = await upload('a.jpg', await image('jpeg', 600, 600), {
      x: 200,
      y: 0,
      size: 480,
    });
    expect(outside.status).toBe(422);
    expect((await errorsOf(outside)).crop[0]).toBe(
      'Choose a square inside the image, at least 480 pixels wide.',
    );
    const small = await upload('a.jpg', await image('jpeg', 600, 600), { x: 0, y: 0, size: 400 });
    expect(Object.keys(await errorsOf(small))).toContain('crop');

    expect(await orm(deps().db).$count(profilePhotos)).toBe(0);
    expect(await media.allFiles()).toEqual([]);
    expect(queue.pushed).toHaveLength(0);
  });

  it('deletes the file of a rejected scan and keeps the previous photo', async () => {
    const first = await idOf(await upload('a.jpg', await image('jpeg', 480, 480)));
    await scanAll();
    const infected: MediaScanner = { scan: async () => 'infected' };
    setDeps({ scanner: infected });

    const second = await idOf(await upload('b.jpg', await image('jpeg', 480, 480)));
    const quarantined = (await photoRow(second)).path;
    await scanAll();

    expect((await photoRow(second)).status).toBe('rejected');
    expect(await media.exists(quarantined)).toBe(false);
    expect((await builderOf()).photoId).toBe(first);
    expect((await served(second)).status).toBe(404);
    const own = await browser.get(showOwn, `/api/v1/me/photo/${second}`, {
      params: { photo: second },
    });
    expect(await own.json()).toMatchObject({ status: 'rejected', url: null });
  });

  it('rejects a photo still unscanned after the last attempt', async () => {
    const id = await idOf(await upload('a.jpg', await image('jpeg', 480, 480)));
    const quarantined = (await photoRow(id)).path;

    expect(scanProfilePhoto.attempts).toBe(3);
    await scanProfilePhoto.failed!(id, deps(), new Error('Scanner unreachable'));

    expect((await photoRow(id)).status).toBe('rejected');
    expect(await media.exists(quarantined)).toBe(false);
    expect((await builderOf()).photoId).toBeNull();
  });

  it('replaces and deletes the previous photo with a new one', async () => {
    const first = await idOf(await upload('a.jpg', await image('jpeg', 480, 480)));
    await scanAll();
    const firstPath = (await photoRow(first)).path;

    const second = await idOf(await upload('b.png', await image('png', 480, 480)));
    await scanAll();

    expect((await builderOf()).photoId).toBe(second);
    expect(await photoRow(first)).toBeUndefined();
    expect(await media.exists(firstPath)).toBe(false);
    expect((await served(first)).status).toBe(404);
  });

  it('deletes the file on removal and shows initials again', async () => {
    const id = await idOf(await upload('a.jpg', await image('jpeg', 480, 480)));
    await scanAll();
    const stored = (await photoRow(id)).path;

    expect((await browser.delete(DELETE, '/api/v1/me/photo')).status).toBe(204);

    expect((await builderOf()).photoId).toBeNull();
    expect(await photoRow(id)).toBeUndefined();
    expect(await media.exists(stored)).toBe(false);
    const profile = (await (await browser.get(ownProfile, '/api/v1/me/profile')).json()) as {
      photo_url: string | null;
    };
    expect(profile.photo_url).toBeNull();
    expect((await served(id)).status).toBe(404);
  });

  it('lets no member reach another member upload', async () => {
    const other = await actingAs(await builderMember('Daniel Reyes'));
    const id = await idOf(
      await upload('a.jpg', await image('jpeg', 480, 480), { x: 0, y: 0, size: 480 }, other),
    );

    const response = await browser.get(showOwn, `/api/v1/me/photo/${id}`, {
      params: { photo: id },
    });
    expect(response.status).toBe(404);
    expect((await browser.delete(DELETE, '/api/v1/me/photo')).status).toBe(204);
    expect(await photoRow(id)).toBeDefined();
  });

  it('needs a signed-in member for the photo routes', async () => {
    const visitor = new Browser();

    expect(
      (await visitor.send(POST, 'POST', '/api/v1/me/photo', { body: new FormData() })).status,
    ).toBe(401);
    expect((await visitor.delete(DELETE, '/api/v1/me/photo')).status).toBe(401);
  });

  it('throttles uploads per member', async () => {
    const jpeg = await image('jpeg', 480, 480);
    for (let i = 0; i < 10; i++) expect((await upload(`p${i}.jpg`, jpeg)).status).toBe(202);

    const response = await upload('one-more.jpg', jpeg);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeTruthy();
  });

  it('fails readiness in production while the development scanner is bound', async () => {
    const call = () =>
      ready(new Request('http://localhost:8100/health/ready'), {
        params: Promise.resolve(undefined),
      });
    expect((await call()).status).toBe(200);

    process.env.APP_ENV = 'production';

    expect((await call()).status).toBe(503);
  });
});
