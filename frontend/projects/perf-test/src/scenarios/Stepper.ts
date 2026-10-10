import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Stepper, StepperStep } from 'components';

const STEPS: StepperStep[] = [
  { position: 'Step 1 of 3', label: 'About you' },
  { position: 'Step 2 of 3', label: 'Skills' },
  { position: 'Step 3 of 3', label: 'Goals' },
];

/** Onboarding progress on the skills step (docs/mocks/pages/onboarding/skills). */
@Component({
  selector: 'bn-stepper-scenario',
  imports: [Stepper],
  template: `<bn-stepper
    [steps]="steps"
    [current]="1"
    label="Progress"
    completeLabel="Complete"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperScenario {
  protected readonly steps = STEPS;
}
