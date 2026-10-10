import { sql } from './backend';
import { STRONG_PASSWORD, uniqueEmail } from './people';

/** `PasswordPolicy::hash(STRONG_PASSWORD)`: bcrypt cost 12 of the SHA-256 pre-hash. */
const STRONG_PASSWORD_HASH = '$2y$12$izncmYqLHchEXRrQRTrjkODlqT5LSz/RzMONKpovH8gP78no1xmHG';

export interface Member {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface MemberOptions {
  name?: string;
  verified?: boolean;
}

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** Creates an account directly in the database, as if it had joined (and verified) earlier. */
export function createMember({ name = 'Amara Osei', verified = true }: MemberOptions = {}): Member {
  const email = uniqueEmail(name.split(' ')[0].toLowerCase());
  const id = Number(
    sql(`
      INSERT INTO users (name, email, password, email_verified_at, code_of_conduct_version,
                         code_of_conduct_accepted_at, created_at, updated_at)
      SELECT ${quote(name)}, ${quote(email)}, ${quote(STRONG_PASSWORD_HASH)},
             ${verified ? 'now()' : 'NULL'}, ${quote('2026-10-01')}, now(), now(), now()
      RETURNING id`),
  );
  return { id, name, email, password: STRONG_PASSWORD };
}
