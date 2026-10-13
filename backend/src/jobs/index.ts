import type { JobDefinition } from '../contracts/queue';
import { sendPasswordResetLink } from './identity/send-password-reset-link';
import { scanProfilePhoto } from './profiles/scan-profile-photo';
import { deliverContactMessage } from './public-site/deliver-contact-message';
import { sendMail } from './send-mail';

/** Every job the worker can run, by name. */
export const jobs = [
  deliverContactMessage,
  sendMail,
  sendPasswordResetLink,
  scanProfilePhoto,
] as JobDefinition<unknown>[];
