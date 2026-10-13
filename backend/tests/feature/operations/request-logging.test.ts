// Acceptance Test
// Traces to: L2-053
// Description: Each request writes one JSON log line with its request ID, route, status, duration
// and member ID; unhandled errors return a generic 500 carrying only the request ID.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resetDeps, setDeps } from '@/src/container';
import { HttpError, globalStack, handle } from '@/src/http/pipeline';
import { createLogger } from '@/src/logging';

interface LogLine {
  level: number;
  msg: string;
  [key: string]: unknown;
}

let lines: LogLine[];

const thing = handle(globalStack, async () => Response.json({ ok: true }));
const boom = handle(globalStack, async () => {
  throw new Error('database password is hunter2');
});
const missing = handle(globalStack, async () => {
  throw new HttpError(404, { message: 'Not Found' });
});

const get = (
  handler: typeof thing,
  path: string,
  params: Record<string, string> = {},
  headers: Record<string, string> = {},
) =>
  handler(new Request(`http://localhost:8100${path}`, { headers }), {
    params: Promise.resolve(params),
  });

const requestLines = () => lines.filter((line) => line.msg === 'request');

describe('request logging', () => {
  beforeEach(() => {
    lines = [];
    setDeps({
      logger: createLogger({ write: (line: string) => lines.push(JSON.parse(line)) }, 'info'),
    });
  });

  afterEach(() => resetDeps());

  it('writes one log line and returns the request id header', async () => {
    const response = await get(thing, '/api/v1/test/things/42?email=amara@example.com', {
      thing: '42',
    });

    expect(response.status).toBe(200);
    const requestId = response.headers.get('X-Request-Id');
    expect(requestId).toMatch(/^[A-Za-z0-9-]{8,64}$/);

    expect(requestLines()).toHaveLength(1);
    const line = requestLines()[0];
    expect(line.request_id).toBe(requestId);
    expect(line.method).toBe('GET');
    expect(line.route).toBe('/api/v1/test/things/[thing]');
    expect(line.status).toBe(200);
    expect(typeof line.duration_ms).toBe('number');
    expect(line).toHaveProperty('member_id', null);
    expect(JSON.stringify(lines)).not.toContain('amara@example.com');
  });

  it('keeps a valid incoming request id', async () => {
    const response = await get(
      thing,
      '/api/v1/test/things/42',
      { thing: '42' },
      {
        'X-Request-Id': 'ssr-0123456789abcdef',
      },
    );

    expect(response.headers.get('X-Request-Id')).toBe('ssr-0123456789abcdef');
    expect(requestLines()[0].request_id).toBe('ssr-0123456789abcdef');
  });

  it('replaces an invalid incoming request id', async () => {
    const response = await get(
      thing,
      '/api/v1/test/things/42',
      { thing: '42' },
      {
        'X-Request-Id': 'bad id; Injected: yes',
      },
    );

    expect(response.headers.get('X-Request-Id')).not.toBe('bad id; Injected: yes');
    expect(response.headers.get('X-Request-Id')).toMatch(/^[A-Za-z0-9-]{8,64}$/);
  });

  it('returns a generic 500 with only the request id for an unhandled error', async () => {
    const response = await get(boom, '/api/v1/test/boom');

    const requestId = response.headers.get('X-Request-Id');
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: 'Server Error', requestId });

    const errors = lines.filter((line) => line.level === 50);
    expect(errors).toHaveLength(1);
    expect(errors[0].request_id).toBe(requestId);
    expect(errors[0].err).toMatchObject({ type: 'Error' });
  });

  it('logs the final status after error handling', async () => {
    expect((await get(boom, '/api/v1/test/boom')).status).toBe(500);
    expect((await get(missing, '/api/v1/test/missing')).status).toBe(404);

    expect(requestLines().map((line) => line.status)).toEqual([500, 404]);
  });

  it('adds the security headers to every response, errors included', async () => {
    const response = await get(boom, '/api/v1/test/boom');

    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Content-Security-Policy')).toBe(
      "default-src 'none'; frame-ancestors 'none'",
    );
  });
});
