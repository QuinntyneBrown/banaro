import { createHash, randomInt } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { emailVerifications } from '../../db/schema/email-verifications';
import { webUrl } from '../../mail/layout';

const LIFETIME_HOURS = 24;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** A random token of letters and digits. */
export function randomToken(length: number): string {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
}

/**
 * Issues a single-use, 24-hour verification link (L2-002). Only a hash of the token is stored, and
 * issuing a new link ends every earlier unused one. Returns the link for the e-mail.
 */
export async function issueVerificationLink(db: pg.Pool, userId: number): Promise<string> {
  const token = randomToken(64);
  await orm(db).transaction(async (tx) => {
    await tx
      .delete(emailVerifications)
      .where(and(eq(emailVerifications.userId, userId), isNull(emailVerifications.usedAt)));
    await tx.insert(emailVerifications).values({
      userId,
      tokenHash: hashToken(token),
      expiresAt: nowStamp(LIFETIME_HOURS * 3600),
      createdAt: nowStamp(),
    });
  });
  return webUrl(`/verify-email?token=${token}`);
}
