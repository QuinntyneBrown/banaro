import { randomBytes } from 'node:crypto';
import { NOW, sql } from './backend';
import { type Member } from './members';

export interface ProjectOptions {
  name?: string;
  summary?: string;
  description?: string | null;
  stage?: string;
  lookingFor?: string[];
  link?: string | null;
  /** Days since the project's last activity. */
  activeDaysAgo?: number;
}

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;
const literal = (value: string | null) => (value === null ? 'NULL' : quote(value));

/** A project owned by `owner`, as if they had shared it. Returns its public id. */
export function createProject(owner: Member, options: ProjectOptions = {}): string {
  const {
    name = 'Harvest',
    summary = 'Volunteer scheduling for GTA food banks',
    description = null,
    stage = 'pilot',
    lookingFor = [],
    link = null,
    activeDaysAgo = 0,
  } = options;
  const id = Array.from(randomBytes(26), (b) => '0123456789abcdefghjkmnpqrstvwxyz'[b % 32]).join('');
  const active = `${NOW} - interval '${activeDaysAgo} days'`;
  sql(`
    INSERT INTO projects (public_id, owner_id, name, summary, description, stage, link, feedback_count,
                          last_activity_at, search_text, created_at, updated_at)
    VALUES (${quote(id)}, ${owner.id}, ${quote(name)}, ${quote(summary)}, ${literal(description)},
            ${quote(stage)}, ${literal(link)}, 0, ${active}, ${quote(`${name} ${summary}`.toLowerCase())},
            ${active}, ${active})`);
  for (const role of lookingFor) {
    sql(`INSERT INTO project_looking_for (project_id, role)
         SELECT id, ${quote(role)} FROM projects WHERE public_id = ${quote(id)}`);
  }
  return id;
}
