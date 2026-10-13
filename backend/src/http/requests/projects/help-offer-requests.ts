import { z } from 'zod';
import { t } from '../../../services/user-experience/catalogue-service';
import { message, pageNumber } from '../../validation/rules';

/**
 * An offer of one of the project's own "looking for" roles with a message of 10 to 1,000 characters
 * (L2-017 criteria 1 and 2).
 */
export const OfferToHelpRequest = (roles: string[]) =>
  z.object({
    role: z
      .string(message('projects.offer.errors.role'))
      .refine((role) => roles.includes(role), message('projects.offer.errors.role')),
    message: z.string(message('projects.offer.errors.required')).superRefine((text, issues) => {
      const length = [...text].length;
      if (length < 10) {
        issues.addIssue({ code: 'custom', message: t('projects.offer.errors.min', { min: 10 }) });
      } else if (length > 1000) {
        issues.addIssue({
          code: 'custom',
          message: t('projects.offer.errors.max', { max: '1,000' }),
        });
      }
    }),
  });

/** A page of a project's offers: 12 at a time unless the page asks for more, at most 50. */
export const ListHelpOffersRequest = z
  .object({
    page: pageNumber(),
    per_page: z.preprocess(
      (value) => (value == null ? undefined : Number(value)),
      z.number().int().min(1).optional(),
    ),
  })
  .transform(({ page, per_page }) => ({
    page: page ?? 1,
    perPage: Math.min(per_page ?? 12, 50),
  }));
