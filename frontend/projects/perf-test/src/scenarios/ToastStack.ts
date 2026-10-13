import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Toast } from 'components';

/** Three stacked toasts from docs/mocks/notifications/toast/stacked. */
@Component({
  selector: 'bn-toast-stack-scenario',
  imports: [Toast],
  template: `
    <div class="toast-region" role="status" aria-live="polite">
      <bn-toast
        variant="success"
        heading="Message sent to Daniel"
        body="He'll reply in your Banaro messages."
        dismissLabel="Dismiss notification"
      />
      <bn-toast
        variant="warning"
        heading="Only 2 spots left"
        body="Fall Demo Night is almost full."
        dismissLabel="Dismiss notification"
      />
      <bn-toast
        variant="danger"
        heading="We couldn't save your RSVP"
        body="Check your connection and try again."
        actionLabel="Try again"
        dismissLabel="Dismiss notification"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToastStackScenario {}
