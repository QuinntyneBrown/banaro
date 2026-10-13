import { createHash, randomInt } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { emailVerifications } from '../../db/schema/email-verifications';
import { users, type User } from '../../db/schema/users';
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

/**
 * Verifies the account behind an unused, unexpired link and marks the link used, in one
 * transaction; the row lock makes two openings of one link verify once (L2-002 criteria 1, 2).
 * False for an unknown, used or expired link, which changes nothing.
 */
export async function consumeVerificationLink(db: pg.Pool, token: string): Promise<boolean> {
  return orm(db).transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.tokenHash, hashToken(token)))
      .for('update');
    const now = nowStamp();
    if (!row || row.usedAt !== null || row.expiresAt <= now) return false;
    await tx
      .update(emailVerifications)
      .set({ usedAt: now })
      .where(eq(emailVerifications.id, row.id));
    await tx
      .update(users)
      .set({ emailVerifiedAt: now })
      .where(and(eq(users.id, row.userId), isNull(users.emailVerifiedAt)));
    return true;
  });
}

/** The account a link was issued to, whether or not the link is still usable. */
export async function userForVerificationLink(db: pg.Pool, token: string): Promise<User | null> {
  const [row] = await orm(db)
    .select({ user: users })
    .from(emailVerifications)
    .innerJoin(users, eq(users.id, emailVerifications.userId))
    .where(eq(emailVerifications.tokenHash, hashToken(token)));
  return row?.user ?? null;
}
