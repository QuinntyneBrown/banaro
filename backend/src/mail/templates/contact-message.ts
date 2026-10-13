import type { Mail } from '../../contracts/mailer';
import { contactTopicLabelKey, type ContactTopic } from '../../enums/contact-topic';
import { t } from '../../services/user-experience/catalogue-service';

export interface ContactMessage {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
}

/** Plain-text contact message to the team inbox, replying to the sender. */
export function contactMessageMail(to: string, contact: ContactMessage): Mail {
  const topic = t(contactTopicLabelKey(contact.topic));
  return {
    to,
    replyTo: { name: contact.name, address: contact.email },
    subject: t('contact.mail.subject', { topic }),
    text: [
      `${t('contact.mail.from')}: ${contact.name} <${contact.email}>`,
      `${t('contact.mail.topic')}: ${topic}`,
      '',
      contact.message,
      '',
    ].join('\n'),
  };
}
