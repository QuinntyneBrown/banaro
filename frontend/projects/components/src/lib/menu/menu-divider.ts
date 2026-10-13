import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bn-menu-divider',
  host: { class: 'menu__divider', role: 'separator' },
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDivider {}
