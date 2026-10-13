import { DialogRef } from '@angular/cdk/dialog';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type DialogDismissal = 'close-button' | 'escape' | 'backdrop';

/**
 * The inside of a dialog: header with icon, title and close control, a body, and a footer of
 * actions (`slot="actions"`). With `form`, body and footer sit in one form so Enter submits.
 * A non-dismissible or busy dialog ignores Escape and backdrop clicks.
 */
@Component({
  selector: 'bn-dialog',
  imports: [NgTemplateOutlet],
  host: { style: 'display: contents' },
  template: `
    <div class="dialog__header">
      @if (iconTone() !== 'none') {
        <span class="dialog__icon" [class.dialog__icon--danger]="iconTone() === 'danger'">
          <ng-content select="[slot=icon]" />
        </span>
      }
      <h2 class="dialog__title" [id]="id + '-title'" tabindex="-1">{{ heading() }}</h2>
      @if (dismissible()) {
        <button
          type="button"
          class="icon-btn icon-btn--sm"
          [attr.aria-label]="closeLabel()"
          [disabled]="busy() && !closableWhileBusy()"
          (click)="dismiss('close-button')"
        >
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      }
    </div>
    <ng-template #content>
      <div class="dialog__body">
        @if (description()) {
          <p [id]="id + '-desc'">{{ description() }}</p>
        }
        <ng-content />
      </div>
      <div class="dialog__footer"><ng-content select="[slot=actions]" /></div>
    </ng-template>
    @if (form()) {
      <form class="dialog__form" novalidate (submit)="submit($event)">
        <ng-container [ngTemplateOutlet]="content" />
      </form>
    } @else {
      <ng-container [ngTemplateOutlet]="content" />
    }
  `,
  styleUrl: './dialog.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dialog {
  private readonly ref = inject(DialogRef);

  readonly heading = input.required<string>();
  readonly description = input<string | null>(null);
  readonly iconTone = input<'accent' | 'danger' | 'none'>('accent');
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly closeLabel = input<string>('');
  readonly busy = input(false, { transform: booleanAttribute });
  readonly closableWhileBusy = input(false, { transform: booleanAttribute });
  readonly form = input(false, { transform: booleanAttribute });

  readonly submitted = output<SubmitEvent>();
  readonly dismissed = output<DialogDismissal>();

  protected readonly id = this.ref.id;

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.ref.keydownEvents.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.dismiss('escape');
      }
    });
    this.ref.backdropClick
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => this.dismiss('backdrop'));
  }

  /** Moves focus to the title, for a dialog whose content changes to a result. */
  focusTitle(): void {
    document.getElementById(`${this.id}-title`)?.focus();
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.busy()) this.submitted.emit(event as SubmitEvent);
  }

  private dismiss(reason: DialogDismissal): void {
    if (!this.dismissible()) return;
    if (this.busy() && !(reason === 'close-button' && this.closableWhileBusy())) return;
    this.dismissed.emit(reason);
    this.ref.close();
  }
}
