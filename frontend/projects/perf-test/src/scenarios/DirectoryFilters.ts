import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FilterGroup } from 'components';

const AREAS = [
  ['Downtown Toronto', '512'],
  ['North York', '141'],
  ['Scarborough', '96'],
  ['Etobicoke', '88'],
  ['Mississauga', '147'],
  ['Brampton', '74'],
  ['Markham', '92'],
  ['Vaughan', '51'],
  ['Richmond Hill', '38'],
  ['Oakville', '45'],
];
const SKILLS = [
  ['React', '203'],
  ['Figma', '187'],
  ['Python', '174'],
  ['Product strategy', '156'],
  ['User research', '112'],
  ['Laravel', '98'],
  ['Data/ML', '91'],
  ['Marketing', '88'],
  ['Angular', '76'],
  ['Swift', '64'],
  ['Kotlin', '51'],
  ['Fundraising', '43'],
];

/** The directory's whole filter sidebar with counts (docs/mocks/pages/directory/default). */
@Component({
  selector: 'bn-directory-filters-scenario',
  imports: [FilterGroup],
  template: `
    <bn-filter-group legend="Role" name="role" [options]="roles" />
    <bn-filter-group legend="Open to" name="openTo" [options]="openTo" />
    <bn-filter-group legend="Neighbourhood or city" name="area" [options]="areas" />
    <bn-filter-group
      legend="Distance"
      kind="radio"
      name="distance"
      [options]="distances"
      [selected]="['40']"
    />
    <bn-filter-group legend="Popular skills" kind="chips" name="skills" [options]="skills" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DirectoryFiltersScenario {
  protected readonly roles = [
    { value: 'founder', label: 'Founders', count: '214' },
    { value: 'engineer', label: 'Engineers', count: '486' },
    { value: 'designer', label: 'Designers', count: '231' },
    { value: 'product_manager', label: 'Product managers', count: '198' },
    { value: 'other', label: 'Other', count: '155' },
  ];
  protected readonly openTo = [
    { value: 'co_founding', label: 'Co-founding', count: '173' },
    { value: 'advising', label: 'Advising', count: '248' },
    { value: 'contributing', label: 'Contributing', count: '611' },
  ];
  protected readonly areas = AREAS.map(([label, count]) => ({ value: label, label, count }));
  protected readonly distances = ['5', '10', '25', '40'].map((km) => ({
    value: km,
    label: `${km} km`,
  }));
  protected readonly skills = SKILLS.map(([label, count]) => ({ value: label, label, count }));
}
