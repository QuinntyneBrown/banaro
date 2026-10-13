/** Topics of the contact form (L2-040 criterion 2, D-010). */
export const CONTACT_TOPICS = [
  'general',
  'partnership',
  'press',
  'report-problem',
  'propose-event',
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

/** Catalogue key of a topic's label: `report-problem` becomes `contact.topics.reportProblem`. */
export function contactTopicLabelKey(topic: ContactTopic): string {
  return `contact.topics.${topic.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())}`;
}
