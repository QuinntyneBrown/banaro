import type { profilePhotos } from '../../../db/schema/builders';

/** An uploaded photo's progress; `url` is set once it is ready (L2-008). */
export function profilePhotoResource(photo: typeof profilePhotos.$inferSelect) {
  return {
    id: photo.id,
    status: photo.status,
    url: photo.status === 'ready' ? `/api/v1/photos/${photo.id}` : null,
  };
}
