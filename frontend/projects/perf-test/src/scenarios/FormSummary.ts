import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormError, FormSummary } from 'components';

/** Contact error summary from docs/mocks/pages/contact/invalid. */
@Component({
  selector: 'bn-form-summary-scenario',
  imports: [FormSummary],
  template: `<bn-form-summary heading="Fix these before continuing" [errors]="errors" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FormSummaryScenario {
  protected readonly errors: FormError[] = [
    { controlId: 'c-email', message: 'Enter an e-mail address like name@example.com' },
    { controlId: 'c-topic', message: 'Choose a topic' },
    { controlId: 'c-message', message: 'Write a message so we know how to help' },
  ];
}
