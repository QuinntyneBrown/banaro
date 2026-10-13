import type { z } from 'zod';
import { HttpError } from '../pipeline';

/** 422 with one list of messages per field, the shape the web app reads (L2-045 criterion 1). */
export class ValidationError extends HttpError {
  constructor(errors: Record<string, string[]>) {
    const messages = Object.values(errors).flat();
    const more = messages.length - 1;
    const message =
      more > 0 ? `${messages[0]} (and ${more} more error${more === 1 ? '' : 's'})` : messages[0];
    super(422, { message, errors });
  }
}

/**
 * Validates a JSON body against a request schema. Strings are trimmed and empty strings become
 * null first, as the Laravel API did; the parsed result holds only the schema's fields.
 */
export async function validate<S extends z.ZodType>(schema: S, req: Request): Promise<z.output<S>> {
  const input = normalize(await req.json().catch(() => ({})));
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join('.');
    (errors[field] ??= []).push(issue.message);
  }
  throw new ValidationError(errors);
}

function normalize(value: unknown): unknown {
  if (typeof value === 'string') return value.trim() === '' ? null : value.trim();
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]));
  }
  return value;
}
