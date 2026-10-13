import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DangerZone } from 'components';

/** The "Danger zone" of docs/mocks/pages/project-edit/default. */
@Component({
  selector: 'bn-danger-zone-scenario',
  imports: [DangerZone],
  template: `
    <bn-danger-zone heading="Danger zone" actionLabel="Delete project">
      Deleting Harvest removes the project page and its 23 comments. This can't be undone.
    </bn-danger-zone>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DangerZoneScenario {}
