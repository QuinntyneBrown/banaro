// Acceptance Test
// Traces to: L2-028, L2-043
// Description: Losing the connection shows the warning banner at once and recovery shows a success
// banner that dismisses after 6 s; an unreachable API shows "Reconnecting…" after 3 s and, after 6
// failed probes 5 s apart, the danger banner whose "Try again" probes at once.

import { expect, test } from '@playwright/test';
import { ConnectionBanner } from '../../pages/connection-banner';
import { ContactPage } from '../../pages/contact.page';
import { HomePage } from '../../pages/home.page';

test('going offline and back online', async ({ page, context }) => {
  await page.clock.install();
  await new HomePage(page).open();
  const connection = new ConnectionBanner(page);

  await ConnectionBanner.goOffline(context);
  await expect(connection.banner).toHaveText('You are offline. What you write stays on this page until you reconnect.');
  expect(await connection.variant()).toBe('warning');
  await expect(connection.banner).toHaveAttribute('role', 'status');
  await expect(connection.dismiss).toHaveCount(0);

  await ConnectionBanner.goOnline(context);
  await expect(connection.banner).toHaveText('Back online. Banaro is up to date.');
  expect(await connection.variant()).toBe('success');

  await page.clock.fastForward(6_500);
  await expect(connection.banner).toHaveCount(0);
});

test('an unreachable API shows reconnecting, then the danger banner, then recovers on Try again', async ({ page }) => {
  await page.clock.install();
  const contact = new ContactPage(page);
  await contact.open();
  const connection = new ConnectionBanner(page);
  await connection.blockApi();

  await contact.fill({ name: 'Amara Osei', email: 'amara@harvest.example', topic: 'General', message: 'Written while the API is away.' });
  await contact.submit();
  await expect(connection.banner).toHaveCount(0);

  await page.clock.fastForward(3_100);
  await expect(connection.banner).toHaveText('Reconnecting… Banaro will update as soon as you are back.');
  expect(await connection.variant()).toBe('info');

  await page.clock.runFor(31_000);
  await expect(connection.banner).toContainText("We couldn't reconnect. Check your network, then try again.");
  expect(await connection.variant()).toBe('danger');
  await expect(connection.banner).toHaveAttribute('role', 'alert');
  await expect(contact.message).toHaveValue('Written while the API is away.');

  await connection.unblockApi();
  await connection.tryAgain.click();
  await expect(connection.banner).toHaveText('Back online. Banaro is up to date.');
});
