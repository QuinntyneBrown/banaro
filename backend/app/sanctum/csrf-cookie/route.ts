import { maintenance } from '@/src/http/middleware/maintenance';
import { startSession } from '@/src/http/middleware/session';
import { globalStack, handle } from '@/src/http/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = [...globalStack, maintenance, startSession];

/** Sets the XSRF-TOKEN cookie; the path is the one Sanctum used, which the client calls (ADR-0011). */
export const GET = handle(stack, async () => new Response(null, { status: 204 }));
