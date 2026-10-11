import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button, Card, Status } from 'components';

/** Daniel Reyes's card from docs/mocks/pages/directory/default, with presence and "Say hello". */
@Component({
  selector: 'bn-card-scenario',
  imports: [Button, Card, Status],
  template: `
    <article
      bn-card
      slug="daniel-reyes"
      name="Daniel Reyes"
      [link]="['/builders', 'daniel-reyes']"
      role="Full-stack engineer"
      initials="DR"
      tile="clay"
      [match]="94"
      matchLabel="match"
      place="Mississauga · 26.9 km away"
      [skills]="['Laravel', 'Angular', 'PostgreSQL']"
      skillsLabel="Skills"
      building="Psalter"
      openTo="Co-founding"
      buildingLabel="Building"
      openToLabel="Open to"
      noProjectLabel="No project listed"
    >
      <bn-status slot="status" online>Online now</bn-status>
      <button slot="actions" bn-button variant="quiet" size="sm" type="button">Say hello</button>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardScenario {}
