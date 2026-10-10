// Acceptance Test
// Traces to: L2-043
// Description: Navigating to a page that is not loaded while offline shows the offline page, which
// loads the page once the connection returns; unsent text stays and is sent only by the person.

import { expect, test } from '@playwright/test';
import { AboutPage } from '../../pages/about.page';
import { ConnectionBanner } from '../../pages/connection-banner';
import { ContactPage } from '../../pages/contact.page';
import { ErrorPage } from '../../pages/error-page';
import { HomePage } from '../../pages/home.page';

test('a page that is not loaded shows the offline page until the connection returns', async ({ page, context }) => {
  const home = new HomePage(page);
  await home.open();

  await ConnectionBanner.goOffline(context);
  await home.footerLink('About').click();

  const offline = new ErrorPage(page);
  await expect(offline.title).toHaveText("You're offline");
  await expect(offline.action('Try again')).toBeVisible();

  await ConnectionBanner.goOnline(context);
  await expect(new AboutPage(page).title).toHaveText('Build with believers down the street');
  await expect(page).toHaveURL(/\/about$/);
});

test('unsent text stays while offline and is sent only when the person sends it', async ({ page, context }) => {
  const contact = new ContactPage(page);
  await contact.open();
  await contact.fill({ name: 'Amara Osei', email: 'amara@harvest.example', topic: 'General', message: 'Written on the subway.' });

  await ConnectionBanner.goOffline(context);
  await expect(contact.send).toBeDisabled();

  await ConnectionBanner.goOnline(context);
  await expect(contact.send).toBeEnabled();
  await expect(contact.message).toHaveValue('Written on the subway.');
  await expect(contact.successAlert).toHaveCount(0);
});
