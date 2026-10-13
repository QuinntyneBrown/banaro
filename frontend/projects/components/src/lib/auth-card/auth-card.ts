import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AuthCardIcon = 'mail' | 'check' | 'alert';

/**
 * Centred card for the identity screens (join, sign in, verify e-mail, password recovery): an
 * optional icon, the page's only `<h1>`, a subtitle, the projected form and an optional
 * `slot="alt"` line below it.
 */
@Component({
  selector: 'bn-auth-card',
  template: `
    <div class="auth">
      <section
        class="auth__card"
        [class.auth__card--wide]="width() === 'wide'"
        aria-labelledby="auth-title"
      >
        <ng-content select="[slot=lead]" />
        <div>
          @switch (icon()) {
            @case ('mail') {
              <span class="empty__icon">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
            }
            @case ('check') {
              <span class="empty__icon">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              </span>
            }
            @case ('alert') {
              <span class="empty__icon">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5v5M12 15.5h.01" />
                </svg>
              </span>
            }
          }
          <h1 class="auth__title" id="auth-title" tabindex="-1">{{ heading() }}</h1>
          @if (sub()) {
            <p class="auth__sub">{{ sub() }}</p>
          }
        </div>
        <ng-content />
        <p class="auth__alt"><ng-content select="[slot=alt]" /></p>
      </section>
    </div>
  `,
  styleUrl: './auth-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCard {
  readonly heading = input.required<string>();
  readonly sub = input<string>();
  readonly icon = input<AuthCardIcon>();
  /** `wide` fits onboarding's step forms (40 rem). */
  readonly width = input<'default' | 'wide'>('default');
}
