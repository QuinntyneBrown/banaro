import { eq, sql } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { PRIVACY_DEFAULTS, privacySettings, type PrivacySettings } from '../../db/schema/settings';

/** Who can see a profile, and how precisely others see where a builder is (L2-036). */
export const PROFILE_AUDIENCES = ['everyone', 'members'] as const;
export const LOCATION_PRECISIONS = ['neighbourhood', 'city'] as const;

/** A member's settings, or the defaults when they have never saved any. */
export async function privacyOf(db: pg.Pool, userId: number): Promise<PrivacySettings> {
  const [row] = await orm(db)
    .select()
    .from(privacySettings)
    .where(eq(privacySettings.userId, userId));
  return row ?? PRIVACY_DEFAULTS;
}

/** Stores the member's five privacy settings in one statement (L2-036 criterion 1). */
export async function savePrivacy(
  db: pg.Pool,
  userId: number,
  settings: PrivacySettings,
): Promise<PrivacySettings> {
  const now = nowStamp();
  const [row] = await orm(db)
    .insert(privacySettings)
    .values({ userId, ...settings, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: privacySettings.userId, set: { ...settings, updatedAt: now } })
    .returning();
  return row;
}

/** "City only" rounds every distance others see to the nearest 5 km (L2-036 criterion 3, D-046). */
export function shownDistance(settings: PrivacySettings, km: number): number {
  return settings.locationPrecision === 'city' ? Math.round(km / 5) * 5 : km;
}

/** The same rounding in SQL, over a query that joins the owners' settings as `ps`. */
export const sqlShownDistance = (km: ReturnType<typeof sql>) =>
  sql`(CASE WHEN ps.location_precision = 'city' THEN ROUND(${km} / 5.0) * 5 ELSE ${km} END)`;

export function privacyResource(settings: PrivacySettings) {
  return {
    profile_visibility: settings.profileVisibility,
    location_precision: settings.locationPrecision,
    email_contact: settings.emailContact,
    show_online_status: settings.showOnlineStatus,
    list_in_attendees: settings.listInAttendees,
  };
}
