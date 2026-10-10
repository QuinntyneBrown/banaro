import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConnectivityService, TranslatePipe } from 'api';
import { Banner, Button } from 'components';

/** Connection state above the header on every page (L2-028 criteria 6–9). */
@Component({
  selector: 'bn-connection-banner',
  imports: [Banner, Button, TranslatePipe],
  template: `
    @switch (connectivity.banner()) {
      @case ('warning') {
        <bn-banner kind="connection" variant="warning" [text]="'common.connection.offline' | t" />
      }
      @case ('info') {
        <bn-banner
          kind="connection"
          variant="info"
          dismissible
          [dismissLabel]="'common.dismissBanner' | t"
          [text]="'common.connection.reconnecting' | t"
        />
      }
      @case ('danger') {
        <bn-banner
          kind="connection"
          variant="danger"
          dismissible
          [dismissLabel]="'common.dismissBanner' | t"
          [text]="'common.connection.failed' | t"
          (dismissed)="connectivity.dismissFailure()"
        >
          <button bn-button variant="quiet" size="sm" type="button" (click)="connectivity.retry()">
            {{ 'common.connection.retry' | t }}
          </button>
        </bn-banner>
      }
      @case ('success') {
        <bn-banner
          kind="connection"
          variant="success"
          dismissible
          [dismissLabel]="'common.dismissBanner' | t"
          [autoDismissMs]="6000"
          [text]="'common.connection.restored' | t"
          (dismissed)="connectivity.dismissRecovered()"
        />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionBanner {
  protected readonly connectivity = inject(ConnectivityService);
}
