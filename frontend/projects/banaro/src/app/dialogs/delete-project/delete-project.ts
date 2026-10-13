import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PROJECTS_API, TranslatePipe, TranslationService } from 'api';
import { Alert, Button, Dialog, Field, fieldDescriptionId, Input } from 'components';

export interface DeleteProjectData {
  projectId: string;
  name: string;
  commentCount: number;
}

/**
 * Confirms deleting a project (L2-014 criteria 3 to 5). The danger button stays disabled until the
 * project's name is typed exactly. While deleting, the dialog cannot be dismissed; a failure keeps
 * it open with the typed name and "Try again". Closes with `true` once the project is deleted.
 */
@Component({
  selector: 'bn-delete-project-dialog',
  imports: [Alert, Button, Dialog, Field, FormsModule, Input, TranslatePipe],
  template: `
    <bn-dialog
      iconTone="danger"
      [heading]="'projects.delete.title' | t: { name: data.name }"
      [description]="'projects.delete.description' | t: { count: data.commentCount }"
      [closeLabel]="'projects.delete.closeLabel' | t"
      [busy]="busy()"
      form
      (submitted)="remove()"
    >
      <svg slot="icon" class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 7h14M10 4h4M7 7l.8 12.5h8.4L17 7M10 11v5M14 11v5" />
      </svg>
      @if (failed()) {
        <bn-alert
          variant="danger"
          [heading]="'projects.delete.failed.title' | t: { name: data.name }"
        >
          {{ 'projects.delete.failed.body' | t }}
        </bn-alert>
      }
      <ul class="consequences">
        <li>{{ 'projects.delete.removed' | t }}</li>
        <li>{{ 'projects.delete.offers' | t }}</li>
      </ul>
      <bn-field
        [label]="'projects.delete.confirmLabel' | t"
        controlId="confirm-name"
        [help]="'projects.delete.help' | t: { name: data.name }"
        [error]="mismatch() ? ('projects.delete.mismatch' | t: { name: data.name }) : undefined"
      >
        <input
          bn-input
          id="confirm-name"
          name="confirm-name"
          type="text"
          autocomplete="off"
          [ngModel]="typed()"
          (ngModelChange)="typed.set($event)"
          [readonly]="busy()"
          [invalid]="mismatch()"
          [attr.aria-describedby]="describedBy('confirm-name', mismatch() ? 'x' : undefined, true)"
        />
      </bn-field>
      <button
        slot="actions"
        bn-button
        variant="quiet"
        type="button"
        [disabled]="busy()"
        (click)="cancel()"
      >
        {{ 'projects.delete.keep' | t }}
      </button>
      <button
        slot="actions"
        bn-button
        variant="danger"
        type="submit"
        [busy]="busy()"
        [disabled]="busy() || !matches()"
      >
        {{
          busy()
            ? ('projects.delete.busy' | t)
            : failed()
              ? ('projects.delete.tryAgain' | t)
              : ('projects.delete.confirm' | t)
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
      color: var(--color-fg-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteProjectDialog {
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);
  private readonly api = inject(PROJECTS_API);
  protected readonly data = inject<DeleteProjectData>(DIALOG_DATA);
  protected readonly i18n = inject(TranslationService);
  protected readonly describedBy = fieldDescriptionId;

  protected readonly typed = signal('');
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly matches = computed(() => this.typed() === this.data.name);
  /** A mismatch shows as the name is typed, never before anything is typed. */
  protected readonly mismatch = computed(() => this.typed() !== '' && !this.matches());

  protected remove(): void {
    if (this.busy() || !this.matches()) return;
    this.busy.set(true);
    this.failed.set(false);
    this.api.delete(this.data.projectId).subscribe({
      next: () => this.ref.close(true),
      error: () => {
        this.busy.set(false);
        this.failed.set(true);
      },
    });
  }

  protected cancel(): void {
    this.ref.close(false);
  }
}
