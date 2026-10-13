import { deps, type Deps } from '../container';
import { assignRequestId } from './middleware/assign-request-id';
import { logRequest } from './middleware/log-request';
import { securityHeaders } from './middleware/security-headers';

/** What every middleware and handler sees for one request. */
export interface Ctx {
  req: Request;
  params: Record<string, string>;
  /** Route pattern such as `/api/v1/projects/[project]`, never the raw path. */
  route: string;
  requestId: string;
  memberId: number | null;
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

/** Innermost step: turns any error into a response, so outer middleware see the final status. */
const errorBoundary: Middleware = async (ctx, next) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.body, { status: error.status, headers: error.headers });
    }
    ctx.deps.logger.error({ err: error }, 'unhandled error');
    return Response.json({ message: 'Server Error', requestId: ctx.requestId }, { status: 500 });
  }
};

/** Request logging stays outermost so it logs the final status after error handling (L2-053). */
export const globalStack: Middleware[] = [logRequest, assignRequestId, securityHeaders];

/** Wraps a route handler in its middleware stack. */
export function handle(stack: Middleware[], handler: (ctx: Ctx) => Promise<Response>) {
  const chain = [...stack, errorBoundary];
  return async (req: Request, context: RouteContext): Promise<Response> => {
    const params = (await context.params) ?? {};
    const ctx: Ctx = {
      req,
      params,
      route: routePattern(new URL(req.url).pathname, params),
      requestId: '',
      memberId: null,
      deps: deps(),
    };
    const run = (i: number): Promise<Response> =>
      i < chain.length ? chain[i](ctx, () => run(i + 1)) : handler(ctx);
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
