import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SearchBox } from 'components';

/** Builder search from docs/mocks/pages/not-found. */
@Component({
  selector: 'bn-search-box-scenario',
  imports: [SearchBox],
  template: `
    <bn-search-box
      label="Search builders"
      placeholder="Name, skill or project"
      buttonLabel="Search"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SearchBoxScenario {}
