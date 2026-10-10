import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';

export interface FormError {
  /** Id of the field to focus, or omitted for an error that belongs to the whole form. */
  controlId?: string;
  message: string;
}

/**
 * Error summary announced as an alert. Call `focus()` after a failed submit; each link moves
 * focus to its field.
 */
@Component({
  selector: 'bn-form-summary',
  template: `
    <div class="form-summary" id="error-summary" role="alert" tabindex="-1" #summary>
      <p class="form-summary__title">
        <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5M12 15.5h.01" />
        </svg>
        {{ heading() }}
      </p>
      <ul>
        @for (error of errors(); track error.message) {
          <li>
            @if (error.controlId) {
              <a [href]="'#' + error.controlId" (click)="focusField($event, error.controlId)">{{
                error.message
              }}</a>
            } @else {
              {{ error.message }}
            }
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: './form-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSummary {
  private readonly document = inject(DOCUMENT);
  private readonly summary = viewChild.required<ElementRef<HTMLElement>>('summary');

  readonly heading = input.required<string>();
  readonly errors = input<FormError[]>([]);

  focus(): void {
    this.summary().nativeElement.focus();
  }

  protected focusField(event: Event, controlId: string): void {
    event.preventDefault();
    this.document.getElementById(controlId)?.focus();
  }
}
