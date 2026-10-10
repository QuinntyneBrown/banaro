import { HttpErrorResponse } from '@angular/common/http';

export type ApiError =
  /** 422: one message per field, keyed by the request's field name. */
  | { kind: 'validation'; fields: Record<string, string> }
  /** 429: wait this many seconds before trying again. */
  | { kind: 'rate-limited'; retryAfterSeconds: number }
  | { kind: 'failed' };

/** Turns an HTTP failure into the cases a page shows. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 422) {
      const errors = (error.error?.errors ?? {}) as Record<string, string[]>;
      return {
        kind: 'validation',
        fields: Object.fromEntries(
          Object.entries(errors).map(([field, messages]) => [field, messages[0]]),
        ),
      };
    }
    if (error.status === 429) {
      return {
        kind: 'rate-limited',
        retryAfterSeconds: Number(error.headers.get('Retry-After') ?? 60),
      };
    }
  }
  return { kind: 'failed' };
}

/** Whole minutes to wait, rounded up, for "Wait N minutes" messages. */
export function retryAfterMinutes(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60));
}
