import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'components';

/** Primary hero action from docs/mocks/pages/home. */
@Component({
  selector: 'bn-button-scenario',
  imports: [Button, RouterLink],
  template: `<a bn-button variant="primary" size="lg" routerLink="/join">Join Banaro</a>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonScenario {}
