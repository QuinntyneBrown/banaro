import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Avatar } from 'components';

/** Header account avatar for Amara Osei, as an initials tile (docs/mocks/dialogs/account-menu). */
@Component({
  selector: 'bn-avatar-scenario',
  imports: [Avatar],
  template: `<bn-avatar name="Amara Osei" initials="AO" tile="sage" decorative />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarScenario {}
