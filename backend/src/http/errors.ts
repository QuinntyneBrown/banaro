// Kept apart from pipeline.ts so middleware can throw these without importing the pipeline that
// imports it.

/** An error with a known HTTP status and body. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: Record<string, unknown>,
    readonly headers: Record<string, string> = {},
  ) {
    super(`HTTP ${status}`);
  }
}

export const notFound = () => new HttpError(404, { message: 'Not Found' });
