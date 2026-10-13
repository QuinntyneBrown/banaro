import { HttpError } from '../errors';
import type { Middleware } from '../pipeline';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

// These authenticate by the secret in their link, write no session, and run during server-side
// rendering or from mail clients, which carry no CSRF token (D-021, D-055).
const EXEMPT = new Set([
  '/api/v1/email/verify',
  '/api/v1/reset-password/check',
  '/api/v1/email-preferences/unsubscribe',
]);

/** A state-changing request in a session must echo the XSRF-TOKEN cookie (L2-045 criterion 2). */
export const csrf: Middleware = async (ctx, next) => {
  if (ctx.session && !SAFE.has(ctx.req.method) && !EXEMPT.has(ctx.route)) {
    const token = ctx.req.headers.get('X-CSRF-TOKEN') ?? ctx.req.headers.get('X-XSRF-TOKEN');
    if (!ctx.session.csrfMatches(token)) {
      throw new HttpError(419, { message: 'CSRF token mismatch.' });
    }
  }
  return next();
};
