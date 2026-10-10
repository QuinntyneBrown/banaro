import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ErrorPageIcon = 'clock' | 'offline';

/**
 * Body of the not-found, forbidden, server-error, offline and maintenance pages: a status code
 * or an icon, the page's only `<h1>`, an explanation, an optional reference ID and projected
 * actions.
 */
@Component({
  selector: 'bn-error-page',
  template: `
    <div class="error-page">
      @if (code()) {
        <p class="error-page__code" aria-hidden="true">{{ code() }}</p>
      }
      @switch (icon()) {
        @case ('clock') {
          <span class="empty__icon">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </svg>
          </span>
        }
        @case ('offline') {
          <span class="empty__icon">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 3.5 20.5 20.5" />
              <path d="M8.5 15.5a5 5 0 0 1 4-1.4M5 12a9 9 0 0 1 3.5-2M19 12a9 9 0 0 0-6-3" />
              <path d="M12 19h.01" />
            </svg>
          </span>
        }
      }
      <h1 class="error-page__title">{{ heading() }}</h1>
      <p class="lead">{{ lead() }}</p>
      @if (referenceId()) {
        <p class="muted error-page__reference">
          {{ referenceLabel() }}: <code>{{ referenceId() }}</code>
        </p>
      }
      <ng-content />
    </div>
  `,
  styleUrl: './error-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPage {
  readonly heading = input.required<string>();
  readonly lead = input.required<string>();
  readonly code = input<string>();
  readonly icon = input<ErrorPageIcon>();
  readonly referenceId = input<string | null>();
  readonly referenceLabel = input('Reference ID');
}
