// Acceptance Test
// Traces to: L2-044
// Description:
// Given member A and member B, when A calls any authenticated route with B's records, then the API
// returns 404 (or 403 where the record is public but not A's to change), exposes nothing of B in the
// response and leaves B's data unchanged. Every authenticated route must have a fixture in
// fixtures/index.ts: a route added without one fails this test, so no route ships without a
// second-member check.

import { describe, expect, it } from 'vitest';
import { setDeps } from '@/src/container';
import { FakeQueue } from '../../support/fakes';
import { actingAs, createMember } from '../../support/members';
import { authenticatedRoutes, fillPath } from '../../support/routes';
import { routeOwnershipFixtures } from './fixtures';

const statusMatches: Record<string, (status: number) => boolean> = {
  not_found: (status) => status === 404,
  forbidden: (status) => status === 403,
  self_only: (status) => status < 500,
};

describe('cross-user access', () => {
  it('hides other members records on every authenticated route', async () => {
    setDeps({ queue: new FakeQueue() });
    const problems: string[] = [];

    for (const route of authenticatedRoutes()) {
      const fixture = routeOwnershipFixtures.get(route.key);
      if (!fixture) {
        problems.push(`${route.key}: no ownership fixture; add one to fixtures/index.ts`);
        continue;
      }
      const owner = await createMember(`Owner of ${route.key}`);
      const actor = await createMember(`Actor on ${route.key}`);
      const scenario = await fixture.arrange(owner);
      const params = scenario.params ?? {};

      const response = await (
        await actingAs(actor)
      ).send(route.handler, route.method, fillPath(route.path, params), {
        params,
        json: route.method === 'GET' ? undefined : (scenario.body ?? {}),
      });

      if (!statusMatches[fixture.expect](response.status)) {
        problems.push(
          `${route.key}: answered ${response.status} to another member, expected ${fixture.expect}`,
        );
      }
      const content = await response.text();
      for (const sentinel of scenario.sentinels ?? []) {
        if (content.includes(sentinel)) {
          problems.push(
            `${route.key}: the response exposes "${sentinel}" from another member's data`,
          );
        }
      }
      if (scenario.intact && !(await scenario.intact())) {
        problems.push(`${route.key}: another member's call changed the owner's data`);
      }
    }

    expect(problems).toEqual([]);
  });

  it('names only routes that exist', () => {
    const keys = new Set(authenticatedRoutes().map((route) => route.key));

    expect([...routeOwnershipFixtures.keys()].filter((key) => !keys.has(key))).toEqual([]);
  });
});
