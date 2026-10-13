import { globalStack, handle } from '@/src/http/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = globalStack;

/** Answers from the process alone, so a slow dependency never causes a restart loop (L2-053). */
export const GET = handle(stack, async () => Response.json({ status: 'ok' }));
