import { globalStack, handle, HttpError } from '@/src/http/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = globalStack;

/** An API path with no route: JSON 404 that still carries the security headers (L2-045). */
const missing = handle(stack, async (ctx) => {
  const path = new URL(ctx.req.url).pathname.replace(/^\//, '');
  throw new HttpError(404, { message: `The route ${path} could not be found.` });
});

export const GET = missing;
export const POST = missing;
export const PUT = missing;
export const PATCH = missing;
export const DELETE = missing;
