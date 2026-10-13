import { createHmac, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import type pg from 'pg';
import { fromStamp, nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { stamp } from '../../db/schema/columns';
import type { User } from '../../db/schema/users';

/** One reset link per address: a bcrypt hash of its token, valid for 60 minutes (L2-004). */
const passwordResetTokens = pgTable('password_reset_tokens', {
  email: varchar('email', { length: 255 }).primaryKey(),
  token: varchar('token', { length: 255 }).notNull(),
  createdAt: stamp('created_at'),
});

const LIFETIME_MINUTES = 60;

/** A new token for the user, replacing any earlier one. Returns what the e-mailed link carries. */
export async function createResetToken(db: pg.Pool, user: User): Promise<string> {
  const token = createHmac('sha256', process.env.APP_KEY ?? '')
    .update(randomBytes(30).toString('base64url'))
    .digest('hex');
  await orm(db).transaction(async (tx) => {
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.email, user.email));
    await tx.insert(passwordResetTokens).values({
      email: user.email,
      token: await bcrypt.hash(token, Number(process.env.BCRYPT_ROUNDS ?? 12)),
      createdAt: nowStamp(),
    });
  });
  return token;
}

/** Whether the token is the user's current one and under 60 minutes old. */
export async function resetTokenIsValid(db: pg.Pool, user: User, token: string): Promise<boolean> {
  const [row] = await orm(db)
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.email, user.email));
  if (!row?.createdAt) return false;
  const expires = fromStamp(row.createdAt).getTime() + LIFETIME_MINUTES * 60 * 1000;
  return expires > Date.now() && (await bcrypt.compare(token, row.token));
}

/** Ends the address's link; takes the database or a transaction. */
export async function deleteResetToken(
  db: Pick<NodePgDatabase, 'delete'>,
  email: string,
): Promise<void> {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, email));
}
