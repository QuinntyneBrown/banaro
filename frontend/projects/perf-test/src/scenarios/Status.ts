import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Status } from 'components';

/** Presence from docs/mocks/pages/directory/default: online and last seen. */
@Component({
  selector: 'bn-status-scenario',
  imports: [Status],
  template: `
    <bn-status online>Online now</bn-status>
    <bn-status>Seen 4 h ago</bn-status>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatusScenario {}
