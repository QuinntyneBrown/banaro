/** One builder the member has blocked (L2-032 criterion 3). */
export interface BlockedBuilder {
  builderId: string;
  name: string;
  photoUrl: string | null;
  blockedAt: string;
}
