import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { Button } from '../button/button';
import { ToastVariant } from './toast.service';

let nextId = 1;

/**
 * One toast: icon, title, close button, optional body and action. Danger toasts are announced
 * assertively (`role="alert"`), the others politely (`role="status"`).
 */
@Component({
  selector: 'bn-toast',
  imports: [Button],
  template: `
    <div
      [class]="variant() === 'info' ? 'toast' : 'toast toast--' + variant()"
      [attr.role]="variant() === 'danger' ? 'alert' : 'status'"
      [attr.data-toast]="kind() ?? null"
      [attr.data-state]="leaving() ? 'leaving' : null"
      (mouseenter)="hover(true)"
      (mouseleave)="hover(false)"
      (focusin)="focus(true)"
      (focusout)="focus(false)"
    >
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        @switch (variant()) {
          @case ('success') {
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          }
          @case ('warning') {
            <path d="M12 4 3 19.5h18z" />
            <path d="M12 10v4M12 16.5h.01" />
          }
          @case ('danger') {
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5v5M12 15.5h.01" />
          }
          @default {
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 11v5M12 8h.01" />
          }
        }
      </svg>
      <p class="toast__title" [id]="titleId">{{ heading() }}</p>
      <button
        type="button"
        class="icon-btn toast__close"
        [attr.aria-label]="dismissLabel()"
        [attr.aria-describedby]="titleId"
        (click)="dismissed.emit()"
      >
        <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
      @if (body()) {
        <p class="toast__body">{{ body() }}</p>
      }
      @if (actionLabel()) {
        <button
          bn-button
          variant="text"
          size="sm"
          type="button"
          class="toast__action"
          [disabled]="acted()"
          (click)="act()"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styleUrl: './toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  readonly variant = input<ToastVariant>('info');
  readonly heading = input.required<string>();
  readonly body = input<string>();
  readonly actionLabel = input<string>();
  readonly dismissLabel = input.required<string>();
  readonly kind = input<'rsvp'>();
  readonly leaving = input(false, { transform: booleanAttribute });

  readonly actionSelected = output<void>();
  readonly dismissed = output<void>();
  readonly paused = output<boolean>();

  protected readonly titleId = `bn-toast-${nextId++}-title`;
  protected readonly acted = signal(false);
  private hovered = false;
  private focused = false;

  protected act(): void {
    if (this.acted()) return;
    this.acted.set(true);
    this.actionSelected.emit();
  }

  protected hover(on: boolean): void {
    this.hovered = on;
    this.paused.emit(this.hovered || this.focused);
  }

  protected focus(on: boolean): void {
    this.focused = on;
    this.paused.emit(this.hovered || this.focused);
  }
}
