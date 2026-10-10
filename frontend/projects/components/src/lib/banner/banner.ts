import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';

export type BannerVariant = 'info' | 'success' | 'warning' | 'danger';

/**
 * Full-width banner above the header for connection, account and site messages. Danger is
 * announced as an alert, the others as status. An auto-dismissing banner pauses while hovered or
 * focused (L2-028 criterion 7). Project actions as content.
 */
@Component({
  selector: 'bn-banner',
  template: `
    <div
      [class]="classes()"
      [attr.role]="variant() === 'danger' ? 'alert' : 'status'"
      [attr.data-variant]="variant()"
      [attr.data-banner]="kind()"
      (mouseenter)="pause()"
      (mouseleave)="resume()"
      (focusin)="pause()"
      (focusout)="resume()"
    >
      <div class="wrap banner__inner">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          @switch (variant()) {
            @case ('success') {
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            }
            @case ('info') {
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 11v5M12 8h.01" />
            }
            @default {
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5v5M12 15.5h.01" />
            }
          }
        </svg>
        <p class="banner__text">{{ text() }}</p>
        <ng-content />
        @if (dismissible()) {
          <button
            type="button"
            class="icon-btn"
            [attr.aria-label]="dismissLabel()"
            (click)="dismissed.emit()"
          >
            <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Banner implements OnInit {
  readonly variant = input<BannerVariant>('info');
  readonly text = input.required<string>();
  /** Names the banner for tests and analytics, such as `connection`. */
  readonly kind = input<string>();
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissLabel = input('Dismiss banner');
  /** Dismisses itself after this many milliseconds; 0 keeps it. */
  readonly autoDismissMs = input(0);
  readonly dismissed = output<void>();

  protected readonly classes = computed(() =>
    this.variant() === 'info' ? 'banner' : `banner banner--${this.variant()}`,
  );

  private timer?: ReturnType<typeof setTimeout>;
  private remaining = 0;
  private startedAt = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  ngOnInit(): void {
    this.remaining = this.autoDismissMs();
    this.resume();
  }

  protected pause(): void {
    if (!this.timer) return;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.remaining -= Date.now() - this.startedAt;
  }

  protected resume(): void {
    if (this.timer || this.remaining <= 0) return;
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.dismissed.emit(), this.remaining);
  }
}
