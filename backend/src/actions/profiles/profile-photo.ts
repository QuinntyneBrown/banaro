import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { nowStamp } from '../../clock';
import type { Deps } from '../../container';
import { orm } from '../../db/orm';
import { builders, profilePhotos, type Builder } from '../../db/schema/builders';
import { scanProfilePhoto } from '../../jobs/profiles/scan-profile-photo';
import { processPhoto, type Crop } from '../../services/profiles/photo-processor';

/**
 * Processes an accepted upload, stores it in quarantine under a random name and queues the scan
 * (L2-008 criteria 1 and 4). The builder's current photo is untouched until the scan passes.
 */
export async function uploadProfilePhoto(
  builder: Builder,
  contents: Buffer,
  crop: Crop,
  deps: Deps,
) {
  const webp = await processPhoto(contents, crop);
  const id = randomUUID();
  const path = `quarantine/${id}.webp`;
  await deps.media.put(path, webp);
  const [photo] = await orm(deps.db)
    .insert(profilePhotos)
    .values({
      id,
      builderId: builder.id,
      path,
      status: 'pending',
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    })
    .returning();
  await deps.queue.dispatch(scanProfilePhoto, photo.id);
  return photo;
}

/** Clears the builder's photo and deletes its row, then its file (L2-008 criterion 5). */
export async function removeProfilePhoto(builder: Builder, deps: Deps): Promise<void> {
  if (!builder.photoId) return;
  const photoId = builder.photoId;
  const removed = await orm(deps.db).transaction(async (tx) => {
    await tx.update(builders).set({ photoId: null }).where(eq(builders.id, builder.id));
    const [photo] = await tx.delete(profilePhotos).where(eq(profilePhotos.id, photoId)).returning();
    return photo;
  });
  if (removed) await deps.media.delete(removed.path);
}
