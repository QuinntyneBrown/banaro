import { randomBytes } from 'node:crypto';
import { NOW, sql } from './backend';
import { createMember, type Member, type MemberOptions } from './members';

export interface BuilderOptions extends MemberOptions {
  neighbourhood?: string;
  role?: string;
  headline?: string;
  bio?: string;
  openTo?: string[];
  /** Skill names in order; new ones join the skills table as custom skills. */
  skills?: string[];
  building?: string;
  /** Minutes since the builder's last request; omitted means never active. */
  activeMinutesAgo?: number;
  /** Days since the builder joined. */
  joinedDaysAgo?: number;
  /** Who can see the profile; new accounts are members only (L2-036). */
  visibility?: 'everyone' | 'members';
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
    skills = [],
    building = null,
    activeMinutesAgo = null,
    joinedDaysAgo = 0,
    visibility = 'members',
  } = options as BuilderOptions & {
    headline?: string | null;
    bio?: string | null;
    building?: string | null;
    activeMinutesAgo?: number | null;
  };
  // Crockford base32, lower case, as the API's ULIDs are.
  const builderId = Array.from(randomBytes(26), (b) => '0123456789abcdefghjkmnpqrstvwxyz'[b % 32]).join('');
  const literal = (value: string | null) => (value === null ? 'NULL' : quote(value));
  // The directory's search text, as the API's normaliser writes it (ASCII names in fixtures).
  const searchText = [member.name, headline, building, ...skills]
    .filter((part): part is string => !!part)
    .join(' ')
    .toLowerCase();
  const lastActive = activeMinutesAgo === null ? 'NULL' : `${NOW} - interval '${activeMinutesAgo} minutes'`;
  const joined = `${NOW} - interval '${joinedDaysAgo} days'`;
  sql(`
    INSERT INTO builders (user_id, public_id, name, role, headline, bio, neighbourhood_id, open_to,
                          building_summary, search_text, last_active_at,
                          onboarding_saved_steps, onboarding_completed_at, created_at, updated_at)
    SELECT ${member.id}, ${quote(builderId)}, ${quote(member.name)}, ${quote(role)},
           ${literal(headline)}, ${literal(bio)},
           (SELECT id FROM neighbourhoods WHERE slug = ${quote(neighbourhood)}),
           ${quote(JSON.stringify(openTo))}::jsonb, ${literal(building)}, ${quote(searchText)}, ${lastActive},
           '["about","skills","goals"]'::jsonb, ${NOW}, ${joined}, ${NOW}`);
  skills.forEach((skill, i) => {
    sql(`
      INSERT INTO skills (name, slug, normalized_name, is_catalogue, created_at, updated_at)
      VALUES (${quote(skill)}, ${quote(skill.toLowerCase().replace(/[^a-z0-9]+/g, '-'))},
              ${quote(skill.toLowerCase())}, false, ${NOW}, ${NOW})
      ON CONFLICT (normalized_name) DO NOTHING;
      INSERT INTO builder_skill (builder_id, skill_id, position)
      SELECT b.id, s.id, ${i + 1} FROM builders b, skills s
      WHERE b.public_id = ${quote(builderId)} AND s.normalized_name = ${quote(skill.toLowerCase())}`);
  });
  if (visibility !== 'members') {
    sql(`INSERT INTO privacy_settings (user_id, profile_visibility, created_at, updated_at)
         VALUES (${member.id}, ${quote(visibility)}, ${NOW}, ${NOW})`);
  }
  return { ...member, builderId };
}
