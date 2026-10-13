// Acceptance Test
// Traces to: L2-050
// Description:
// Given every route and state in the route manifest, in the light and the dark theme, when axe-core
// checks the page against WCAG 2.2 levels A and AA, then it finds no violations. Dialogs are checked
// open, over the page they open from.

import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { createBuilder } from '../fixtures/builders';
import { createMember } from '../fixtures/members';
import { resetRateLimits } from '../fixtures/backend';
import { waitForApp } from '../pages/app';
import { SignInPage } from '../pages/sign-in.page';
import { type EntryContext, routes } from '../routes.manifest';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('accessibility (WCAG 2.2 AA)', () => {
  test.beforeEach(() => resetRateLimits());

  for (const entry of routes.filter((r) => r.app === 'banaro')) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${entry.screen} · ${entry.state} · ${theme}`, async ({ page, context, baseURL }) => {
        const ctx: EntryContext = { member: null, params: {} };
        if (entry.session === 'member') ctx.member = createBuilder();
        if (entry.session === 'unverified') ctx.member = createMember({ verified: false });
        if (entry.session === 'new-member') ctx.member = createMember();
        entry.seed?.(ctx);
        const path = typeof entry.path === 'function' ? entry.path(ctx) : entry.path;

        await context.addCookies([{ name: 'bn-theme', value: theme, url: baseURL! }]);
        await entry.prepare?.(page, ctx);

        if (ctx.member) {
          const signIn = new SignInPage(page);
          await signIn.open(path);
          await signIn.signIn(ctx.member.email, ctx.member.password);
          // Sign-in hashes with bcrypt at cost 12, which is slow on a busy machine.
          await expect(page).toHaveURL((url) => url.pathname + url.search === path || url.pathname === path.split('?')[0], {
            timeout: 45_000,
          });
        } else {
          await page.goto(path);
        }
        await waitForApp(page);
        await entry.reach?.(page, ctx);

        const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
        for (const selector of entry.a11y?.exclude ?? []) builder.exclude(selector);
        const { violations } = await builder.analyze();

        expect(
          violations.map((v) => ({ rule: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')) })),
        ).toEqual([]);
      });
    }
  }
});
