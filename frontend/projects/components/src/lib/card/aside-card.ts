import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The framed surface beside a detail page's main column: an optional eyebrow, an optional title and
 * whatever the page projects (facts, links, a person). It is not a `bn-card`: it has its own BEM
 * block, as the mocks do (docs/specs/components/card.md, D-8).
 */
@Component({
  selector: 'div[bn-aside-card]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'aside-card' },
  template: `
    @if (eyebrow(); as eyebrow) {
      <p class="eyebrow">{{ eyebrow }}</p>
    }
    @if (heading(); as heading) {
      @switch (headingLevel()) {
        @case (3) {
          <h3 class="aside-card__title">{{ heading }}</h3>
        }
        @default {
          <h2 class="aside-card__title">{{ heading }}</h2>
        }
      }
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      background: var(--color-bg-surface);
      border: var(--border-width-hairline) solid var(--color-border-default);
    }
    .aside-card__title {
      font: var(--text-h4);
    }
  `,
})
export class AsideCard {
  readonly eyebrow = input<string | null>(null);
  readonly heading = input<string | null>(null);
  readonly headingLevel = input<2 | 3>(2);
}
