import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  BuilderRole,
  DirectoryFacets,
  DirectoryFilters,
  DISTANCE_OPTIONS,
  DistanceOption,
  formatNumber,
  OpenTo,
  TranslatePipe,
  TranslationService,
} from 'api';
import { FilterGroup, FilterOption } from 'components';

const ROLES: readonly BuilderRole[] = [
  'founder',
  'engineer',
  'designer',
  'product_manager',
  'other',
];
const OPEN_TO: readonly OpenTo[] = ['co_founding', 'advising', 'contributing'];

function camel(value: string): string {
  return value.replace(/_(\w)/g, (_match, letter: string) => letter.toUpperCase());
}

/**
 * The directory's five filter groups with their counts (L2-010): Role, Open to, Neighbourhood or
 * city, Distance and Popular skills. Shared by the sidebar, which applies each change at once, and
 * the bottom sheet, which stages them until "Apply" (D-044).
 */
@Component({
  selector: 'bn-directory-filters',
  imports: [FilterGroup, TranslatePipe],
  template: `
    <bn-filter-group
      name="role"
      [legend]="'directory.filters.role.legend' | t"
      [options]="roleOptions()"
      [selected]="filters().role"
      (changed)="toggle('role', $event)"
    />
    <bn-filter-group
      name="openTo"
      [legend]="'directory.filters.openTo' | t"
      [options]="openToOptions()"
      [selected]="filters().openTo"
      (changed)="toggle('openTo', $event)"
    />
    <bn-filter-group
      name="area"
      [legend]="'directory.filters.area' | t"
      [options]="areaOptions()"
      [selected]="filters().area"
      (changed)="toggle('area', $event)"
    />
    <bn-filter-group
      kind="radio"
      [name]="radioName()"
      [legend]="'directory.filters.distance.legend' | t"
      [options]="distanceOptions"
      [selected]="[distanceValue()]"
      (changed)="distance($event.value)"
    />
    <bn-filter-group
      kind="chips"
      name="skills"
      [legend]="'directory.filters.skills' | t"
      [options]="skillOptions()"
      [selected]="filters().skills"
      (changed)="toggle('skills', $event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectoryFiltersForm {
  private readonly i18n = inject(TranslationService);

  readonly facets = input<DirectoryFacets | null>(null);
  readonly filters = input.required<DirectoryFilters>();
  /** Radio names must differ between the sidebar and the sheet. */
  readonly radioName = input('distance');
  readonly filtersChange = output<DirectoryFilters>();

  protected readonly roleOptions = computed<FilterOption[]>(() =>
    ROLES.map((role) => ({
      value: role,
      label: this.i18n.t(`directory.filters.role.${camel(role)}`),
      count: this.count(this.facets()?.role[role]),
    })),
  );
  protected readonly openToOptions = computed<FilterOption[]>(() =>
    OPEN_TO.map((o) => ({
      value: o,
      label: this.i18n.t(`directory.openTo.${camel(o)}`),
      count: this.count(this.facets()?.openTo[o]),
    })),
  );
  protected readonly areaOptions = computed<FilterOption[]>(() =>
    Object.entries(this.facets()?.area ?? {}).map(([area, n]) => ({
      value: area,
      label: area,
      count: this.count(n),
    })),
  );
  protected readonly skillOptions = computed<FilterOption[]>(() =>
    (this.facets()?.skills ?? []).map((s) => ({
      value: s.slug,
      label: s.name,
      count: this.count(s.count),
    })),
  );
  protected readonly distanceOptions: FilterOption[] = DISTANCE_OPTIONS.map((d) => ({
    value: String(d),
    label: distanceLabel(this.i18n, d),
  }));
  /** No choice means the 40 km default (L2-010 criterion 2). */
  protected readonly distanceValue = computed(() => String(this.filters().distance ?? 40));

  protected toggle(
    group: 'role' | 'openTo' | 'area' | 'skills',
    change: { value: string; on: boolean },
  ): void {
    const current = this.filters()[group] as string[];
    const next = change.on
      ? [...current.filter((v) => v !== change.value), change.value]
      : current.filter((v) => v !== change.value);
    this.filtersChange.emit({ ...this.filters(), [group]: next });
  }

  protected distance(value: string): void {
    const distance = (value === 'any' ? 'any' : Number(value)) as DistanceOption;
    this.filtersChange.emit({ ...this.filters(), distance });
  }

  private count(n: number | undefined): string | null {
    return n === undefined ? null : formatNumber(n);
  }
}

/** "5 km" … "40 km", or "Anywhere in the GTA". */
export function distanceLabel(i18n: TranslationService, distance: DistanceOption): string {
  return distance === 'any'
    ? i18n.t('directory.filters.distance.any')
    : i18n.t('directory.filters.distance.km', { km: distance });
}
