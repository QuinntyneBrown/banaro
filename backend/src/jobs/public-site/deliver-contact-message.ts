import type { JobDefinition } from '../../contracts/queue';
import { contactMessageMail, type ContactMessage } from '../../mail/templates/contact-message';

/** Mails a contact message to the team inbox (L2-040, D-014). */
export const deliverContactMessage: JobDefinition<ContactMessage> = {
  name: 'DeliverContactMessage',
  queue: 'mail',
  attempts: 5,
  backoff: [10, 60, 300, 900],
  async handle(message, deps) {
    const inbox = process.env.BANARO_CONTACT_INBOX ?? 'team@banaro.ca';
    await deps.mailer.send(contactMessageMail(inbox, message));
  },
};
