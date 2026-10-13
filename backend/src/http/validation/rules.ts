import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { PASSWORD_MAX, PASSWORD_MIN } from '../../services/identity/password-policy';
import { t } from '../../services/user-experience/catalogue-service';

/** A message from the catalogue, for the zod `error` option. */
export const message = (key: string) => ({ error: () => t(key) });

/** E-mail address for every form; control characters, CR and LF included, never pass. */
export const emailAddress = (key: string) => z.email(message(key)).max(254, message(key));

let common: Set<string> | undefined;

/** The 10,000 most common passwords, compared ignoring case (L2-001 criterion 8). */
function isCommon(password: string): boolean {
  common ??= new Set(
    readFileSync(path.join(process.cwd(), 'resources/security/common-passwords.txt'), 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.toLowerCase()),
  );
  return common.has(password.toLowerCase());
}

/** A new password: 12 to 128 characters and not a common one (L2-001). */
export const newPassword = () =>
  z
    .string(message('identity.errors.passwordRequired'))
    .min(PASSWORD_MIN, message('identity.errors.passwordMin'))
    .max(PASSWORD_MAX, message('identity.errors.passwordMax'))
    .refine((password) => !isCommon(password), message('identity.errors.passwordCommon'));

/** A ticked box: what Laravel's `accepted` rule took. */
export const accepted = (key: string) =>
  z.union([z.literal(true), z.literal(1), z.enum(['1', 'true', 'yes', 'on'])], message(key));

/** A whole number from a query string, or nothing. */
const queryInt = (schema: z.ZodNumber) =>
  z.preprocess((value) => (value == null ? undefined : Number(value)), schema.int().optional());

/** A page number: 1 or more. */
export const pageNumber = () => queryInt(z.number().min(1));

/** A page size: 1 to 50 (L2-047 criterion 4). */
export const pageSize = () => queryInt(z.number().min(1).max(50));

/** true or false, as Laravel's `boolean` rule took them. */
export const booleanField = () =>
  z
    .union([z.boolean(), z.literal(0), z.literal(1), z.enum(['0', '1'])])
    .transform((value) => value === true || value === 1 || value === '1');
