import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type pg from 'pg';
import { orm } from '../../db/orm';
import { users, type User } from '../../db/schema/users';
import { EMAIL_CATEGORIES, type EmailCategory } from './email-preference-service';

function key(): string {
  return (
    process.env.BANARO_UNSUBSCRIBE_KEY ??
    createHash('sha256')
      .update(`unsubscribe|${process.env.APP_KEY ?? ''}`)
      .digest('hex')
  );
}

const sign = (payload: string) => createHmac('sha256', key()).update(payload).digest('base64url');

/**
 * The one-click unsubscribe token in e-mail links (L2-029 criterion 3, L2-037):
 * base64url("{user id}:{category}") + "." + base64url(HMAC-SHA256). It has no expiry (D-055).
 */
export function issueUnsubscribeToken(userId: number, category: EmailCategory): string {
  const payload = Buffer.from(`${userId}:${category}`).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

/** The member and category a token names, or null when it is forged or its account is gone. */
export async function verifyUnsubscribeToken(
  db: pg.Pool,
  token: string,
): Promise<{ user: User; category: EmailCategory } | null> {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  const [id, category] = Buffer.from(payload, 'base64url').toString().split(':');
  if (!/^\d+$/.test(id ?? '') || !EMAIL_CATEGORIES.includes(category as EmailCategory)) return null;
  const [user] = await orm(db)
    .select()
    .from(users)
    .where(eq(users.id, Number(id)));
  return user ? { user, category: category as EmailCategory } : null;
}
