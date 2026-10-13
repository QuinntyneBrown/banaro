import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActiveFilters } from 'components';

/** The active filters from docs/mocks/pages/directory/filtered. */
@Component({
  selector: 'bn-active-filters-scenario',
  imports: [ActiveFilters],
  template: ` <bn-active-filters label="Active filters" clearLabel="Clear all" [chips]="chips" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ActiveFiltersScenario {
  protected readonly chips = [
    { key: 'role:founder', label: 'Founders', removeLabel: 'Remove filter: Founders' },
    { key: 'openTo:co_founding', label: 'Co-founding', removeLabel: 'Remove filter: Co-founding' },
    {
      key: 'skills:product-strategy',
      label: 'Product strategy',
      removeLabel: 'Remove filter: Product strategy',
    },
  ];
}
