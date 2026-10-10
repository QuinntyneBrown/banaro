import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button, List, ListItem } from 'components';

/** Next steps on the onboarding success state (docs/mocks/pages/onboarding/success). */
@Component({
  selector: 'bn-list-scenario',
  imports: [Button, List, ListItem],
  template: `
    <ul bn-list aria-label="Next steps">
      <li bn-list-item title="Browse builders" meta="1,284 people across Toronto and the GTA.">
        <a slot="end" bn-button variant="quiet" size="sm" href="/builders">Browse builders</a>
      </li>
      <li
        bn-list-item
        title="Share a project"
        meta="Tell people about Harvest and ask for feedback."
      >
        <a slot="end" bn-button variant="quiet" size="sm" href="/projects/new">Share a project</a>
      </li>
      <li
        bn-list-item
        title="See what's on"
        meta="Fall Demo Night is next Thursday, with 16 spots left."
      >
        <a slot="end" bn-button variant="quiet" size="sm" href="/events">See events</a>
      </li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListScenario {}
