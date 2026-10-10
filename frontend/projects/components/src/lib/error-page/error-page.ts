import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Body of the not-found, forbidden and server-error pages: the status code, the page's only
 * `<h1>`, an explanation, an optional reference ID and projected actions.
 */
@Component({
  selector: 'bn-error-page',
  template: `
    <div class="error-page">
      <p class="error-page__code" aria-hidden="true">{{ code() }}</p>
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
  readonly code = input.required<string>();
  readonly heading = input.required<string>();
  readonly lead = input.required<string>();
  readonly referenceId = input<string | null>();
  readonly referenceLabel = input('Reference ID');
}
