import { NOW, sql } from './backend';
import { type Member } from './members';

export interface HelpOfferOptions {
  role?: string;
  message?: string;
  status?: 'pending' | 'accepted' | 'declined';
}

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** An offer by `offerer` to help with a project, as if they had sent it. */
export function createHelpOffer(projectId: string, offerer: Member, options: HelpOfferOptions = {}): void {
  const { role = 'contributor', message = 'I can review the code on weekends.', status = 'pending' } = options;
  sql(`
    INSERT INTO help_offers (project_id, offerer_id, role, message, status, created_at, updated_at)
    SELECT id, ${offerer.id}, ${quote(role)}, ${quote(message)}, ${quote(status)}, ${NOW}, ${NOW}
    FROM projects WHERE public_id = ${quote(projectId)}`);
}
