import type { JobDefinition } from '../contracts/queue';
import { sendPasswordResetLink } from './identity/send-password-reset-link';
import { deliverContactMessage } from './public-site/deliver-contact-message';
import { sendMail } from './send-mail';

/** Every job the worker can run, by name. */
export const jobs = [
  deliverContactMessage,
  sendMail,
  sendPasswordResetLink,
] as JobDefinition<unknown>[];
