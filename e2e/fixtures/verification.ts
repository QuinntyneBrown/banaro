import { createHash, randomBytes } from 'node:crypto';
import { NOW, sql } from './backend';

export interface LinkOptions {
  /** Hours since the link was sent; links older than 24 hours have expired. */
  ageHours?: number;
}

/** Issues a verification link for an account, as the verification e-mail would carry it. */
export function verificationLink(userId: number, { ageHours = 0 }: LinkOptions = {}): string {
  const token = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(token).digest('hex');
  sql(`
    INSERT INTO email_verifications (user_id, token_hash, expires_at, created_at)
    VALUES (${userId}, '${hash}', ${NOW} + interval '${24 - ageHours} hours',
            ${NOW} - interval '${ageHours} hours')`);
  return `/verify-email?token=${token}`;
}

/** A well-formed link that no account was sent. */
export function unknownVerificationLink(): string {
  return `/verify-email?token=${randomBytes(32).toString('hex')}`;
}

export function isVerified(userId: number): boolean {
  return sql(`SELECT email_verified_at IS NOT NULL FROM users WHERE id = ${userId}`) === 't';
}
