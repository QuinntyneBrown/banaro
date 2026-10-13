import { and, asc, eq } from 'drizzle-orm';
import type pg from 'pg';
import { orm } from '../../../db/orm';
import {
  builderSkill,
  builders,
  experienceEntries,
  profileLinks,
  profilePhotos,
} from '../../../db/schema/builders';
import { neighbourhoods } from '../../../db/schema/neighbourhoods';
import { skills } from '../../../db/schema/skills';
import type { User } from '../../../db/schema/users';

/** The member's editable profile and the neighbourhood list the form needs (L2-007). */
export async function ownProfileResource(db: pg.Pool, user: User) {
  const query = orm(db);
  const [builder] = await query.select().from(builders).where(eq(builders.userId, user.id));
  const [photo] = builder.photoId
    ? await query
        .select({ id: profilePhotos.id })
        .from(profilePhotos)
        .where(and(eq(profilePhotos.id, builder.photoId), eq(profilePhotos.status, 'ready')))
    : [];

  return {
    id: builder.publicId,
    name: builder.name,
    headline: builder.headline,
    neighbourhood_id: builder.neighbourhoodId,
    bio: builder.bio,
    photo_url: photo ? `/api/v1/photos/${photo.id}` : null,
    skills: await query
      .select({ id: skills.id, name: skills.name })
      .from(builderSkill)
      .innerJoin(skills, eq(skills.id, builderSkill.skillId))
      .where(eq(builderSkill.builderId, builder.id))
      .orderBy(asc(builderSkill.position)),
    experience: await query
      .select({
        title: experienceEntries.title,
        organization: experienceEntries.organization,
        started_on: experienceEntries.startedOn,
        ended_on: experienceEntries.endedOn,
      })
      .from(experienceEntries)
      .where(eq(experienceEntries.builderId, builder.id))
      .orderBy(asc(experienceEntries.position)),
    links: await query
      .select({ label: profileLinks.label, url: profileLinks.url })
      .from(profileLinks)
      .where(eq(profileLinks.builderId, builder.id))
      .orderBy(asc(profileLinks.position)),
    open_to: builder.openTo,
    looking_for: builder.lookingFor,
    building: builder.buildingSummary,
    neighbourhoods: await query
      .select({ id: neighbourhoods.id, name: neighbourhoods.name, area: neighbourhoods.area })
      .from(neighbourhoods)
      .orderBy(asc(neighbourhoods.name)),
  };
}
