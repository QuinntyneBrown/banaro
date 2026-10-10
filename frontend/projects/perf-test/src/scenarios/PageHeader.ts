import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from 'components';

/** About page heading from docs/mocks/pages/about. */
@Component({
  selector: 'bn-page-header-scenario',
  imports: [PageHeader],
  template: `
    <bn-page-header
      eyebrow="About"
      heading="Build with believers down the street"
      sub="Banaro is a small, local community for Christian product builders in Toronto and the GTA."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageHeaderScenario {}
