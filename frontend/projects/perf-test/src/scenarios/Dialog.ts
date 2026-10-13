import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button, Dialog, Field, Input } from 'components';
import { EMPTY } from 'rxjs';

/**
 * The session-expired dialog from docs/mocks/dialogs/session-expired/default, rendered inside the
 * `.dialog` panel without the CDK overlay so only bn-dialog's own render is measured.
 */
@Component({
  selector: 'bn-dialog-scenario',
  imports: [Button, Dialog, Field, Input],
  providers: [
    {
      provide: DialogRef,
      useValue: {
        id: 'perf-dialog',
        keydownEvents: EMPTY,
        backdropClick: EMPTY,
        close: () => undefined,
      },
    },
  ],
  template: `
    <div class="dialog" role="dialog" aria-labelledby="perf-dialog-title">
      <bn-dialog
        heading="Your session has expired"
        description="For your safety Banaro signed you out after a long break. Sign back in and your unsaved changes will still be here."
        [dismissible]="false"
        form
      >
        <svg slot="icon" class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
        <bn-field label="Password" controlId="perf-dialog-password">
          <input
            bn-input
            id="perf-dialog-password"
            type="password"
            autocomplete="current-password"
          />
        </bn-field>
        <button slot="actions" bn-button variant="quiet" type="button">Sign out</button>
        <button slot="actions" bn-button variant="primary" type="submit">Sign back in</button>
      </bn-dialog>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogScenario {}
