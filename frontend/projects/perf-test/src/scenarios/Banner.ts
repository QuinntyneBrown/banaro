import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Banner, Button } from 'components';

/** Danger connection banner with an action (docs/mocks/notifications/connection-banner/danger). */
@Component({
  selector: 'bn-banner-scenario',
  imports: [Banner, Button],
  template: `
    <bn-banner
      kind="connection"
      variant="danger"
      dismissible
      text="We couldn't reconnect. Check your network, then try again."
    >
      <button bn-button variant="quiet" size="sm" type="button">Try again</button>
    </bn-banner>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BannerScenario {}
