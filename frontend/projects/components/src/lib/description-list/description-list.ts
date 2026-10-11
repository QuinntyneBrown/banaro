import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

/** Short facts as term and value, such as "At a glance" on a profile (L2-011). */
@Component({
  selector: 'dl[bn-description-list]',
  template: '<ng-content />',
  styles: `
    /* Extracted from docs/design-system/assets/components.css: facts. */
    .facts {
      display: grid;
      gap: var(--space-4);
      margin: 0;
    }
    .facts > div {
      display: grid;
      gap: var(--space-1);
    }
    .facts dt {
      font: var(--text-overline);
      letter-spacing: var(--letter-spacing-wide);
      text-transform: uppercase;
      color: var(--color-fg-subtle);
    }
    .facts dd {
      margin: 0;
      font: var(--text-body);
      overflow-wrap: anywhere;
    }
  `,
  // The items are this component's children through projection.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'facts' },
})
export class DescriptionList {}

/** One fact: the term, then the projected value. */
@Component({
  selector: 'div[bn-description-item]',
  template: '<dt>{{ term() }}</dt><dd><ng-content /></dd>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionItem {
  readonly term = input.required<string>();
}
