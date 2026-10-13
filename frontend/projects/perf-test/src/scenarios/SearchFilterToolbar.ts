import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Input, SearchBox, SearchFilterToolbar, Select, type ToolbarFilter } from 'components';

/** The directory's filtered bar and the projects page's stacked toolbar (docs/mocks/pages/directory, pages/projects). */
@Component({
  selector: 'bn-search-filter-toolbar-scenario',
  imports: [Input, SearchBox, SearchFilterToolbar, Select],
  template: `
    <bn-search-filter-toolbar
      filtersLabel="Filters"
      activeFiltersLabel="Active filters"
      clearAllLabel="Clear all"
      [activeFilters]="filters"
    >
      <span slot="count">Showing <strong>1–6</strong> of <strong>38</strong> builders</span>
      <bn-select label="Sort by">
        <select bn-input name="sort">
          <option selected>Best match</option>
          <option>Nearest</option>
          <option>Recently active</option>
          <option>Newest</option>
        </select>
      </bn-select>
    </bn-search-filter-toolbar>

    <bn-search-filter-toolbar
      variant="stacked"
      activeFiltersLabel="Active filters"
      clearAllLabel="Clear filters"
      [activeFilters]="[filters[0]]"
    >
      <bn-search-box
        slot="search"
        embedded
        label="Search projects"
        buttonLabel="Search"
        placeholder="Project, builder or what it does"
        inputId="q"
      />
      <bn-select label="Stage">
        <select bn-input name="stage">
          <option>All stages</option>
          <option>Idea</option>
          <option>Launched</option>
        </select>
      </bn-select>
      <bn-select label="Looking for">
        <select bn-input name="looking_for">
          <option>Anyone</option>
          <option>Co-founder</option>
          <option>Advisor</option>
        </select>
      </bn-select>
      <span slot="count"
        >Showing <strong>1–7</strong> of <strong>312</strong> projects, most recent first</span
      >
    </bn-search-filter-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SearchFilterToolbarScenario {
  protected readonly filters: ToolbarFilter[] = [
    { id: 'role', label: 'Founders', removeLabel: 'Remove filter: Founders' },
    { id: 'open', label: 'Co-founding', removeLabel: 'Remove filter: Co-founding' },
    { id: 'skill', label: 'Product strategy', removeLabel: 'Remove filter: Product strategy' },
  ];
}
