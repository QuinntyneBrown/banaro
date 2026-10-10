import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Brand } from 'components';

@Component({
  selector: 'bn-brand-scenario',
  imports: [Brand, RouterLink],
  template: `<a bn-brand routerLink="/" aria-label="Banaro home" name="banaro"></a>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BrandScenario {}
