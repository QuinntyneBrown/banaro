/** Matching and directory settings (D-041). */
export const matching = {
  scoreWeights: { skillComplement: 0.35, openTo: 0.3, distance: 0.2, recentActivity: 0.15 },
  /** Activity counts fully within this many days... */
  activeDays: 7,
  /** ...and not at all from this many. */
  idleDays: 60,
  /** Distance scores nothing at this many kilometres. */
  defaultMaxKm: 40,
};

/** "Online now" means a request in the last 5 minutes (D-041). */
export const presence = { onlineMinutes: 5 };
