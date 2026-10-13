import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Whose menu it is; presentational, so assistive technology counts only the items. */
@Component({
  selector: 'bn-menu-header',
  host: { class: 'menu__header', role: 'presentation' },
  template: `<p class="rows__title">{{ title() }}</p>
    @if (meta()) {
      <p class="rows__meta">{{ meta() }}</p>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuHeader {
  readonly title = input.required<string>();
  readonly meta = input<string>();
}
