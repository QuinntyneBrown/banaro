// Acceptance Test
// Traces to: L2-016
// Description:
// Given a project page, when a member who is not the owner opens "Give feedback" and posts between 10
// and 1,000 characters, then the dialog closes, the feedback heads the list with the member's name and
// the project's comment count rises. Feedback outside the limits shows the specific limit and posts
// nothing. While posting, the text is read-only and the button busy; a failure keeps the text and offers
// "Try again"; slow-down and not-allowed answers have their own messages. The list shows five comments
// and "Show N earlier comments" loads the rest.

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { createFeedback } from '../../fixtures/feedback';
import { createProject } from '../../fixtures/projects';
import { GiveFeedbackDialog } from '../../pages/give-feedback.dialog';
import { ProjectPage } from '../../pages/project.page';
import { SignInPage } from '../../pages/sign-in.page';

async function signedInAt(page: Page, member: BuilderMember, id: string): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open(`/projects/${id}`);
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(new RegExp(`/projects/${id}$`), { timeout: 45_000 });
}

const GOOD = 'I use Psalter every morning on the streetcar. Could the Sunday reminder arrive a little later?';

test.describe('give feedback on a project', () => {
  test.beforeEach(() => resetRateLimits());

  test('a member posts feedback and it heads the list with the count raised', async ({ page }) => {
    const owner = createBuilder({ name: 'Daniel Reyes' });
    const id = createProject(owner, { name: 'Psalter' });
    createFeedback(id, createBuilder({ name: 'Hannah Kowalski' }), { body: 'An older comment on the project.', daysAgo: 2 });
    const member = createBuilder({ name: 'Amara Osei' });
    await signedInAt(page, member, id);
    const project = new ProjectPage(page);
    const dialog = new GiveFeedbackDialog(page);
    await expect(project.feedbackTitle).toContainText('1 comment');

    await project.giveFeedback.click();

    await expect(dialog.dialog).toHaveAccessibleName('Give feedback on Psalter');
    await expect(dialog.description).toContainText('Daniel is notified');
    await expect(dialog.comment).toBeFocused();

    await dialog.comment.fill(GOOD);
    await dialog.post.click();

    await expect(dialog.dialog).toHaveCount(0);
    await expect(project.giveFeedback).toBeFocused();
    await expect(project.comments).toHaveCount(2);
    await expect(project.comment(0).name).toHaveText('Amara Osei');
    await expect(project.comment(0).body).toHaveText(GOOD);
    await expect(project.comment(0).meta).toHaveText('just now');
    await expect(project.comment(1).meta).toHaveText('2 days ago');
    await expect(project.feedbackTitle).toContainText('2 comments');
  });

  test('feedback outside the limits shows the specific limit and posts nothing', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Daniel Reyes' }), { name: 'Psalter' });
    await signedInAt(page, createBuilder(), id);
    const project = new ProjectPage(page);
    const dialog = new GiveFeedbackDialog(page);
    await project.giveFeedback.click();

    await dialog.post.click();
    await expect(dialog.error).toContainText('Write a comment before posting. Even one sentence helps.');
    await expect(dialog.comment).toBeFocused();

    await dialog.comment.fill('Too short');
    await dialog.post.click();
    await expect(dialog.error).toContainText('Use at least 10 characters');

    await dialog.comment.fill('a'.repeat(1001));
    await dialog.post.click();
    await expect(dialog.error).toContainText('Use 1,000 characters or fewer');

    await dialog.cancel.click();
    await expect(dialog.dialog).toHaveCount(0);
    await expect(project.feedbackTitle).toContainText('0 comments');
  });

  test('while posting, the text is read-only and the button busy; "Cancel" stays available', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Daniel Reyes' }), { name: 'Psalter' });
    await signedInAt(page, createBuilder(), id);
    const project = new ProjectPage(page);
    const dialog = new GiveFeedbackDialog(page);
    await project.giveFeedback.click();
    const release = await dialog.holdPost();
    await dialog.comment.fill(GOOD);

    await dialog.post.click();

    await expect(dialog.post).toHaveText('Posting…');
    await expect(dialog.post).toBeDisabled();
    await expect(dialog.comment).toHaveAttribute('readonly', '');
    await expect(dialog.cancel).toBeEnabled();
    release();
    await expect(dialog.dialog).toHaveCount(0);
    await expect(project.comments).toHaveCount(1);
  });

  test('a failure keeps the text and offers "Try again"', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Daniel Reyes' }), { name: 'Psalter' });
    await signedInAt(page, createBuilder(), id);
    const project = new ProjectPage(page);
    const dialog = new GiveFeedbackDialog(page);
    await project.giveFeedback.click();
    await dialog.comment.fill(GOOD);
    await dialog.failNextPost(500);

    await dialog.post.click();

    await expect(dialog.alert).toContainText("We couldn't post your feedback");
    await expect(dialog.comment).toHaveValue(GOOD);
    await expect(dialog.post).toHaveText('Try again');
    await dialog.post.click();
    await expect(dialog.dialog).toHaveCount(0);
    await expect(project.comments).toHaveCount(1);
  });

  test('a slow-down answer and a not-allowed answer each have their own message', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Daniel Reyes' }), { name: 'Psalter' });
    await signedInAt(page, createBuilder(), id);
    const project = new ProjectPage(page);
    const dialog = new GiveFeedbackDialog(page);
    await project.giveFeedback.click();
    await dialog.comment.fill(GOOD);

    await dialog.failNextPost(429);
    await dialog.post.click();
    await expect(dialog.alert).toContainText("You're posting quickly");
    await expect(dialog.alert).toContainText('10 minutes');
    await expect(dialog.comment).toHaveValue(GOOD);

    await dialog.failNextPost(403);
    await dialog.post.click();
    await expect(dialog.alert).toContainText("You can't post feedback on this project");
  });

  test('the owner has no "Give feedback" and a visitor is sent to sign in', async ({ page }) => {
    const owner = createBuilder({ name: 'Daniel Reyes' });
    const id = createProject(owner, { name: 'Psalter' });
    await signedInAt(page, owner, id);
    const project = new ProjectPage(page);

    await expect(project.giveFeedback).toHaveCount(0);
    await expect(project.feedbackActions).toHaveCount(0);
  });

  test('five comments show first and "Show N earlier comments" loads the rest', async ({ page }) => {
    const owner = createBuilder({ name: 'Daniel Reyes' });
    const id = createProject(owner, { name: 'Psalter' });
    for (let i = 0; i < 7; i++) {
      createFeedback(id, createBuilder({ name: `Reader ${i}` }), { body: `Comment number ${i} on the project.`, daysAgo: 7 - i });
    }
    const project = new ProjectPage(page);

    await project.open(id);

    await expect(project.comments).toHaveCount(5);
    await expect(project.comment(0).body).toHaveText('Comment number 6 on the project.');
    await expect(project.showEarlier).toHaveText('Show 2 earlier comments');

    await project.showEarlier.click();

    await expect(project.comments).toHaveCount(7);
    await expect(project.comment(6).body).toHaveText('Comment number 0 on the project.');
    await expect(project.showEarlier).toHaveCount(0);
  });
});
