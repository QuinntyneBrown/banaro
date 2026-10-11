import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Breadcrumb } from 'components';

/** The profile breadcrumb from docs/mocks/pages/builder-profile/default. */
@Component({
  selector: 'bn-breadcrumb-scenario',
  imports: [Breadcrumb],
  template: `<bn-breadcrumb label="Breadcrumb" [items]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreadcrumbScenario {
  protected readonly items = [{ label: 'Builders', link: '/builders' }, { label: 'Daniel Reyes' }];
}
