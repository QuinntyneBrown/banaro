import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Badge } from 'components';

/** Event badges from the design system: a state word and an unread count. */
@Component({
  selector: 'bn-badge-scenario',
  imports: [Badge],
  template: `
    <bn-badge tone="success">You're going</bn-badge>
    <bn-badge tone="count" label="3 unread notifications">3</bn-badge>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BadgeScenario {}
