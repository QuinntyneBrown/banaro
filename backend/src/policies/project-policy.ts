import { HttpError } from '../http/pipeline';
import type { Project } from '../db/schema/projects';
import type { User } from '../db/schema/users';

/** Only the owner changes or removes a project; anyone else gets 403 (L2-014 criterion 2). */
export function authorizeChange(user: User, project: Project): void {
  if (project.ownerId !== user.id) {
    throw new HttpError(403, { message: 'This action is unauthorized.' });
  }
}
