import { randomUUID } from 'node:crypto';
import { requestContext } from '../../logging';
import type { Middleware } from '../pipeline';

/** Keeps a well-formed incoming X-Request-Id, such as the SSR server's, or makes a new one. */
export const assignRequestId: Middleware = async (ctx, next) => {
  const incoming = ctx.req.headers.get('X-Request-Id') ?? '';
  ctx.requestId = /^[A-Za-z0-9-]{8,64}$/.test(incoming) ? incoming : randomUUID();

  const response = await requestContext.run({ requestId: ctx.requestId }, next);
  response.headers.set('X-Request-Id', ctx.requestId);
  return response;
};
