import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button, ProfileHeader } from 'components';

/** Esther Nguyen's profile head from docs/mocks/pages/builder-profile/sparse. */
@Component({
  selector: 'bn-profile-header-scenario',
  imports: [Button, ProfileHeader],
  template: `
    <header
      bn-profile-header
      name="Esther Nguyen"
      role="Product designer"
      place="Riverdale · 1.4 km away"
      initials="EN"
      initialsLabel="Esther Nguyen, no photo"
      tone="sage"
      [presence]="{ online: false, text: 'Seen 4 h ago' }"
    >
      <button slot="actions" bn-button variant="primary" type="button">Say hello</button>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileHeaderScenario {}
