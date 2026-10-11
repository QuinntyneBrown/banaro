import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Pagination } from 'components';

/** The directory's "load more" pager from docs/mocks/pages/directory/default. */
@Component({
  selector: 'bn-pagination-scenario',
  imports: [Pagination],
  template: `
    <bn-pagination
      [shown]="12"
      [total]="1284"
      [page]="1"
      [pageCount]="107"
      moreLabel="Show 12 more builders"
      busyLabel="Loading more builders…"
      status="12 of 1,284 · page 1 of 107"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginationScenario {}
