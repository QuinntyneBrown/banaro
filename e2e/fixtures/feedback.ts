import { NOW, sql } from './backend';
import { type Member } from './members';

export interface FeedbackOptions {
  body?: string;
  /** Days since it was posted. */
  daysAgo?: number;
}

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** A piece of feedback by `author` on a project, as if they had posted it; the project's count rises with it. */
export function createFeedback(projectId: string, author: Member, options: FeedbackOptions = {}): void {
  const { body = 'The review queue is lovely. Could the streak count be optional?', daysAgo = 0 } = options;
  const posted = `${NOW} - interval '${daysAgo} days'`;
  sql(`
    INSERT INTO feedback (project_id, author_id, body, created_at, updated_at)
    SELECT id, ${author.id}, ${quote(body)}, ${posted}, ${posted} FROM projects WHERE public_id = ${quote(projectId)}`);
  sql(`UPDATE projects SET feedback_count = feedback_count + 1 WHERE public_id = ${quote(projectId)}`);
}
