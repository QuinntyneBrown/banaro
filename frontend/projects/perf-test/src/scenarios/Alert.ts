import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alert, Button } from 'components';

/** Contact success alert from docs/mocks/pages/contact/success. */
@Component({
  selector: 'bn-alert-scenario',
  imports: [Alert, Button, RouterLink],
  template: `
    <bn-alert variant="success" heading="Message sent">
      We will reply to amara&#64;harvest.example, usually within two working days.
      <a slot="actions" bn-button variant="quiet" size="sm" routerLink="/">Back to the home page</a>
    </bn-alert>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlertScenario {}
