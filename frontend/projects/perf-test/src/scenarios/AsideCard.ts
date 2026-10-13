import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsideCard } from 'components';

/** The "At a glance" and "The builder" cards from docs/mocks/pages/project-detail/default. */
@Component({
  selector: 'bn-aside-card-scenario',
  imports: [AsideCard],
  template: `
    <div class="stack">
      <div bn-aside-card heading="At a glance">
        <dl>
          <div>
            <dt>Stage</dt>
            <dd>1,900 beta users</dd>
          </div>
          <div>
            <dt>Looking for</dt>
            <dd>Contributors (open source)</dd>
          </div>
        </dl>
      </div>
      <div bn-aside-card eyebrow="The builder" heading="Daniel Reyes" [headingLevel]="3">
        <p>Full-stack engineer · Mississauga · 26.9 km away</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AsideCardScenario {}
