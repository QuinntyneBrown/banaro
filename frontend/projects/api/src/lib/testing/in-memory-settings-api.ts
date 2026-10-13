import { Observable, of } from 'rxjs';
import { PrivacySettings } from '../models/settings';
import { SettingsApi } from '../services/settings-api';

/** Fake of the contract for tests: one member's settings, starting at the defaults. */
export class InMemorySettingsApi implements SettingsApi {
  privacy: PrivacySettings = {
    profileVisibility: 'members',
    locationPrecision: 'neighbourhood',
    emailContact: false,
    showOnlineStatus: true,
    listInAttendees: false,
  };

  getPrivacy(): Observable<PrivacySettings> {
    return of(this.privacy);
  }

  updatePrivacy(settings: PrivacySettings): Observable<PrivacySettings> {
    this.privacy = settings;
    return of(settings);
  }
}
