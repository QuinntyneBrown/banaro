import type { EmailCategory } from '../../src/services/settings/email-preference-service';
import type { MemberNotification } from '../../src/notifications/member-notification';

/** A stand-in producer for notification tests: the real ones arrive with projects and others. */
export function probeNotification(
  subjectId = 'p1',
  category: EmailCategory | null = 'project_activity',
  actorUserId: number | null = null,
): MemberNotification {
  return {
    type: 'Probe',
    kind: 'feedback_received',
    category,
    subject: { type: 'project', id: subjectId },
    params: { title: 'Psalter' },
    actorUserId,
    mail: () => ({ subject: 'New feedback on Psalter', intro: ['Someone left feedback.'] }),
  };
}
