import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button } from '../button/button';
import { ActiveFilters } from '../filter-group/filter-group';

export type SearchFilterToolbarVariant = 'bar' | 'stacked';

/** A filter in force: removing it is the page's job. */
export interface ToolbarFilter {
  readonly id: string;
  readonly label: string;
  readonly removeLabel: string;
}

/**
 * The row above a result list: the count and the sort and filter controls (`bar`, the directory and
 * events), or a search form with filter selects and the count after it (`stacked`, projects). It
 * only arranges what the page projects and reports what the person did; querying, URL state and
 * debouncing belong to the page (docs/specs/components/search-filter-toolbar.md).
 */
@Component({
  selector: 'bn-search-filter-toolbar',
  imports: [ActiveFilters, Button, NgTemplateOutlet],
  templateUrl: './search-filter-toolbar.html',
  styleUrl: './search-filter-toolbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterToolbar {
  readonly variant = input<SearchFilterToolbarVariant>('bar');
  readonly showCount = input(true);
  /** Bar only: renders the "Filters" button, which opens the filter sheet below 992 px. */
  readonly filtersLabel = input<string | null>(null);
  readonly filtersOpen = input(false);
  readonly activeFilters = input<readonly ToolbarFilter[]>([]);
  /** The active filters list's accessible name; needed when `activeFilters` is not empty. */
  readonly activeFiltersLabel = input('');
  readonly clearAllLabel = input<string | null>(null);

  readonly filtersOpened = output<void>();
  readonly filterRemoved = output<string>();
  readonly filtersCleared = output<void>();
  /** Stacked only: the trimmed query when the form is submitted. */
  readonly searched = output<string>();

  protected readonly chips = computed(() =>
    this.activeFilters().map(({ id, label, removeLabel }) => ({ key: id, label, removeLabel })),
  );

  protected submit(event: Event): void {
    event.preventDefault();
    const query = new FormData(event.target as HTMLFormElement).get('q');
    this.searched.emit(String(query ?? '').trim());
  }
}
