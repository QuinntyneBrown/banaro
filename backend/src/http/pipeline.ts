import type { User } from '../db/schema/users';
import { deps, type Deps } from '../container';
import type { Session } from './session';
import { assignRequestId } from './middleware/assign-request-id';
import { auth } from './middleware/auth';
import { csrf } from './middleware/csrf';
import { logRequest } from './middleware/log-request';
import { maintenance } from './middleware/maintenance';
import { securityHeaders } from './middleware/security-headers';
import { session } from './middleware/session';

/** What every middleware and handler sees for one request. */
export interface Ctx {
  req: Request;
  params: Record<string, string>;
  /** Route pattern such as `/api/v1/projects/[project]`, never the raw path. */
  route: string;
  requestId: string;
  /** The session of a first-party browser request, or null. */
  session: Session | null;
  /** The signed-in account, or null for a visitor. */
  user: User | null;
  deps: Deps;
}

export type Next = () => Promise<Response>;
export type Middleware = (ctx: Ctx, next: Next) => Promise<Response>;
interface RouteContext {
  /** Next.js resolves this to undefined for a route without dynamic segments. */
  params: Promise<Record<string, string> | undefined>;
}

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

/** Known errors become their response; anything else is a generic 500 carrying the request id. */
function render(error: unknown, ctx: Ctx): Response {
  if (error instanceof HttpError) {
    return Response.json(error.body, { status: error.status, headers: error.headers });
  }
  ctx.deps.logger.error({ err: error }, 'unhandled error');
  return Response.json({ message: 'Server Error', requestId: ctx.requestId }, { status: 500 });
}

/** Request logging stays outermost so it logs the final status after error handling (L2-053). */
export const globalStack: Middleware[] = [logRequest, assignRequestId, securityHeaders];

/** Routes under /api/v1: first-party sessions with CSRF checks (ADR-0011). */
export const apiStack: Middleware[] = [...globalStack, maintenance, session, csrf];

/** Routes that need a signed-in account. */
export const memberStack: Middleware[] = [...apiStack, auth];

/**
 * Wraps a route handler in its middleware stack. An error at any layer becomes a response there,
 * so every outer middleware sees a response, as in Laravel's pipeline.
 */
export function handle(stack: Middleware[], handler: (ctx: Ctx) => Promise<Response>) {
  return async (req: Request, context: RouteContext): Promise<Response> => {
    const params = (await context.params) ?? {};
    const ctx: Ctx = {
      req,
      params,
      route: routePattern(new URL(req.url).pathname, params),
      requestId: '',
      session: null,
      user: null,
      deps: deps(),
    };
    const run = (i: number): Promise<Response> =>
      (i < stack.length ? stack[i](ctx, () => run(i + 1)) : handler(ctx)).catch((error) =>
        render(error, ctx),
      );
    return run(0);
  };
}

function routePattern(path: string, params: Record<string, string>): string {
  const values = new Map(Object.entries(params).map(([name, value]) => [value, name]));
  return path
    .split('/')
    .map((segment) => (values.has(segment) ? `[${values.get(segment)}]` : segment))
    .join('/');
}
