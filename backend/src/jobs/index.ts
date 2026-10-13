import type { JobDefinition } from '../contracts/queue';
import { deliverContactMessage } from './public-site/deliver-contact-message';
import { sendMail } from './send-mail';

/** Every job the worker can run, by name. */
export const jobs = [deliverContactMessage, sendMail] as JobDefinition<unknown>[];
