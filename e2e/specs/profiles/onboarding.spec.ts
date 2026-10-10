// Acceptance Test
// Traces to: L2-006, L2-002
// Description: A verified member without a finished profile is routed to /welcome after sign-in and
// works through about, skills and goals. Role and neighbourhood are required; up to 12 skills are
// kept; leaving keeps saved steps and returns to the first unfinished one; finishing shows the
// success state with the dashboard one action away. Visitors sign in first and unverified members
// confirm their e-mail first.

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { createMember, type Member } from '../../fixtures/members';
import { OnboardingPage } from '../../pages/onboarding.page';
import { SignInPage } from '../../pages/sign-in.page';

async function signIn(page: Page, member: Member, returnTo?: string): Promise<void> {
  const signInPage = new SignInPage(page);
  await signInPage.open(returnTo);
  await signInPage.signIn(member.email, member.password);
}

test.describe('onboarding', () => {
  test.beforeEach(() => resetRateLimits());

  test('a new member lands on the first step after sign-in', async ({ page }) => {
    const member = createMember({ name: 'Amara Osei' });
    const onboarding = new OnboardingPage(page);

    await signIn(page, member);

    await expect(page).toHaveURL(/\/welcome$/);
    await expect(onboarding.title).toHaveText("Welcome, let's set up your profile");
    await expect(onboarding.currentStep).toContainText('About you');
    await expect(onboarding.name).toHaveValue('Amara Osei');
  });

  test('role and neighbourhood are required before continuing', async ({ page }) => {
    await signIn(page, createMember());
    const onboarding = new OnboardingPage(page);
    await expect(onboarding.currentStep).toContainText('About you');

    await onboarding.continue.click();

    expect(await onboarding.summaryErrors()).toEqual([
      'Choose where you are based',
      'Choose the role that fits best',
    ]);
    await expect(onboarding.currentStep).toContainText('About you');
    await page.reload();
    await expect(onboarding.currentStep).toContainText('About you');
  });

  test('the three steps finish with the success state', async ({ page }) => {
    await signIn(page, createMember({ name: 'Amara Osei' }));
    const onboarding = new OnboardingPage(page);

    await onboarding.neighbourhood.selectOption({ label: 'Leslieville' });
    await onboarding.role.selectOption({ label: 'Founder' });
    await onboarding.continue.click();

    await expect(onboarding.title).toHaveText('What do you bring?');
    await expect(onboarding.completedSteps).toHaveCount(1);
    await onboarding.skill('Figma').click();
    await onboarding.skill('Product strategy').click();
    await expect(onboarding.skill('Figma')).toHaveAttribute('aria-pressed', 'true');
    await expect(onboarding.selectedCount).toHaveText('2 selected');
    await onboarding.otherSkill.fill('Volunteer coordination');
    await onboarding.continue.click();

    await expect(onboarding.title).toHaveText('What are you hoping for?');
    await onboarding.openTo('co-founding').check();
    await onboarding.building.fill('Harvest, volunteer scheduling for GTA food banks.');
    await onboarding.finish.click();

    await expect(onboarding.title).toHaveText('Welcome to Banaro, Amara');
    await expect(onboarding.nextSteps.getByRole('listitem')).toHaveCount(3);
    await expect(onboarding.dashboard).toHaveAttribute('href', '/dashboard');
  });

  test('leaving keeps saved steps and returns to the first unfinished one', async ({ page }) => {
    await signIn(page, createMember());
    const onboarding = new OnboardingPage(page);
    await onboarding.neighbourhood.selectOption({ label: 'The Annex' });
    await onboarding.role.selectOption({ label: 'Engineer' });
    await onboarding.continue.click();
    await expect(onboarding.title).toHaveText('What do you bring?');

    await onboarding.open();

    await expect(onboarding.title).toHaveText('What do you bring?');
    await onboarding.back.click();
    await expect(onboarding.neighbourhood.locator('option:checked')).toHaveText('The Annex');
    await expect(onboarding.role.locator('option:checked')).toHaveText('Engineer');
  });

  test('a 13th skill is refused with an explanation', async ({ page }) => {
    await signIn(page, createMember());
    const onboarding = new OnboardingPage(page);
    await onboarding.neighbourhood.selectOption({ label: 'Leslieville' });
    await onboarding.role.selectOption({ label: 'Designer' });
    await onboarding.continue.click();
    await expect(onboarding.title).toHaveText('What do you bring?');

    for (const chip of await onboarding.skills.all()) await chip.click();
    await expect(onboarding.selectedCount).toHaveText('12 selected');
    await onboarding.otherSkill.fill('Calligraphy');
    await onboarding.continue.click();

    expect(await onboarding.summaryErrors()).toEqual([
      'Choose up to 12 skills. Remove one to add another.',
    ]);
    await expect(onboarding.title).toHaveText('What do you bring?');
  });

  test('a visitor signs in first and an unverified member confirms their e-mail first', async ({
    page,
  }) => {
    const onboarding = new OnboardingPage(page);
    await onboarding.open();
    await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fwelcome$/);

    await signIn(page, createMember({ verified: false }), '/welcome');

    await expect(page).toHaveURL(/\/verify-email$/);
  });
});
