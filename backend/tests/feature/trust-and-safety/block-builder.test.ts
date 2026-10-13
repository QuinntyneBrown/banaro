// Acceptance Test
// Traces to: L2-032, L2-011, L2-044, L2-045
// Description:
// Given a member, when they block another builder, then both are hidden from each other in the
// directory and search, and each other's profile answers 404. Blocking is idempotent, sends nothing to
// the blocked party and refuses the member's own profile. The blocker's blocked list shows the builder,
// and unblocking restores visibility in both directions unless the other member blocked them too.
// A builder who already blocked the member cannot be found to block. Profiles offer "Block" to members
// viewing someone else.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as directory } from '@/app/api/v1/builders/route';
import { GET as profile } from '@/app/api/v1/builders/[builder]/route';
import { GET as list } from '@/app/api/v1/blocks/route';
import { DELETE as unblockRoute, PUT as blockRoute } from '@/app/api/v1/blocks/[builder]/route';
import { deps, setDeps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { blocks } from '@/src/db/schema/blocks';
import type { Builder } from '@/src/db/schema/builders';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { createBuilder, userOf } from '../../support/directory';
import { FakeQueue } from '../../support/fakes';
import { actingAs, seedReferenceData } from '../../support/members';

let amara: User;
let amaraBuilder: Builder;
let daniel: Builder;

const builder = (name: string) => createBuilder(name, 'riverdale', { activeMinutesAgo: 0 });

const block = async (as: User, target: Builder | string) => {
  const id = typeof target === 'string' ? target : target.publicId!;
  return (await actingAs(as)).put(blockRoute, `/api/v1/blocks/${id}`, { params: { builder: id } });
};

const unblock = async (as: User, target: Builder) =>
  (await actingAs(as)).delete(unblockRoute, `/api/v1/blocks/${target.publicId}`, {
    params: { builder: target.publicId! },
  });

const directoryNames = async (as: User) => {
  const response = await (await actingAs(as)).get(directory, '/api/v1/builders?distance=any');
  expect(response.status).toBe(200);
  return ((await response.json()) as { items: { name: string }[] }).items.map((item) => item.name);
};

const openProfile = async (as: User, target: Builder) =>
  (await actingAs(as)).get(profile, `/api/v1/builders/${target.publicId}`, {
    params: { builder: target.publicId! },
  });

describe('block a builder', () => {
  beforeEach(async () => {
    await seedReferenceData();
    amaraBuilder = await builder('Amara Osei');
    amara = await userOf(amaraBuilder);
    daniel = await builder('Daniel Reyes');
  });

  afterEach(() => vi.useRealTimers());

  it('hides both members from each other', async () => {
    const queue = new FakeQueue();
    setDeps({ queue });
    const danielUser = await userOf(daniel);

    const response = await block(amara, daniel);

    expect(response.status).toBe(200);
    expect(((await response.json()) as { builder_id: string }).builder_id).toBe(daniel.publicId);
    expect(await directoryNames(amara)).not.toContain('Daniel Reyes');
    expect(await directoryNames(danielUser)).not.toContain('Amara Osei');
    expect((await openProfile(amara, daniel)).status).toBe(404);
    expect((await openProfile(danielUser, amaraBuilder)).status).toBe(404);
    const facets = (
      (await (
        await (await actingAs(amara)).get(directory, '/api/v1/builders?distance=any')
      ).json()) as {
        meta: { facets: { role: Record<string, number> } };
      }
    ).meta.facets.role;
    expect(facets.engineer).toBe(0);
    expect(queue.pushed).toHaveLength(0);
  });

  it('changes nothing when blocking twice', async () => {
    expect((await block(amara, daniel)).status).toBe(200);
    expect((await block(amara, daniel)).status).toBe(200);

    expect(await orm(deps().db).$count(blocks)).toBe(1);
  });

  it('refuses to let a member block themselves', async () => {
    const response = await block(amara, amaraBuilder);

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ code: 'cannot_block_self' });
  });

  it('cannot find a builder who already blocked you to block', async () => {
    expect((await block(await userOf(daniel), amaraBuilder)).status).toBe(200);

    expect((await block(amara, daniel)).status).toBe(404);
    expect((await block(amara, '01jb0000000000000000000000')).status).toBe(404);
  });

  it('lists the member own blocks newest first', async () => {
    const grace = await builder('Grace Liu');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() - 3600 * 1000);
    expect((await block(amara, daniel)).status).toBe(200);
    vi.useRealTimers();
    expect((await block(amara, grace)).status).toBe(200);
    expect((await block(await userOf(daniel), grace)).status).toBe(200);

    const response = await (await actingAs(amara)).get(list, '/api/v1/blocks');

    expect(response.status).toBe(200);
    const rows = (await response.json()) as Record<string, unknown>[];
    expect(rows.map((row) => row.name)).toEqual(['Grace Liu', 'Daniel Reyes']);
    expect(Object.keys(rows[0])).toEqual(['builder_id', 'name', 'photo_url', 'blocked_at']);
  });

  it('restores visibility on unblock unless the other member blocked too', async () => {
    const danielUser = await userOf(daniel);
    expect((await block(amara, daniel)).status).toBe(200);

    expect((await unblock(amara, daniel)).status).toBe(204);

    expect(await directoryNames(amara)).toContain('Daniel Reyes');
    expect(await directoryNames(danielUser)).toContain('Amara Osei');
    expect((await unblock(amara, daniel)).status).toBe(404);
    expect((await block(amara, daniel)).status).toBe(200);
    expect((await block(danielUser, amaraBuilder)).status).toBe(404);
  });

  it('offers block on profiles of someone else only', async () => {
    const other = (await (await openProfile(amara, daniel)).json()) as {
      actions: { block: boolean };
    };
    const own = (await (await openProfile(amara, amaraBuilder)).json()) as {
      actions: { block: boolean };
    };

    expect(other.actions.block).toBe(true);
    expect(own.actions.block).toBe(false);
  });

  it('needs a signed-in member', async () => {
    const visitor = new Browser();

    const put = await visitor.put(blockRoute, `/api/v1/blocks/${daniel.publicId}`, {
      params: { builder: daniel.publicId! },
    });
    expect(put.status).toBe(401);
    expect((await visitor.get(list, '/api/v1/blocks')).status).toBe(401);
  });
});
