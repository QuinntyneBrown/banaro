// Acceptance Test
// Traces to: L2-032
// Description:
// Given another builder's profile, when the member chooses "Block {first name}" from "More", then the
// dialog explains what blocking does with focus on "Cancel"; confirming hides both members from each
// other, returns the member to the directory and confirms with a toast, and the profile is no longer
// found. A failed block shows the failed state with "Try again". Settings lists blocked builders, and
// "Unblock" restores visibility.

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { BlockBuilderDialog } from '../../pages/block-builder.dialog';
import { BuilderProfilePage } from '../../pages/builder-profile.page';
import { SettingsPage } from '../../pages/settings.page';
import { SignInPage } from '../../pages/sign-in.page';
import { Toasts } from '../../pages/toasts';

async function signedIn(page: Page, member: BuilderMember): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
}

test.describe('block a builder', () => {
  test.beforeEach(() => resetRateLimits());

  test('blocking from a profile hides the builder and confirms with a toast', async ({ page }) => {
    const daniel = createBuilder({ name: 'Daniel Reyes' });
    await signedIn(page, createBuilder());
    const profile = new BuilderProfilePage(page);
    const dialog = new BlockBuilderDialog(page);
    const toasts = new Toasts(page);
    await profile.open(daniel.builderId);

    await profile.block('Daniel');

    await expect(dialog.dialog).toHaveAccessibleName('Block Daniel Reyes?');
    await expect(dialog.description).toHaveText('This hides you from each other across Banaro.');
    await expect(dialog.consequences).toHaveText([
      "Daniel won't be able to message you or see your profile.",
      "You won't see them in the directory or in your matches.",
      "They aren't told that you blocked them.",
    ]);
    await expect(dialog.cancel).toBeFocused();

    await dialog.confirm.click();

    await expect(page).toHaveURL(/\/builders$/);
    await expect(toasts.withTitle('You blocked Daniel')).toContainText(
      "You won't see each other on Banaro.",
    );
    await profile.open(daniel.builderId);
    await expect(profile.notFoundTitle).toHaveText("We can't find that builder");
  });

  test('a failed block offers "Try again"', async ({ page }) => {
    const daniel = createBuilder({ name: 'Daniel Reyes' });
    await signedIn(page, createBuilder());
    const profile = new BuilderProfilePage(page);
    const dialog = new BlockBuilderDialog(page);
    await profile.open(daniel.builderId);
    await profile.block('Daniel');
    await dialog.failNextBlock();

    await dialog.confirm.click();

    await expect(dialog.alert).toContainText("We couldn't block Daniel");
    await expect(dialog.alert).toContainText('Nothing changed. Check your connection and try again.');
    await expect(dialog.confirm).toHaveText('Try again');
    await dialog.confirm.click();
    await expect(page).toHaveURL(/\/builders$/);
  });

  test('settings lists blocked builders and "Unblock" restores them', async ({ page }) => {
    const daniel = createBuilder({ name: 'Daniel Reyes' });
    await signedIn(page, createBuilder());
    const profile = new BuilderProfilePage(page);
    const dialog = new BlockBuilderDialog(page);
    const settings = new SettingsPage(page);
    const toasts = new Toasts(page);
    await profile.open(daniel.builderId);
    await profile.block('Daniel');
    await dialog.confirm.click();
    await expect(page).toHaveURL(/\/builders$/);

    await settings.openBlocked();

    await expect(settings.currentSection).toHaveText('Blocked builders');
    await expect(settings.blockedRows).toHaveCount(1);
    await expect(settings.blockedRows.first()).toContainText('Daniel Reyes');
    await settings.unblock('Daniel Reyes').click();
    await expect(toasts.withTitle('You unblocked Daniel')).toBeVisible();
    await expect(settings.blockedRows).toHaveCount(0);
    await expect(settings.noneBlocked).toHaveText("You haven't blocked anyone");
    await profile.open(daniel.builderId);
    await expect(profile.name).toHaveText('Daniel Reyes');
  });
});
