import { and, eq } from 'drizzle-orm';
import type pg from 'pg';
import { isoStamp } from '../../../clock';
import { orm } from '../../../db/orm';
import { builders, profilePhotos } from '../../../db/schema/builders';
import { projectLookingFor, type Project } from '../../../db/schema/projects';
import { users, type User } from '../../../db/schema/users';
import { LOOKING_FOR_ROLES } from '../../../enums/projects';

/** The roles in the order the vocabulary lists them. */
export async function lookingForOf(db: pg.Pool, projectId: number): Promise<string[]> {
  const roles = new Set(
    (
      await orm(db)
        .select({ role: projectLookingFor.role })
        .from(projectLookingFor)
        .where(eq(projectLookingFor.projectId, projectId))
    ).map((row) => row.role),
  );
  return LOOKING_FOR_ROLES.filter((role) => roles.has(role));
}

/**
 * One project's page (L2-012, L2-013): its fields, its owner linked by their profile id, and whether
 * the viewer owns it.
 */
export async function projectResource(db: pg.Pool, project: Project, viewer: User | null) {
  const [owner] = await orm(db)
    .select({
      userName: users.name,
      publicId: builders.publicId,
      builderName: builders.name,
      photoId: profilePhotos.id,
    })
    .from(users)
    .leftJoin(builders, eq(builders.userId, users.id))
    .leftJoin(
      profilePhotos,
      and(eq(profilePhotos.id, builders.photoId), eq(profilePhotos.status, 'ready')),
    )
    .where(eq(users.id, project.ownerId));

  return {
    id: project.publicId,
    name: project.name,
    summary: project.summary,
    description: project.description,
    stage: project.stage,
    looking_for: await lookingForOf(db, project.id),
    link: project.link,
    feedback_count: project.feedbackCount,
    owner: {
      id: owner?.publicId ?? null,
      name: owner?.builderName ?? owner?.userName ?? null,
      photo_url: owner?.photoId ? `/api/v1/photos/${owner.photoId}` : null,
    },
    is_own: viewer?.id === project.ownerId,
    created_at: project.createdAt ? isoStamp(project.createdAt) : null,
    last_activity_at: project.lastActivityAt ? isoStamp(project.lastActivityAt) : null,
  };
}
