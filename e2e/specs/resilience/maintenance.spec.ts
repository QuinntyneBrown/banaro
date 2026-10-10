// Acceptance Test
// Traces to: L2-043
// Description: When the API is in maintenance the app shows the maintenance page with the expected
// time back in Toronto time, "Check again" and a mailto "Contact us".

import { expect, test } from '@playwright/test';
import { ApiSimulator } from '../../pages/api-simulator';
import { ContactPage } from '../../pages/contact.page';
import { ErrorPage } from '../../pages/error-page';

test('an API request during maintenance shows the maintenance page', async ({ page }) => {
  const contact = new ContactPage(page);
  await contact.open();
  await new ApiSimulator(page).maintenance(1800);

  await contact.fill({
    name: 'Amara Osei',
    email: 'amara@harvest.example',
    topic: 'General',
    message: 'A message sent during maintenance.',
  });
  await contact.submit();

  const maintenance = new ErrorPage(page);
  await expect(maintenance.title).toHaveText('Down for a short maintenance');
  await expect(page.getByRole('main')).toContainText(/expect to be back by \d{1,2}:\d{2} (am|pm) Eastern/);
  await expect(maintenance.robots).toHaveAttribute('content', 'noindex');
  await expect(maintenance.action('Check again')).toBeVisible();
  await expect(maintenance.action('Contact us')).toHaveAttribute('href', 'mailto:support@banaro.ca');
  await expect(page).toHaveURL(/\/contact$/);
});

test('/maintenance shows the page without a time', async ({ page }) => {
  const maintenance = new ErrorPage(page);
  await maintenance.open('/maintenance');

  await expect(maintenance.title).toHaveText('Down for a short maintenance');
});
