import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DescriptionItem, DescriptionList } from 'components';

/** "At a glance" from docs/mocks/pages/builder-profile/default. */
@Component({
  selector: 'bn-description-list-scenario',
  imports: [DescriptionItem, DescriptionList],
  template: `
    <dl bn-description-list>
      <div bn-description-item term="Open to">Co-founding</div>
      <div bn-description-item term="Neighbourhood">Mississauga</div>
      <div bn-description-item term="Distance">26.9 km from Leslieville</div>
      <div bn-description-item term="Member since">March 2026</div>
    </dl>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DescriptionListScenario {}
