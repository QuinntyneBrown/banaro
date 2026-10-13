import type pg from 'pg';
import { z } from 'zod';
import { OPEN_TO } from '../../../enums/profiles';
import { t } from '../../../services/user-experience/catalogue-service';
import { message } from '../../validation/rules';
import { neighbourhoodId, skillEntries } from './onboarding-requests';

const isoDate = (key: string) =>
  z
    .string(message(key))
    .regex(/^\d{4}-\d{2}-\d{2}$/, message(key))
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), message(key));

const webAddress = z
  .string(message('profiles.errors.linkUrl'))
  .max(2048, message('profiles.errors.linkUrl'))
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, message('profiles.errors.linkUrl'));

/**
 * The whole editable profile (L2-007 criteria 2 and 3). Only these keys reach the action, so
 * anything else in the body is ignored (L2-044 criterion 4). Limits: decision D-032.
 */
export const UpdateOwnProfileRequest = (db: pg.Pool) =>
  z.object({
    name: z
      .string(message('profiles.errors.nameRequired'))
      .max(100, message('identity.errors.nameMax')),
    headline: z.string().max(80, message('profiles.errors.headlineMax')).nullish(),
    neighbourhood_id: neighbourhoodId(db),
    bio: z
      .string()
      .nullish()
      .superRefine((bio, issues) => {
        const count = [...(bio ?? '')].length;
        if (count > 500) {
          issues.addIssue({ code: 'custom', message: t('profiles.errors.bioMax', { count }) });
        }
      }),
    skills: skillEntries(db),
    experience: z
      .array(
        z
          .object({
            title: z
              .string(message('profiles.errors.experienceTitle'))
              .max(100, message('profiles.errors.experienceTitle')),
            organization: z.string().max(100).nullish(),
            started_on: isoDate('profiles.errors.experienceStart'),
            ended_on: isoDate('profiles.errors.experienceEnd').nullish(),
          })
          .refine((entry) => !entry.ended_on || entry.ended_on >= entry.started_on, {
            path: ['ended_on'],
            ...message('profiles.errors.experienceEnd'),
          }),
      )
      .max(10, message('profiles.errors.experienceMax')),
    links: z
      .array(
        z.object({
          label: z
            .string(message('profiles.errors.linkLabel'))
            .max(60, message('profiles.errors.linkLabel')),
          url: webAddress,
        }),
      )
      .max(5, message('profiles.errors.linksMax')),
    open_to: z
      .array(
        z.enum(OPEN_TO, message('profiles.errors.openTo')),
        message('profiles.errors.openToRequired'),
      )
      .min(1, message('profiles.errors.openToRequired')),
    looking_for: z.string().max(400, message('profiles.errors.lookingForMax')).nullish(),
    building: z.string().max(280, message('profiles.errors.buildingMax')).nullish(),
  });

export type OwnProfileInput = z.output<ReturnType<typeof UpdateOwnProfileRequest>>;
