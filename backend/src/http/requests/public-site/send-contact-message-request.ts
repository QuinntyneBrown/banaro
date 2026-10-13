import { z } from 'zod';
import { CONTACT_TOPICS } from '../../../enums/contact-topic';
import { emailAddress, message } from '../../validation/rules';

export const SendContactMessageRequest = z.object({
  name: z
    .string(message('contact.errors.nameRequired'))
    .max(100, message('contact.errors.nameMax')),
  email: emailAddress('contact.errors.email'),
  topic: z.enum(CONTACT_TOPICS, message('contact.errors.topic')),
  message: z
    .string(message('contact.errors.messageRequired'))
    .min(10, message('contact.errors.messageMin'))
    .max(2000, message('contact.errors.messageMax')),
  // Honeypot: hidden from people, so only bots fill it in.
  website: z.string().max(500).nullish(),
});
