/**
 * The routes anyone may call without signing in (L2-044 criterion 3). Every other route needs a
 * signed-in member: its stack must include `auth`, and the unauthenticated-access suite checks that
 * each route not listed here answers 401 without a session.
 */
export const PUBLIC_ROUTES: readonly string[] = [
  // Operations and the CSRF cookie the Angular client fetches first (L2-053, ADR-0011).
  'GET /health/live',
  'GET /health/ready',
  'GET /sanctum/csrf-cookie',
  // An API path with no route answers 404 (L2-045).
  ...['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => `${method} /api/v1/[...path]`),
  // Catalogues, contact and identity (L2-001 to L2-005, L2-040, L2-048).
  'GET /api/v1/i18n/[locale]',
  'POST /api/v1/contact-messages',
  'POST /api/v1/join',
  'GET /api/v1/session',
  'POST /api/v1/session',
  'POST /api/v1/email/verify',
  'POST /api/v1/email/verification-notification',
  'POST /api/v1/forgot-password',
  'POST /api/v1/reset-password',
  'POST /api/v1/reset-password/check',
  // The signed token is the credential of a one-click unsubscribe (L2-029 criterion 3).
  'POST /api/v1/email-preferences/unsubscribe',
  // Visitors browse builders, photos and projects (L2-009, L2-013, L2-015, L2-016, D-051).
  'GET /api/v1/builders',
  'GET /api/v1/builders/[builder]',
  'GET /api/v1/photos/[photo]',
  'GET /api/v1/projects',
  'GET /api/v1/projects/[project]',
  'GET /api/v1/projects/[project]/feedback',
];
