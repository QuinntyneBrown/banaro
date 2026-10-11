/** Who can see a profile (L2-036). */
export type ProfileVisibility = 'everyone' | 'members';

/** How precisely others see where a builder is (L2-036 criterion 3). */
export type LocationPrecision = 'neighbourhood' | 'city';

/** A member's five privacy settings (L2-036). */
export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  locationPrecision: LocationPrecision;
  emailContact: boolean;
  showOnlineStatus: boolean;
  listInAttendees: boolean;
}
