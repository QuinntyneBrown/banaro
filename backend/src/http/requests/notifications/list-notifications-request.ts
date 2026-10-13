import { z } from 'zod';
import { pageNumber } from '../../validation/rules';

/** A page of the member's own notifications; a page size above 50 is lowered to it (L2-027). */
export const ListNotificationsRequest = z
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
