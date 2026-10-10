import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from 'components';

/** Submitting state of a form's primary action (docs/mocks/pages/contact/submitting). */
@Component({
  selector: 'bn-button-busy-scenario',
  imports: [Button],
  template: `<button bn-button variant="primary" type="submit" busy disabled>Sending…</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonBusyScenario {}
