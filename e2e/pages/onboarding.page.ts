import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Onboarding at `/welcome` (docs/mocks/pages/onboarding). */
export class OnboardingPage {
  readonly title: Locator;
  readonly currentStep: Locator;
  readonly completedSteps: Locator;
  readonly errorSummary: Locator;
  readonly name: Locator;
  readonly neighbourhood: Locator;
  readonly role: Locator;
  readonly skills: Locator;
  readonly selectedCount: Locator;
  readonly otherSkill: Locator;
  readonly building: Locator;
  readonly continue: Locator;
  readonly finish: Locator;
  readonly back: Locator;
  readonly nextSteps: Locator;
  readonly dashboard: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.auth__title');
    this.currentStep = main.locator('.stepper__step[aria-current="step"]');
    this.completedSteps = main.locator('.stepper__step.is-done');
    this.errorSummary = main.locator('.form-summary');
    this.name = main.getByLabel('Full name');
    this.neighbourhood = main.getByLabel('Neighbourhood or city');
    this.role = main.getByLabel('What best describes your role?');
    this.skills = main.locator('.chips .chip');
    this.selectedCount = main.locator('[aria-live="polite"]', { hasText: 'selected' });
    this.otherSkill = main.getByLabel(/Something else\?/);
    this.building = main.getByLabel(/What are you building\?/);
    this.continue = main.getByRole('button', { name: /^(Continue|Saving…)$/ });
    this.finish = main.getByRole('button', { name: /^(Finish|Finishing…)$/ });
    this.back = main.getByRole('button', { name: 'Back' });
    this.nextSteps = main.getByRole('list', { name: 'Next steps' });
    this.dashboard = main.getByRole('link', { name: 'Go to your dashboard' });
  }

  async open(): Promise<void> {
    await this.page.goto('/welcome');
    await waitForApp(this.page);
  }

  skill(name: string): Locator {
    return this.page.getByRole('main').locator('.chips').getByRole('button', { name, exact: true });
  }

  openTo(choice: 'co-founding' | 'advising' | 'contributing'): Locator {
    return this.page.getByRole('main').getByRole('checkbox', { name: new RegExp(`Open to ${choice}`) });
  }

  summaryErrors(): Promise<string[]> {
    return this.errorSummary
      .locator('li')
      .allTextContents()
      .then((items) => items.map((i) => i.trim()));
  }
}
