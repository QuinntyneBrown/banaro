import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Page heading block: eyebrow, the page's only `<h1>` and an optional subtitle. */
@Component({
  selector: 'bn-page-header',
  template: `
    <div class="page-head">
      @if (eyebrow()) {
        <p class="eyebrow">{{ eyebrow() }}</p>
      }
      <h1 class="page-head__title" [attr.id]="headingId()">{{ heading() }}</h1>
      @if (sub()) {
        <p class="page-head__sub">{{ sub() }}</p>
      }
      <ng-content />
    </div>
  `,
  styleUrl: './page-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly eyebrow = input<string>();
  readonly sub = input<string>();
  readonly headingId = input<string>();
}
