import type { z } from 'zod';
import { HttpError } from '../pipeline';
import { parseQuery } from './query';

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
 * Validates a request's query and body against a request schema. Strings are trimmed and empty
 * strings become null first, as the Laravel API did; the result holds only the schema's fields.
 */
export async function validate<S extends z.ZodType>(schema: S, req: Request): Promise<z.output<S>> {
  return validateInput(schema, { ...parseQuery(req), ...(await readBody(req)) });
}

/** Validates data already read, such as a query string or a multipart form. */
export async function validateInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
): Promise<z.output<S>> {
  const result = await schema.safeParseAsync(normalize(input));
  if (result.success) return result.data;

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join('.');
    (errors[field] ??= []).push(issue.message);
  }
  throw new ValidationError(errors);
}

/** A JSON or form body as an object; query and body merge, as Laravel's request input did. */
async function readBody(req: Request): Promise<Record<string, unknown>> {
  const type = req.headers.get('Content-Type') ?? '';
  if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
    const form = await req.formData().catch(() => null);
    return form ? Object.fromEntries(form) : {};
  }
  const body: unknown = await req.json().catch(() => ({}));
  return body !== null && typeof body === 'object' && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : {};
}

function normalize(value: unknown): unknown {
  if (typeof value === 'string') return value.trim() === '' ? null : value.trim();
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]));
  }
  return value;
}
