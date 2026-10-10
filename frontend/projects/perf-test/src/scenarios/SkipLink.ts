import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkipLink } from 'components';

@Component({
  selector: 'bn-skip-link-scenario',
  imports: [SkipLink],
  template: `<bn-skip-link label="Skip to content" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkipLinkScenario {}
