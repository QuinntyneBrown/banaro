// Acceptance Test
// Traces to: L2-044
// Description:
// Given a request with no session, when it reaches any route that src/http/public-routes.ts does not
// list, then the API returns 401 and nothing else about the record is revealed.

import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { Browser } from '../../support/browser';
import { authenticatedRoutes, fillPath, paramNames } from '../../support/routes';

/** A well-formed value for each route parameter. */
function wellFormed(name: string): string {
  if (name === 'project') return 'a'.repeat(26);
  if (name === 'photo' || name === 'notification') return randomUUID();
  if (name === 'category') return 'matches';
  return 'x';
}

describe('unauthenticated access', () => {
  it('answers 401 on every authenticated route without a session', async () => {
    const routes = authenticatedRoutes();
    expect(routes.length).toBeGreaterThan(0);

    const problems: string[] = [];
    for (const route of routes) {
      const params = Object.fromEntries(
        paramNames(route.path).map((name) => [name, wellFormed(name)]),
      );
      const response = await new Browser().send(
        route.handler,
        route.method,
        fillPath(route.path, params),
        { params, json: route.method === 'GET' ? undefined : {} },
      );
      if (response.status !== 401) {
        problems.push(`${route.key}: answered ${response.status} without a session`);
      }
    }

    expect(problems).toEqual([]);
  });
});
