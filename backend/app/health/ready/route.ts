import { globalStack, handle } from '@/src/http/pipeline';
import { isReady } from '@/src/services/operations/readiness-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = globalStack;

export const GET = handle(stack, async (ctx) =>
  (await isReady(ctx.deps))
    ? Response.json({ status: 'ready' })
    : Response.json({ status: 'unavailable' }, { status: 503 }),
);
