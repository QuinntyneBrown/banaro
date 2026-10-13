import { eq } from 'drizzle-orm';
import { nowStamp } from '../../clock';
import type { Deps } from '../../container';
import type { JobDefinition } from '../../contracts/queue';
import { orm } from '../../db/orm';
import { builders, profilePhotos } from '../../db/schema/builders';

type Photo = typeof profilePhotos.$inferSelect;

async function reject(photo: Photo, deps: Deps): Promise<void> {
  await deps.media.delete(photo.path);
  await orm(deps.db)
    .update(profilePhotos)
    .set({ status: 'rejected', scannedAt: nowStamp(), updatedAt: nowStamp() })
    .where(eq(profilePhotos.id, photo.id));
}

async function pendingPhoto(id: string, deps: Deps): Promise<Photo | undefined> {
  const [photo] = await orm(deps.db).select().from(profilePhotos).where(eq(profilePhotos.id, id));
  return photo?.status === 'pending' ? photo : undefined;
}

/**
 * Scans a quarantined photo (L2-008 criterion 4). A clean photo leaves quarantine and replaces the
 * builder's previous photo, which is deleted; an infected one is deleted. Scanner faults retry with
 * back-off, and a photo still unscanned after the last attempt is rejected (D-038).
 */
export const scanProfilePhoto: JobDefinition<string> = {
  name: 'ScanProfilePhoto',
  queue: 'default',
  attempts: 3,
  backoff: [10, 60],

  async handle(photoId, deps) {
    const photo = await pendingPhoto(photoId, deps);
    if (!photo) return;
    if ((await deps.scanner.scan(await deps.media.get(photo.path))) === 'infected') {
      return reject(photo, deps);
    }

    const path = `photos/${photo.id}.webp`;
    await deps.media.move(photo.path, path);
    const previous = await orm(deps.db).transaction(async (tx) => {
      const [builder] = await tx.select().from(builders).where(eq(builders.id, photo.builderId));
      const [old] = builder.photoId
        ? await tx.select().from(profilePhotos).where(eq(profilePhotos.id, builder.photoId))
        : [];
      await tx
        .update(profilePhotos)
        .set({ path, status: 'ready', scannedAt: nowStamp(), updatedAt: nowStamp() })
        .where(eq(profilePhotos.id, photo.id));
      await tx.update(builders).set({ photoId: photo.id }).where(eq(builders.id, builder.id));
      if (old) await tx.delete(profilePhotos).where(eq(profilePhotos.id, old.id));
      return old;
    });
    if (previous) await deps.media.delete(previous.path);
  },

  async failed(photoId, deps) {
    const photo = await pendingPhoto(photoId, deps);
    if (photo) await reject(photo, deps);
  },
};
