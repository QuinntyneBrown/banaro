import { and, asc, eq, isNotNull } from 'drizzle-orm';
import type pg from 'pg';
import { isoStamp } from '../../clock';
import { orm } from '../../db/orm';
import { builders, experienceEntries, profileLinks, type Builder } from '../../db/schema/builders';
import { neighbourhoods } from '../../db/schema/neighbourhoods';
import { users, type User } from '../../db/schema/users';
import { isOnline, loadCards, publicCard } from '../../http/resources/directory/builder-cards';
import { notFound } from '../../http/pipeline';
import { distanceBetween } from '../../services/directory/distance-service';
import { matchScore } from '../../services/matching/match-score-service';
import { shownDistance } from '../../services/settings/privacy-service';
import { isBlockedEitherWay } from '../../services/trust-and-safety/block-service';

const PUBLIC_ID = /^[0-9a-z]{26}$/;

/** A finished profile, or null. */
async function finishedBuilder(
  db: pg.Pool,
  where: ReturnType<typeof eq>,
): Promise<Builder | undefined> {
  const [row] = await orm(db)
    .select()
    .from(builders)
    .where(and(where, isNotNull(builders.onboardingCompletedAt)));
  return row;
}

/**
 * One builder's profile as one viewer may see it (L2-011). A builder that does not exist, has not
 * finished onboarding, or whose profile the viewer may not see answers the same 404, so the reason
 * never shows (criterion 3). Visitors get the visitor card's fields only (D-048); empty and hidden
 * fields are absent, not null.
 */
export async function viewBuilderProfile(db: pg.Pool, publicId: string, user: User | null) {
  const builder = PUBLIC_ID.test(publicId)
    ? await finishedBuilder(db, eq(builders.publicId, publicId))
    : undefined;
  if (!builder) throw notFound();
  const viewer = user ? await finishedBuilder(db, eq(builders.userId, user.id)) : undefined;
  const isOwn = viewer?.id === builder.id;

  const [{ context }] = await loadCards(db, [builder.id]);
  // Visitors and unfinished accounts see only profiles open to everyone (L2-036 criterion 2).
  if (!viewer && context.privacy.profileVisibility !== 'everyone') throw notFound();
  // A block either way answers the same 404 (L2-011 criterion 3, L2-032 criterion 4).
  if (viewer && !isOwn && (await isBlockedEitherWay(db, viewer.userId, builder.userId))) {
    throw notFound();
  }

  const card = publicCard(builder, context);
  const base = {
    id: card.id,
    name: card.name,
    role: card.role,
    headline: card.headline,
    ...(card.neighbourhood && { neighbourhood: card.neighbourhood }),
    ...(card.skills.length > 0 && { skills: card.skills }),
    photo_url: card.photo_url,
    is_own: isOwn,
  };
  if (!viewer) return base;

  const query = orm(db);
  const profile: Record<string, unknown> = {
    ...base,
    // Say hello and report arrive with messaging (L2-026) and reporting (L2-031) (D-048).
    actions: { say_hello: false, report: false, block: !isOwn, edit: isOwn },
  };
  if (!isOwn) {
    const km = await distanceBetween(db, viewer.neighbourhoodId, builder.neighbourhoodId);
    const shown = km === null ? null : shownDistance(context.privacy, km);
    profile.distance_km = shown === null ? null : Math.round(shown * 10) / 10;
    // Where the distance is measured from: the viewer's own neighbourhood.
    const [from] = viewer.neighbourhoodId
      ? await query
          .select()
          .from(neighbourhoods)
          .where(eq(neighbourhoods.id, viewer.neighbourhoodId))
      : [];
    profile.distance_from = from?.name ?? null;
    const match = matchScore(shown, builder.lastActiveAt);
    profile.match = { score: match.value, reasons: match.reasons };
  }
  if (builder.bio) profile.bio = builder.bio;
  const experience = await query
    .select({
      title: experienceEntries.title,
      organization: experienceEntries.organization,
      started_on: experienceEntries.startedOn,
      ended_on: experienceEntries.endedOn,
    })
    .from(experienceEntries)
    .where(eq(experienceEntries.builderId, builder.id))
    .orderBy(asc(experienceEntries.position));
  if (experience.length > 0) profile.experience = experience;
  const links = await query
    .select({ label: profileLinks.label, url: profileLinks.url })
    .from(profileLinks)
    .where(eq(profileLinks.builderId, builder.id))
    .orderBy(asc(profileLinks.position));
  if (links.length > 0) profile.links = links;
  if (builder.buildingSummary) profile.building = { summary: builder.buildingSummary };
  profile.open_to = builder.openTo;
  if (context.privacy.showOnlineStatus) {
    profile.online = isOnline(builder.lastActiveAt);
    profile.last_seen_at = builder.lastActiveAt ? isoStamp(builder.lastActiveAt) : null;
  }
  profile.member_since = builder.createdAt?.slice(0, 10) ?? null;
  if (context.privacy.emailContact) {
    const [account] = await query.select().from(users).where(eq(users.id, builder.userId));
    profile.email = account.email;
  }
  return profile;
}
