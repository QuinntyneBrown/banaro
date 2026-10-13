import { createHash } from 'node:crypto';
import { apiStack, handle, notFound } from '@/src/http/pipeline';
import { catalogue, LOCALES } from '@/src/services/user-experience/catalogue-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = apiStack;

const MAX_AGE = Number(process.env.BANARO_CATALOGUE_MAX_AGE ?? 300);

/** The translation catalogue; visitors need text too (L2-052). */
export const GET = handle(stack, async ({ req, params }) => {
  if (!/^[A-Za-z]{2}-[A-Za-z]{2}$/.test(params.locale) || !LOCALES.includes(params.locale)) {
    throw notFound();
  }
  const body = JSON.stringify(catalogue(params.locale));
  const headers = {
    ETag: `"${createHash('sha256').update(body).digest('hex')}"`,
    'Cache-Control': `max-age=${MAX_AGE}, public`,
  };
  if (req.headers.get('If-None-Match') === headers.ETag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(body, { headers: { ...headers, 'Content-Type': 'application/json' } });
});
