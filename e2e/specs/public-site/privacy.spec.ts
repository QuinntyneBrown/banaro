// Acceptance Test
// Traces to: L2-041
// Description: /privacy lists the data collected, purposes, retention periods, processors, member
// rights and a privacy contact, states PIPEDA compliance and shows when it was last updated.

import { expect, test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { PrivacyPage } from '../../pages/privacy.page';

test('a visitor reads the privacy policy', async ({ page }) => {
  const privacy = new PrivacyPage(page);
  await privacy.open();

  await expect(privacy.title).toHaveText('Your privacy');
  await expect(privacy.lastUpdated).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
  await expect(privacy.lastUpdated).toHaveText(/^\d{1,2} [A-Z][a-z]+ \d{4}$/);
  expect(await privacy.sectionTitles()).toEqual(
    expect.arrayContaining([
      'What we collect',
      'What we do with it',
      'How long we keep it',
      'Who helps us run Banaro',
      'Your rights',
      'Contact our privacy lead',
    ]),
  );
  await expect(privacy.section('How long we keep it')).toContainText('30 days');
  for (const right of ['see the personal information', 'download a copy', 'correct', 'delete your account']) {
    await expect(privacy.section('Your rights')).toContainText(right);
  }
  await expect(privacy.section('Contact our privacy lead')).toContainText('privacy@banaro.ca');
  await expect(privacy.body).toContainText('Personal Information Protection and Electronic Documents Act (PIPEDA)');
});

test('the footer link opens the current policy', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  await page.waitForLoadState('networkidle');

  await home.footerLink('Privacy').click();

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(new PrivacyPage(page).lastUpdated).toBeVisible();
});
