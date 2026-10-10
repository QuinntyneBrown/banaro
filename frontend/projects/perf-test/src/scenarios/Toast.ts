import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Toast } from 'components';

/** Success toast with an action from docs/mocks/notifications/toast/with-action. */
@Component({
  selector: 'bn-toast-scenario',
  imports: [Toast],
  template: `
    <bn-toast
      variant="success"
      heading="Added to your shortlist"
      body="Daniel Reyes is now in your shortlist."
      actionLabel="Undo"
      dismissLabel="Dismiss notification"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToastScenario {}
