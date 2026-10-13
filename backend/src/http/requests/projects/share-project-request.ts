import { z } from 'zod';
import { LOOKING_FOR_ROLES, PROJECT_STAGES } from '../../../enums/projects';
import { t } from '../../../services/user-experience/catalogue-service';
import { message, pageNumber } from '../../validation/rules';

const webAddress = z
  .string(message('projects.errors.link'))
  .max(2048, message('projects.errors.link'))
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, message('projects.errors.link'));

/**
 * A project to share or save (L2-012, L2-014, L2-045). Only these keys reach the action, so an
 * owner in the body is ignored (L2-044 criterion 4).
 */
export const ShareProjectRequest = z.object({
  name: z
    .string(message('projects.errors.nameRequired'))
    .max(80, message('projects.errors.nameMax')),
  summary: z
    .string(message('projects.errors.summaryRequired'))
    .max(140, message('projects.errors.summaryMax')),
  description: z.string().max(2000, message('projects.errors.descriptionMax')).nullish(),
  stage: z.enum(PROJECT_STAGES, message('projects.errors.stage')),
  looking_for: z
    .array(z.enum(LOOKING_FOR_ROLES, message('projects.errors.lookingFor')))
    .superRefine((roles, issues) => {
      roles.forEach((role, i) => {
        if (roles.indexOf(role) !== i) {
          issues.addIssue({ code: 'custom', path: [i], message: t('projects.errors.lookingFor') });
        }
      });
    }),
  link: webAddress.nullish(),
});

export type ProjectInput = z.output<typeof ShareProjectRequest>;

/** A project listing query (L2-015, L2-045): search, stages, roles and page. */
export const BrowseProjectsRequest = z.object({
  q: z.string().max(100).nullish(),
  stage: z.array(z.enum(PROJECT_STAGES, message('projects.errors.stage'))).nullish(),
  looking_for: z.array(z.enum(LOOKING_FOR_ROLES, message('projects.errors.lookingFor'))).nullish(),
  page: pageNumber(),
});
