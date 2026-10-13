import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';

/** Password limits shared by join, reset and sign-in (L2-001, L2-004). */
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

/**
 * bcrypt after a SHA-256 pre-hash, so the 72-byte bcrypt limit never ignores part of a long
 * password (L2-001 criterion 7). Hashes the Laravel API wrote ($2y$) verify the same way.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(prehash(password), Number(process.env.BCRYPT_ROUNDS ?? 12));
}

export async function checkPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(prehash(password), hash);
}

function prehash(password: string): string {
  return createHash('sha256').update(password).digest('base64');
}
