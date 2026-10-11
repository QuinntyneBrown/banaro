import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TRUST_AND_SAFETY_API, TranslatePipe } from 'api';
import { Alert, Button, Dialog } from 'components';

export interface BlockBuilderData {
  builderId: string;
  name: string;
  firstName: string;
}

/**
 * Confirms a block and says what it does (L2-032). Focus starts on "Cancel", the safe choice.
 * While busy "Cancel" still closes the dialog and the request completes; a failure keeps it open
 * with "Try again". Closes with `true` once the block is stored.
 */
@Component({
  selector: 'bn-block-builder-dialog',
  imports: [Alert, Button, Dialog, TranslatePipe],
  template: `
    <bn-dialog
      iconTone="danger"
      [heading]="'trustAndSafety.block.title' | t: { name: data.name }"
      [description]="'trustAndSafety.block.description' | t"
      [closeLabel]="'trustAndSafety.block.close' | t"
      [busy]="busy()"
      closableWhileBusy
      form
      (submitted)="block()"
    >
      <svg slot="icon" class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m6 6 12 12" />
      </svg>
      @if (failed()) {
        <bn-alert
          variant="danger"
          [heading]="'trustAndSafety.block.failed.title' | t: { name: data.firstName }"
        >
          {{ 'trustAndSafety.block.failed.body' | t }}
        </bn-alert>
      }
      <ul class="consequences">
        <li>{{ 'trustAndSafety.block.noContact' | t: { name: data.firstName } }}</li>
        <li>{{ 'trustAndSafety.block.notListed' | t }}</li>
        <li>{{ 'trustAndSafety.block.notTold' | t }}</li>
      </ul>
      <p class="muted">{{ 'trustAndSafety.block.undo' | t }}</p>
      <button slot="actions" bn-button variant="quiet" type="button" (click)="cancel()">
        {{ 'trustAndSafety.block.cancel' | t }}
      </button>
      <button
        slot="actions"
        bn-button
        variant="danger"
        type="submit"
        [busy]="busy()"
        [disabled]="busy()"
      >
        {{
          busy()
            ? ('trustAndSafety.block.busy' | t)
            : failed()
              ? ('trustAndSafety.block.tryAgain' | t)
              : ('trustAndSafety.block.confirm' | t: { name: data.firstName })
        }}
      </button>
    </bn-dialog>
  `,
  styles: `
    .consequences {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding-left: var(--space-6);
    }
    .muted {
      margin: 0;
      color: var(--color-fg-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockBuilderDialog {
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);
  private readonly api = inject(TRUST_AND_SAFETY_API);
  protected readonly data = inject<BlockBuilderData>(DIALOG_DATA);

  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  protected block(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.failed.set(false);
    this.api.block(this.data.builderId).subscribe({
      next: () => this.ref.close(true),
      error: () => {
        this.busy.set(false);
        this.failed.set(true);
      },
    });
  }

  /** Cancel always closes; a block already sent still completes on the server. */
  protected cancel(): void {
    this.ref.close(false);
  }
}
