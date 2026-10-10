import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

/**
 * Inline alert with an icon, a title, a body and optional actions (`slot="actions"`). Danger
 * alerts are announced assertively; the others politely.
 */
@Component({
  selector: 'bn-alert',
  template: `
    <div [class]="classes()" [attr.role]="variant() === 'danger' ? 'alert' : 'status'">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        @switch (variant()) {
          @case ('success') {
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          }
          @default {
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5v5M12 15.5h.01" />
          }
        }
      </svg>
      <p class="alert__title">{{ heading() }}</p>
      <div class="alert__body"><ng-content /></div>
      <div class="alert__actions"><ng-content select="[slot=actions]" /></div>
    </div>
  `,
  styleUrl: './alert.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Alert {
  readonly variant = input<AlertVariant>('info');
  readonly heading = input.required<string>();

  protected readonly classes = computed(() =>
    this.variant() === 'info' ? 'alert' : `alert alert--${this.variant()}`,
  );
}
