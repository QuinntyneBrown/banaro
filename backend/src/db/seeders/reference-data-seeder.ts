import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { neighbourhoodDistances, neighbourhoods } from '../schema/neighbourhoods';
import { normalizeSkill, skills, slugify } from '../schema/skills';

/**
 * Name, directory area, latitude, longitude (D-026). Old City of Toronto neighbourhoods group under
 * "Downtown Toronto", as the directory's counts do; Willowdale groups under North York.
 */
const NEIGHBOURHOODS: [string, string, number, number][] = [
  ['Downtown Toronto', 'Downtown Toronto', 43.6532, -79.3832],
  ['Leslieville', 'Downtown Toronto', 43.6627, -79.333],
  ['Riverdale', 'Downtown Toronto', 43.669, -79.349],
  ['The Danforth', 'Downtown Toronto', 43.678, -79.348],
  ['The Annex', 'Downtown Toronto', 43.67, -79.404],
  ['Kensington Market', 'Downtown Toronto', 43.6545, -79.4005],
  ['Liberty Village', 'Downtown Toronto', 43.638, -79.421],
  ['Roncesvalles', 'Downtown Toronto', 43.646, -79.449],
  ['The Junction', 'Downtown Toronto', 43.6655, -79.469],
  ['North York', 'North York', 43.7615, -79.4111],
  ['Willowdale', 'North York', 43.77, -79.413],
  ['Scarborough', 'Scarborough', 43.7731, -79.2578],
  ['Etobicoke', 'Etobicoke', 43.6205, -79.5132],
  ['Mississauga', 'Mississauga', 43.589, -79.6441],
  ['Brampton', 'Brampton', 43.7315, -79.7624],
  ['Markham', 'Markham', 43.8561, -79.337],
  ['Vaughan', 'Vaughan', 43.8361, -79.4983],
  ['Richmond Hill', 'Richmond Hill', 43.8828, -79.4403],
  ['Oakville', 'Oakville', 43.4675, -79.6877],
  ['Pickering', 'Pickering', 43.8384, -79.0868],
  ['Ajax', 'Ajax', 43.8509, -79.0204],
];

/** The onboarding catalogue, in the order the skills step shows it (D-027). */
const CATALOGUE = [
  'React',
  'Figma',
  'Python',
  'Product strategy',
  'User research',
  'Laravel',
  'Data/ML',
  'Marketing',
  'Angular',
  'Swift',
  'Kotlin',
  'Fundraising',
];

/** GTA neighbourhoods with their distances, and the skill catalogue. Keyed upserts (L2-054). */
export async function seedReferenceData(db: NodePgDatabase): Promise<void> {
  const now = sql`now()`;

  await db
    .insert(neighbourhoods)
    .values(
      NEIGHBOURHOODS.map(([name, area, latitude, longitude]) => ({
        slug: slugify(name),
        name,
        area,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        createdAt: now,
        updatedAt: now,
      })),
    )
    .onConflictDoUpdate({
      target: neighbourhoods.slug,
      set: {
        name: sql`excluded.name`,
        area: sql`excluded.area`,
        latitude: sql`excluded.latitude`,
        longitude: sql`excluded.longitude`,
        updatedAt: now,
      },
    });

  const places = await db.select().from(neighbourhoods);
  await db
    .insert(neighbourhoodDistances)
    .values(
      places.flatMap((from) =>
        places.map((to) => ({ fromId: from.id, toId: to.id, km: km(from, to).toFixed(2) })),
      ),
    )
    .onConflictDoUpdate({
      target: [neighbourhoodDistances.fromId, neighbourhoodDistances.toId],
      set: { km: sql`excluded.km` },
    });

  await db
    .insert(skills)
    .values(
      CATALOGUE.map((name, i) => ({
        name,
        slug: slugify(name.replace('/', ' ')),
        normalizedName: normalizeSkill(name),
        isCatalogue: true,
        cataloguePosition: i + 1,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .onConflictDoUpdate({
      target: skills.normalizedName,
      set: {
        name: sql`excluded.name`,
        slug: sql`excluded.slug`,
        isCatalogue: sql`excluded.is_catalogue`,
        cataloguePosition: sql`excluded.catalogue_position`,
        updatedAt: now,
      },
    });
}

interface Point {
  latitude: string;
  longitude: string;
}

/** Great-circle kilometres (haversine). */
function km(a: Point, b: Point): number {
  const rad = (degrees: string) => (Number(degrees) * Math.PI) / 180;
  const lat1 = rad(a.latitude);
  const lat2 = rad(b.latitude);
  const dLat = lat2 - lat1;
  const dLng = rad(b.longitude) - rad(a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}
