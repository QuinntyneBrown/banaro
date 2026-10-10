import { randomBytes } from 'node:crypto';
import { NOW, sql } from './backend';
import { createMember, type Member, type MemberOptions } from './members';

export interface BuilderOptions extends MemberOptions {
  neighbourhood?: string;
  role?: string;
  headline?: string;
  bio?: string;
  openTo?: string[];
}

export interface BuilderMember extends Member {
  builderId: string;
}

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** A member who finished onboarding, as if they had joined, verified and set up their profile. */
export function createBuilder(options: BuilderOptions = {}): BuilderMember {
  const member = createMember(options);
  const {
    neighbourhood = 'leslieville',
    role = 'founder',
    headline = null,
    bio = null,
    openTo = ['co_founding'],
  } = options as BuilderOptions & { headline?: string | null; bio?: string | null };
  // Crockford base32, lower case, as the API's ULIDs are.
  const builderId = Array.from(randomBytes(26), (b) => '0123456789abcdefghjkmnpqrstvwxyz'[b % 32]).join('');
  sql(`
    INSERT INTO builders (user_id, public_id, name, role, headline, bio, neighbourhood_id, open_to,
                          onboarding_saved_steps, onboarding_completed_at, created_at, updated_at)
    SELECT ${member.id}, ${quote(builderId)}, ${quote(member.name)}, ${quote(role)},
           ${headline === null ? 'NULL' : quote(headline)}, ${bio === null ? 'NULL' : quote(bio)},
           (SELECT id FROM neighbourhoods WHERE slug = ${quote(neighbourhood)}),
           ${quote(JSON.stringify(openTo))}::jsonb, '["about","skills","goals"]'::jsonb,
           ${NOW}, ${NOW}, ${NOW}`);
  return { ...member, builderId };
}
