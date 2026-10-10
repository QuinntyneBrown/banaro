import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, ErrorPage } from 'components';

/** Server-error page body with a reference ID (docs/mocks/pages/server-error). */
@Component({
  selector: 'bn-error-page-scenario',
  imports: [Button, ErrorPage, RouterLink],
  template: `
    <bn-error-page
      code="500"
      heading="Something went wrong on our side"
      lead="It isn't you. Try again in a moment; your profile and messages are safe."
      referenceId="7c1e4a52-9b3d-4f08-a6e2-5d90b1c3e847"
    >
      <div class="cluster">
        <button bn-button variant="primary" type="button">Try again</button>
        <a bn-button variant="quiet" routerLink="/">Go to the home page</a>
      </div>
    </bn-error-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ErrorPageScenario {}
