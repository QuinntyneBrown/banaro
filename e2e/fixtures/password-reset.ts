import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { NOW, sql } from './backend';
import { type Member } from './members';

const repo = resolve(import.meta.dirname, '../..');

/** Issues a reset link for a member, as the reset e-mail would carry it (Laravel stores a bcrypt hash). */
export function resetLink(member: Member, { ageMinutes = 0 } = {}): string {
  const token = randomBytes(32).toString('hex');
  const hash = execFileSync(
    'docker',
    ['compose', 'exec', '-T', 'api', 'php', '-r', `echo password_hash('${token}', PASSWORD_BCRYPT);`],
    { cwd: repo, encoding: 'utf8' },
  ).trim();
  sql(`
    INSERT INTO password_reset_tokens (email, token, created_at)
    VALUES ('${member.email}', '${hash}', ${NOW} - interval '${ageMinutes} minutes')
    ON CONFLICT (email) DO UPDATE SET token = EXCLUDED.token, created_at = EXCLUDED.created_at`);
  return `/reset-password?token=${token}&email=${encodeURIComponent(member.email)}`;
}
