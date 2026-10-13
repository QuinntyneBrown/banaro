import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Input, Select } from 'components';

/** The inline "Sort by" select of docs/mocks/pages/directory and the "Stage" select of pages/project-new. */
@Component({
  selector: 'bn-select-scenario',
  imports: [Input, Select],
  template: `
    <bn-select label="Sort by">
      <select bn-input name="sort">
        <option selected>Best match</option>
        <option>Nearest</option>
        <option>Recently active</option>
        <option>Newest</option>
      </select>
    </bn-select>
    <bn-select>
      <select bn-input id="stage" name="stage">
        <option>Idea</option>
        <option selected>Design</option>
        <option>Prototype</option>
        <option>Pilot</option>
        <option>Beta</option>
        <option>Launched</option>
      </select>
    </bn-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectScenario {}
