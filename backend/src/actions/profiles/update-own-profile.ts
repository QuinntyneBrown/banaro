import { eq } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { builderSkill, builders, experienceEntries, profileLinks } from '../../db/schema/builders';
import { users, type User } from '../../db/schema/users';
import type { OwnProfileInput } from '../../http/requests/profiles/update-own-profile-request';
import { refreshBuilderSearchText } from '../../services/directory/builder-search-text';
import { resolveSkills } from '../../services/profiles/skill-catalogue';

/**
 * Replaces the member's own profile in one transaction, so a failure leaves it as it was (L2-007).
 * Text is stored as typed and encoded wherever it is shown (criterion 6).
 */
export async function updateOwnProfile(
  db: pg.Pool,
  user: User,
  profile: OwnProfileInput,
): Promise<void> {
  const builderId = await orm(db).transaction(async (tx) => {
    const now = nowStamp();
    const [builder] = await tx
      .update(builders)
      .set({
        name: profile.name,
        headline: profile.headline ?? null,
        neighbourhoodId: profile.neighbourhood_id,
        bio: profile.bio ?? null,
        openTo: [...new Set(profile.open_to)],
        lookingFor: profile.looking_for ?? null,
        buildingSummary: profile.building ?? null,
        updatedAt: now,
      })
      .where(eq(builders.userId, user.id))
      .returning({ id: builders.id });
    await tx.update(users).set({ name: profile.name, updatedAt: now }).where(eq(users.id, user.id));

    const skillIds = await resolveSkills(tx, profile.skills);
    await tx.delete(builderSkill).where(eq(builderSkill.builderId, builder.id));
    if (skillIds.length > 0) {
      await tx
        .insert(builderSkill)
        .values(
          skillIds.map((skillId, i) => ({ builderId: builder.id, skillId, position: i + 1 })),
        );
    }

    await tx.delete(experienceEntries).where(eq(experienceEntries.builderId, builder.id));
    if (profile.experience.length > 0) {
      await tx.insert(experienceEntries).values(
        profile.experience.map((entry, i) => ({
          builderId: builder.id,
          position: i + 1,
          title: entry.title,
          organization: entry.organization ?? null,
          startedOn: entry.started_on,
          endedOn: entry.ended_on ?? null,
          createdAt: now,
          updatedAt: now,
        })),
      );
    }

    await tx.delete(profileLinks).where(eq(profileLinks.builderId, builder.id));
    if (profile.links.length > 0) {
      await tx.insert(profileLinks).values(
        profile.links.map((link, i) => ({
          builderId: builder.id,
          position: i + 1,
          label: link.label,
          url: link.url,
          createdAt: now,
          updatedAt: now,
        })),
      );
    }
    return builder.id;
  });
  await refreshBuilderSearchText(db, builderId);
}
