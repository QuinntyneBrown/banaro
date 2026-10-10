// Acceptance Test
// Traces to: L2-040, L2-046
// Description: A visitor writes to the team from /contact through the default, invalid, submitting
// and success states; the fourth message within an hour shows the slow-down message.

import { expect, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { ContactPage } from '../../pages/contact.page';

const amara = {
  name: 'Amara Osei',
  email: 'amara@harvest.example',
  topic: 'Propose an event',
  message: "Could our Saturday prayer group at St. Matthew's list a monthly breakfast on Banaro?",
};

test.describe.configure({ mode: 'serial' });

test.beforeEach(() => resetRateLimits());

test('an empty submission shows each error and focuses the summary', async ({ page }) => {
  const contact = new ContactPage(page);
  await contact.open();
  await expect(contact.name).toBeFocused();

  await contact.fill({ email: 'amara@' });
  await contact.submit();

  await expect(contact.errorSummary).toBeFocused();
  await expect(contact.errorSummary).toHaveAttribute('role', 'alert');
  expect(await contact.summaryErrors()).toEqual([
    'Enter your name',
    'Enter an e-mail address like name@example.com',
    'Choose a topic',
    'Write a message so we know how to help',
  ]);
  await expect(contact.email).toHaveAttribute('aria-invalid', 'true');
  expect(await contact.fieldError(contact.email)).toBe('Enter an e-mail address like name@example.com');
});

test('a valid message shows the submitting state, then the thank-you', async ({ page }) => {
  const contact = new ContactPage(page);
  await contact.open();
  await contact.fill(amara);
  const release = await contact.holdSubmission();

  await contact.submit();

  await expect(contact.send).toBeDisabled();
  await expect(contact.send).toHaveText('Sending…');
  await expect(contact.send).toHaveAttribute('aria-busy', 'true');
  await expect(contact.name).toHaveAttribute('readonly', '');

  await release();
  await expect(contact.title).toHaveText('Thank you, Amara');
  await expect(contact.successAlert).toContainText('Message sent');
  await expect(contact.successAlert).toContainText('We will reply to amara@harvest.example');
});

test('the fourth message within an hour asks the visitor to slow down', async ({ page }) => {
  const contact = new ContactPage(page);
  for (let i = 0; i < 3; i++) {
    await contact.open();
    await contact.fill(amara);
    await contact.submit();
    await expect(contact.successAlert).toBeVisible();
  }

  await contact.open();
  await contact.fill(amara);
  await contact.submit();

  await expect(contact.errorSummary).toContainText("You're trying too fast. Wait 60 minutes, then try again.");
  await expect(contact.name).toHaveValue('Amara Osei');
});
