import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FilterGroup } from 'components';

/** The Role group with counts from docs/mocks/pages/directory/filtered. */
@Component({
  selector: 'bn-filter-group-scenario',
  imports: [FilterGroup],
  template: `
    <bn-filter-group legend="Role" name="role" [options]="options" [selected]="['founder']" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FilterGroupScenario {
  protected readonly options = [
    { value: 'founder', label: 'Founders', count: '214' },
    { value: 'engineer', label: 'Engineers', count: '486' },
    { value: 'designer', label: 'Designers', count: '231' },
    { value: 'product_manager', label: 'Product managers', count: '198' },
    { value: 'other', label: 'Other', count: '155' },
  ];
}
