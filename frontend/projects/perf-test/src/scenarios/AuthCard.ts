import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthCard, Button } from 'components';

/** The signed-out card from docs/mocks/pages/sign-in/signed-out. */
@Component({
  selector: 'bn-auth-card-scenario',
  imports: [AuthCard, Button],
  template: `
    <bn-auth-card
      icon="check"
      heading="You're signed out"
      sub="Thanks for stopping by. Your session on this device has ended, and nothing was left behind."
    >
      <div class="form-actions">
        <a bn-button variant="primary" href="/sign-in">Sign in again</a>
        <a bn-button variant="quiet" href="/">Back to the home page</a>
      </div>
    </bn-auth-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthCardScenario {}
