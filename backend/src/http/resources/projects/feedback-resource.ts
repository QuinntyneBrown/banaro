import type pg from 'pg';
import { isoStamp } from '../../../clock';
import type { Feedback } from '../../../db/schema/projects';
import { memberLinks, unknownMember } from './member-links';

/**
 * Feedback with its authors linked by profile id. The text is plain; the page encodes it on output
 * (L2-045 criterion 5).
 */
export async function feedbackResources(db: pg.Pool, rows: Feedback[]) {
  const authors = await memberLinks(
    db,
    rows.map((row) => row.authorId),
  );
  return rows.map((row) => ({
    id: String(row.id),
    body: row.body,
    created_at: row.createdAt ? isoStamp(row.createdAt) : null,
    author: authors.get(row.authorId) ?? unknownMember,
  }));
}
