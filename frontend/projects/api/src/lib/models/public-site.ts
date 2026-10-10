/** Contact topics (L2-040 criterion 2). */
export const CONTACT_TOPICS = [
  'general',
  'partnership',
  'press',
  'report-problem',
  'propose-event',
] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export interface ContactMessageRequest {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  /** Honeypot: people leave it empty. */
  website: string;
}
