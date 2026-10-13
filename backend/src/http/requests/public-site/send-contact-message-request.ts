import { z } from 'zod';
import { CONTACT_TOPICS } from '../../../enums/contact-topic';
import { t } from '../../../services/user-experience/catalogue-service';

const message = (key: string) => ({ error: () => t(key) });

export const SendContactMessageRequest = z.object({
  name: z
    .string(message('contact.errors.nameRequired'))
    .max(100, message('contact.errors.nameMax')),
  email: z.email(message('contact.errors.email')).max(254, message('contact.errors.email')),
  topic: z.enum(CONTACT_TOPICS, message('contact.errors.topic')),
  message: z
    .string(message('contact.errors.messageRequired'))
    .min(10, message('contact.errors.messageMin'))
    .max(2000, message('contact.errors.messageMax')),
  // Honeypot: hidden from people, so only bots fill it in.
  website: z.string().max(500).nullish(),
});
