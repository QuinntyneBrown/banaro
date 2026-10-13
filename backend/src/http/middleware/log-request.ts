import type { Middleware } from '../pipeline';

/** One JSON line per request, written once the response is final (L2-053 criteria 3 and 5). */
export const logRequest: Middleware = async (ctx, next) => {
  const started = process.hrtime.bigint();
  const response = await next();
  ctx.deps.logger.info(
    {
      request_id: ctx.requestId,
      method: ctx.req.method,
      route: ctx.route,
      status: response.status,
      duration_ms: Number(process.hrtime.bigint() - started) / 1e6,
      member_id: ctx.memberId,
    },
    'request',
  );
  return response;
};
