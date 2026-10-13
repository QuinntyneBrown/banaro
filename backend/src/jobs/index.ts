import type { JobDefinition } from '../contracts/queue';
import { deliverContactMessage } from './public-site/deliver-contact-message';

/** Every job the worker can run, by name. */
export const jobs = [deliverContactMessage] as JobDefinition<unknown>[];
