import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string | readonly unknown[];
}

/** Where the page sits: links to its parents and the current page, last (L2-050). */
@Component({
  selector: 'bn-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav [attr.aria-label]="label()">
      <ol class="breadcrumb">
        @for (item of items(); track $index; let last = $last) {
          @if (last) {
            <li aria-current="page">{{ item.label }}</li>
          } @else {
            <li>
              <a [routerLink]="item.link">{{ item.label }}</a>
            </li>
          }
        }
      </ol>
    </nav>
  `,
  styles: `
    :host {
      display: block;
      padding-top: var(--space-8);
    }
    /* Extracted from docs/design-system/assets/components.css: breadcrumb. */
    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
      font: var(--text-body-sm);
      color: var(--color-fg-muted);
    }
    .breadcrumb li + li::before {
      content: '/';
      margin-right: var(--space-2);
      color: var(--color-fg-subtle);
    }
    .breadcrumb a {
      color: inherit;
    }
    .breadcrumb li {
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Breadcrumb {
  readonly label = input.required<string>();
  readonly items = input.required<readonly BreadcrumbItem[]>();
}
