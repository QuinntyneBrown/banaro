import type { Project } from '../../db/schema/projects';
import type { User } from '../../db/schema/users';
import { greeting, webUrl } from '../../mail/layout';
import { t } from '../../services/user-experience/catalogue-service';
import type { MemberNotification } from '../member-notification';

/** Tells a project's owner that someone left feedback (L2-016 criterion 1, L2-029). */
export function feedbackReceivedNotification(project: Project, author: User): MemberNotification {
  return {
    type: 'App\\Notifications\\Projects\\FeedbackReceivedNotification',
    kind: 'feedback_received',
    category: 'project_activity',
    subject: { type: 'project', id: project.publicId },
    params: { project: project.name, author: author.name },
    actorUserId: author.id,
    mail: (owner) => ({
      subject: t('email.feedbackReceived.subject', { project: project.name }),
      greeting: greeting(owner.name),
      intro: [t('email.feedbackReceived.intro', { author: author.name, project: project.name })],
      action: {
        text: t('email.feedbackReceived.action'),
        url: webUrl(`/projects/${project.publicId}`),
      },
    }),
  };
}
