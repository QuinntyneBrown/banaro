import { randomBytes } from 'node:crypto';
import { banaro, NOW, sql } from './backend';
import { type Member } from './members';

/** Issues a reset link for a member, as the reset e-mail would carry it (the API stores a bcrypt hash). */
export function resetLink(member: Member, { ageMinutes = 0 } = {}): string {
  const token = randomBytes(32).toString('hex');
  const hash = banaro('bcrypt', token).trim();
  sql(`
    INSERT INTO password_reset_tokens (email, token, created_at)
    VALUES ('${member.email}', '${hash}', ${NOW} - interval '${ageMinutes} minutes')
    ON CONFLICT (email) DO UPDATE SET token = EXCLUDED.token, created_at = EXCLUDED.created_at`);
  return `/reset-password?token=${token}&email=${encodeURIComponent(member.email)}`;
}
