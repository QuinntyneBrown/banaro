import { bigint, bigserial, numeric, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';
import { stamp } from './columns';

/** GTA places with a centroid and the directory area they belong to (D-026). */
export const neighbourhoods = pgTable('neighbourhoods', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  slug: varchar('slug', { length: 60 }).notNull().unique(),
  name: varchar('name', { length: 80 }).notNull(),
  area: varchar('area', { length: 80 }).notNull(),
  latitude: numeric('latitude', { precision: 9, scale: 6 }).notNull(),
  longitude: numeric('longitude', { precision: 9, scale: 6 }).notNull(),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
});

/** Great-circle kilometres between every pair of centroids, both directions. */
export const neighbourhoodDistances = pgTable(
  'neighbourhood_distances',
  {
    fromId: bigint('from_id', { mode: 'number' }).notNull(),
    toId: bigint('to_id', { mode: 'number' }).notNull(),
    km: numeric('km', { precision: 6, scale: 2 }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.fromId, table.toId] })],
);
