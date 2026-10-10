import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Label, control, help and error for one form field. Project the control and point its
 * `aria-describedby` at `fieldDescriptionId(controlId, error)`.
 */
@Component({
  selector: 'bn-field',
  template: `
    <div class="field">
      <label class="field__label" [attr.for]="controlId()">{{ label() }}</label>
      <ng-content />
      @if (error()) {
        <p class="field__error" [id]="controlId() + '-err'">
          <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5v5M12 15.5h.01" />
          </svg>
          <span>{{ error() }}</span>
        </p>
      } @else if (help()) {
        <p class="field__help" [id]="controlId() + '-help'">{{ help() }}</p>
      }
    </div>
  `,
  styleUrl: './field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Field {
  readonly label = input.required<string>();
  readonly controlId = input.required<string>();
  readonly help = input<string>();
  readonly error = input<string | null>();
}

/** The id the control's `aria-describedby` should name: the error when shown, else the help. */
export function fieldDescriptionId(
  controlId: string,
  error: string | null | undefined,
  hasHelp = false,
): string | null {
  if (error) return `${controlId}-err`;
  return hasHelp ? `${controlId}-help` : null;
}
