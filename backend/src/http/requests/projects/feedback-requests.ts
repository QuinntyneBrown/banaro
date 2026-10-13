import { z } from 'zod';
import { t } from '../../../services/user-experience/catalogue-service';
import { message, pageNumber } from '../../validation/rules';

/** Feedback of 10 to 1,000 characters (L2-016 criterion 2). */
export const GiveFeedbackRequest = z.object({
  body: z.string(message('projects.feedback.errors.required')).superRefine((body, issues) => {
    const length = [...body].length;
    if (length < 10) {
      issues.addIssue({ code: 'custom', message: t('projects.feedback.errors.min', { min: 10 }) });
    } else if (length > 1000) {
      issues.addIssue({
        code: 'custom',
        message: t('projects.feedback.errors.max', { max: '1,000' }),
      });
    }
  }),
});

/** A page of a project's feedback: five at a time unless the page asks for more, at most 50. */
export const ListProjectFeedbackRequest = z
  .object({
    page: pageNumber(),
    per_page: z.preprocess(
      (value) => (value == null ? undefined : Number(value)),
      z.number().int().min(1).optional(),
    ),
  })
  .transform(({ page, per_page }) => ({
    page: page ?? 1,
    perPage: Math.min(per_page ?? 5, 50),
  }));
