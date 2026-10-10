import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Choice, Choices } from 'components';

/** The open-to choices on the goals step (docs/mocks/pages/onboarding/goals). */
@Component({
  selector: 'bn-choice-scenario',
  imports: [Choice, Choices],
  template: `
    <bn-choices>
      <bn-choice
        label="Open to co-founding"
        description="I'm looking for a co-founder, or happy to become one."
      >
        <input type="checkbox" name="goals" value="co_founding" checked />
      </bn-choice>
      <bn-choice
        label="Open to advising"
        description="I can give a few hours a month to an early team."
      >
        <input type="checkbox" name="goals" value="advising" />
      </bn-choice>
      <bn-choice label="Open to contributing" description="I'd like to help on someone's project.">
        <input type="checkbox" name="goals" value="contributing" />
      </bn-choice>
    </bn-choices>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChoiceScenario {}
