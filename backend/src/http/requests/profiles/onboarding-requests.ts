import { and, eq, inArray } from 'drizzle-orm';
import type pg from 'pg';
import { z } from 'zod';
import { orm } from '../../../db/orm';
import { neighbourhoods } from '../../../db/schema/neighbourhoods';
import { skills } from '../../../db/schema/skills';
import { BUILDER_ROLES, OPEN_TO } from '../../../enums/profiles';
import { message } from '../../validation/rules';

export const MAX_SKILLS = 12;

/** A neighbourhood id that exists. */
export const neighbourhoodId = (db: pg.Pool) =>
  z
    .number(message('profiles.errors.neighbourhood'))
    .int(message('profiles.errors.neighbourhood'))
    .refine(async (id) => {
      const [row] = await orm(db)
        .select({ id: neighbourhoods.id })
        .from(neighbourhoods)
        .where(eq(neighbourhoods.id, id));
      return row !== undefined;
    }, message('profiles.errors.neighbourhood'));

export const AboutRequest = (db: pg.Pool) =>
  z.object({
    name: z
      .string(message('identity.errors.nameRequired'))
      .max(100, message('identity.errors.nameMax')),
    neighbourhood_id: neighbourhoodId(db),
    role: z.enum(BUILDER_ROLES, message('profiles.errors.role')),
  });

/**
 * Up to 12 entries, each a catalogue skill `{id}` or a skill `{name}` (L2-006 criterion 2,
 * L2-007 criterion 2). Shared with the profile edit.
 */
export const skillEntries = (db: pg.Pool) =>
  z
    .array(
      z
        .object(
          {
            id: z.number(message('profiles.errors.skill')).int().nullish(),
            name: z
              .string(message('profiles.errors.skill'))
              .max(40, message('profiles.errors.skillNameMax'))
              .nullish(),
          },
          message('profiles.errors.skill'),
        )
        .refine(
          (entry) => entry.id != null || entry.name != null,
          message('profiles.errors.skill'),
        ),
      message('profiles.errors.skill'),
    )
    .max(MAX_SKILLS, message('profiles.errors.skillsMax'))
    .superRefine(async (entries, issues) => {
      const ids = entries.flatMap((entry) => (entry.id != null ? [entry.id] : []));
      if (ids.length === 0) return;
      const found = new Set(
        (
          await orm(db)
            .select({ id: skills.id })
            .from(skills)
            .where(and(inArray(skills.id, ids), eq(skills.isCatalogue, true)))
        ).map((row) => row.id),
      );
      entries.forEach((entry, i) => {
        if (entry.id != null && !found.has(entry.id)) {
          issues.addIssue({ code: 'custom', path: [i, 'id'], ...message('profiles.errors.skill') });
        }
      });
    });

export const SkillsRequest = (db: pg.Pool) => z.object({ skills: skillEntries(db) });

export const GoalsRequest = z.object({
  open_to: z.array(
    z.enum(OPEN_TO, message('profiles.errors.openTo')),
    message('profiles.errors.openTo'),
  ),
  building: z.string().max(280, message('profiles.errors.buildingMax')).nullish(),
});
