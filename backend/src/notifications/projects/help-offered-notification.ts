import type { Project } from '../../db/schema/projects';
import type { User } from '../../db/schema/users';
import { greeting, webUrl } from '../../mail/layout';
import { t } from '../../services/user-experience/catalogue-service';
import type { MemberNotification } from '../member-notification';

/** Tells a project's owner that a member offered to help (L2-017 criterion 1, L2-029). */
export function helpOfferedNotification(project: Project, offerer: User): MemberNotification {
  const names = { offerer: offerer.name, project: project.name };
  return {
    type: 'App\\Notifications\\Projects\\HelpOfferedNotification',
    kind: 'help_offered',
    category: 'project_activity',
    subject: { type: 'project', id: project.publicId },
    params: names,
    actorUserId: offerer.id,
    mail: (owner) => ({
      subject: t('email.helpOffered.subject', names),
      greeting: greeting(owner.name),
      intro: [t('email.helpOffered.intro', names)],
      action: { text: t('email.helpOffered.action'), url: webUrl(`/projects/${project.publicId}`) },
    }),
  };
}
