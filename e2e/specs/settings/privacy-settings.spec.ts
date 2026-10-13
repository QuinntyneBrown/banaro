// Acceptance Test
// Traces to: L2-036
// Description:
// Given a signed-in member, when they open Settings and its Privacy section, then they see who can
// see their profile, location precision, e-mail contact, online status and attendee-list listing,
// set to the defaults of a new account (members only, online status on, attendee listing off).
// When they change each setting and save, then the saved state confirms it and a reload shows the
// new values. A failed save keeps their choices and says so. A visitor is sent to sign in.

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { SettingsPage } from '../../pages/settings.page';
import { SignInPage } from '../../pages/sign-in.page';

async function signedIn(page: Page, member: BuilderMember): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
}

test.describe('privacy settings', () => {
  test.beforeEach(() => resetRateLimits());

  test('the privacy section shows the five settings at their defaults', async ({ page }) => {
    await signedIn(page, createBuilder());
    const settings = new SettingsPage(page);

    await settings.openPrivacy();

    await expect(settings.title).toHaveText('Settings');
    await expect(settings.currentSection).toHaveText('Privacy');
    await expect(settings.sectionTitle).toHaveText('Privacy');
    await expect(settings.choice('Signed-in builders')).toBeChecked();
    await expect(settings.choice('Everyone')).not.toBeChecked();
    await expect(settings.choice('My neighbourhood')).toBeChecked();
    await expect(settings.choice('My city only')).not.toBeChecked();
    await expect(settings.switch('Show my e-mail address to builders')).not.toBeChecked();
    await expect(settings.switch('Show when I was last online')).toBeChecked();
    await expect(settings.switch('List me as going to events')).not.toBeChecked();
  });

  test('saving stores every setting and a reload shows them', async ({ page }) => {
    await signedIn(page, createBuilder());
    const settings = new SettingsPage(page);
    await settings.openPrivacy();

    await settings.choice('Everyone').check();
    await settings.choice('My city only').check();
    await settings.switch('Show my e-mail address to builders').check();
    await settings.switch('Show when I was last online').uncheck();
    await settings.switch('List me as going to events').check();
    await settings.save.click();

    await expect(settings.saved).toContainText('Saved');
    await page.reload();
    await expect(settings.choice('Everyone')).toBeChecked();
    await expect(settings.choice('My city only')).toBeChecked();
    await expect(settings.switch('Show my e-mail address to builders')).toBeChecked();
    await expect(settings.switch('Show when I was last online')).not.toBeChecked();
    await expect(settings.switch('List me as going to events')).toBeChecked();
  });

  test('a failed save keeps the choices and says so', async ({ page }) => {
    await signedIn(page, createBuilder());
    const settings = new SettingsPage(page);
    await settings.openPrivacy();
    await settings.failNextSave();

    await settings.choice('Everyone').check();
    await settings.save.click();

    await expect(settings.failed).toContainText("We couldn't save your settings");
    await expect(settings.choice('Everyone')).toBeChecked();
    await settings.save.click();
    await expect(settings.saved).toContainText('Saved');
  });

  test('a visitor is sent to sign in', async ({ page }) => {
    const settings = new SettingsPage(page);

    await settings.openPrivacy();

    await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fsettings%2Fprivacy$/);
  });
});
