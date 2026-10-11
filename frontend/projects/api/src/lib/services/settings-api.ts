import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LocationPrecision, PrivacySettings, ProfileVisibility } from '../models/settings';

export interface SettingsApi {
  getPrivacy(): Observable<PrivacySettings>;
  updatePrivacy(settings: PrivacySettings): Observable<PrivacySettings>;
}

export const SETTINGS_API = new InjectionToken<SettingsApi>('SETTINGS_API');

interface PrivacyBody {
  profile_visibility: ProfileVisibility;
  location_precision: LocationPrecision;
  email_contact: boolean;
  show_online_status: boolean;
  list_in_attendees: boolean;
}

function toPrivacy(body: PrivacyBody): PrivacySettings {
  return {
    profileVisibility: body.profile_visibility,
    locationPrecision: body.location_precision,
    emailContact: body.email_contact,
    showOnlineStatus: body.show_online_status,
    listInAttendees: body.list_in_attendees,
  };
}

@Injectable()
export class HttpSettingsApi implements SettingsApi {
  private readonly http = inject(HttpClient);

  getPrivacy(): Observable<PrivacySettings> {
    return this.http.get<PrivacyBody>('/api/v1/settings/privacy').pipe(map(toPrivacy));
  }

  updatePrivacy(settings: PrivacySettings): Observable<PrivacySettings> {
    return this.http
      .put<PrivacyBody>('/api/v1/settings/privacy', {
        profile_visibility: settings.profileVisibility,
        location_precision: settings.locationPrecision,
        email_contact: settings.emailContact,
        show_online_status: settings.showOnlineStatus,
        list_in_attendees: settings.listInAttendees,
      })
      .pipe(map(toPrivacy));
  }
}
