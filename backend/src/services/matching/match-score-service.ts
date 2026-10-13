import { sql, type SQL } from 'drizzle-orm';
import { fromStamp, nowStamp } from '../../clock';
import { matching } from '../../config/banaro';

export type MatchReason = { code: 'nearby'; km: number } | { code: 'recently_active' };

/** How well a builder fits the viewing member: 0–100 and the reasons (L2-022 criterion 4). */
export interface MatchScore {
  value: number;
  reasons: MatchReason[];
}

const { distance: wd, recentActivity: wa } = matching.scoreWeights;
const { defaultMaxKm: maxKm, activeDays, idleDays } = matching;

function activityFactor(lastActive: string | null): number {
  if (lastActive === null) return 0;
  const days = Math.abs(Date.now() - fromStamp(lastActive).getTime()) / 86_400_000;
  if (days <= activeDays) return 1;
  if (days >= idleDays) return 0;
  return (idleDays - days) / (idleDays - activeDays);
}

/**
 * Scores a candidate for the viewer (L2-022 criterion 4). Each factor is 0–1; the score is their
 * weighted mean × 100, rounded and clamped. Skill complement and open-to alignment need matching
 * preferences (L2-021); until they exist only distance and recent activity count, their weights
 * scaled up to fill the whole (D-041). `km` is the distance the viewer may see, or null.
 */
export function matchScore(km: number | null, lastActive: string | null): MatchScore {
  const distance = km === null ? 0 : Math.max(0, 1 - km / maxKm);
  const activity = activityFactor(lastActive);
  const value = Math.round((100 * (wd * distance + wa * activity)) / (wd + wa));
  const reasons: MatchReason[] = [];
  if (km !== null && km <= maxKm) reasons.push({ code: 'nearby', km: Math.round(km * 10) / 10 });
  if (activity >= 1) reasons.push({ code: 'recently_active' });
  return { value: Math.max(0, Math.min(100, value)), reasons };
}

/**
 * The same score as SQL, for ordering many builders at once. `km` is an expression for the distance
 * (null when unknown) and `lastActive` one for the candidate's last activity.
 */
export function sqlMatchScore(km: SQL, lastActive: SQL): SQL {
  const days = sql`(EXTRACT(EPOCH FROM (CAST(${nowStamp()} AS timestamp) - ${lastActive})) / 86400.0)`;
  const distance = sql`GREATEST(0, 1 - COALESCE(${km}, ${maxKm}) / ${maxKm})`;
  const activity = sql`(CASE WHEN ${lastActive} IS NULL THEN 0 WHEN ${days} <= ${activeDays} THEN 1 WHEN ${days} >= ${idleDays} THEN 0 ELSE (${idleDays} - ${days}) / ${idleDays - activeDays} END)`;
  return sql`LEAST(100, GREATEST(0, ROUND(100 * (${wd} * ${distance} + ${wa} * ${activity}) / ${wd + wa})))`;
}
