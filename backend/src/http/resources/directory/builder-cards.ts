import { and, asc, eq, inArray } from 'drizzle-orm';
import type pg from 'pg';
import type { DirectoryRow } from '../../../actions/directory/search-directory';
import { fromStamp, isoStamp } from '../../../clock';
import { presence } from '../../../config/banaro';
import { orm } from '../../../db/orm';
import { builderSkill, builders, profilePhotos, type Builder } from '../../../db/schema/builders';
import { neighbourhoods } from '../../../db/schema/neighbourhoods';
import { PRIVACY_DEFAULTS, privacySettings, type PrivacySettings } from '../../../db/schema/settings';
import { skills } from '../../../db/schema/skills';

/** What a card needs beyond the builder row, loaded for a whole page at once. */
export interface CardContext {
  neighbourhood: { name: string; area: string } | null;
  skills: string[];
  photoUrl: string | null;
  privacy: PrivacySettings;
}

/** Loads builders in the given order with what their cards show, in five queries in all. */
export async function loadCards(db: pg.Pool, ids: number[]) {
  if (ids.length === 0) return [];
  const query = orm(db);
  const rows = await query.select().from(builders).where(inArray(builders.id, ids));
  const hoods = await query.select().from(neighbourhoods);
  const skillRows = await query
    .select({ builderId: builderSkill.builderId, name: skills.name })
    .from(builderSkill)
    .innerJoin(skills, eq(skills.id, builderSkill.skillId))
    .where(inArray(builderSkill.builderId, ids))
    .orderBy(asc(builderSkill.position));
  const photoIds = rows.flatMap((row) => (row.photoId ? [row.photoId] : []));
  const ready = new Set(
    photoIds.length
      ? (
          await query
            .select({ id: profilePhotos.id })
            .from(profilePhotos)
            .where(and(inArray(profilePhotos.id, photoIds), eq(profilePhotos.status, 'ready')))
        ).map((row) => row.id)
      : [],
  );
  const privacy = new Map(
    (
      await query
        .select()
        .from(privacySettings)
        .where(inArray(privacySettings.userId, rows.map((row) => row.userId)))
    ).map((row) => [row.userId, row]),
  );

  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => {
    const builder = byId.get(id)!;
    const hood = hoods.find((h) => h.id === builder.neighbourhoodId);
    const context: CardContext = {
      neighbourhood: hood ? { name: hood.name, area: hood.area } : null,
      skills: skillRows.filter((row) => row.builderId === id).map((row) => row.name),
      photoUrl: builder.photoId && ready.has(builder.photoId) ? `/api/v1/photos/${builder.photoId}` : null,
      privacy: privacy.get(builder.userId) ?? PRIVACY_DEFAULTS,
    };
    return { builder, context };
  });
}

/** The neighbourhood, or only the city (its area) for "City only" (L2-036 criterion 3). */
function place({ neighbourhood, privacy }: CardContext) {
  if (!neighbourhood) return null;
  const cityOnly = privacy.locationPrecision === 'city';
  return { name: cityOnly ? neighbourhood.area : neighbourhood.name, area: neighbourhood.area };
}

/**
 * The card a visitor sees: name, role, neighbourhood, skills and photo only. Member-only facts are
 * absent, not null (L2-009 criterion 6).
 */
export function publicCard(builder: Builder, context: CardContext) {
  return {
    id: builder.publicId,
    name: builder.name,
    role: builder.role,
    headline: builder.headline,
    neighbourhood: place(context),
    skills: context.skills,
    photo_url: context.photoUrl,
  };
}

export function isOnline(lastActive: string | null): boolean {
  return (
    lastActive !== null &&
    fromStamp(lastActive).getTime() >= Date.now() - presence.onlineMinutes * 60 * 1000
  );
}

/**
 * The card a member sees: the visitor card plus distance, match score, what the builder is
 * building, what they are open to and their online status (L2-009 criterion 1).
 */
export function memberCard(builder: Builder, context: CardContext, row: DirectoryRow) {
  const { photo_url, ...card } = publicCard(builder, context);
  return {
    ...card,
    distance_km: row.distanceKm === null ? null : Math.round(row.distanceKm * 10) / 10,
    match_score: row.matchScore,
    building: builder.buildingSummary,
    open_to: builder.openTo,
    // Hidden online status is left out, not nulled (L2-036 criterion 1).
    ...(context.privacy.showOnlineStatus && {
      online: isOnline(builder.lastActiveAt),
      last_seen_at: builder.lastActiveAt ? isoStamp(builder.lastActiveAt) : null,
    }),
    photo_url,
  };
}
