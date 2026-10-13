import { z } from 'zod';
import { LOCATION_PRECISIONS, PROFILE_AUDIENCES } from '../../../services/settings/privacy-service';
import { booleanField } from '../../validation/rules';

/** All five privacy settings, every time (L2-036 criterion 1, L2-045). */
export const UpdatePrivacyRequest = z
  .object({
    profile_visibility: z.enum(PROFILE_AUDIENCES),
    location_precision: z.enum(LOCATION_PRECISIONS),
    email_contact: booleanField(),
    show_online_status: booleanField(),
    list_in_attendees: booleanField(),
  })
  .transform((input) => ({
    profileVisibility: input.profile_visibility,
    locationPrecision: input.location_precision,
    emailContact: input.email_contact,
    showOnlineStatus: input.show_online_status,
    listInAttendees: input.list_in_attendees,
  }));
