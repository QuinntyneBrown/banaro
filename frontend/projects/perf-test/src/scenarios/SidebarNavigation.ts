import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidebarNavigation } from 'components';

/** The settings section navigation (docs/mocks/pages/settings/privacy). */
@Component({
  selector: 'bn-sidebar-navigation-scenario',
  imports: [SidebarNavigation],
  template: `<bn-sidebar-navigation label="Settings" [items]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SidebarNavigationScenario {
  protected readonly items = [
    { label: 'Account', link: '/settings' },
    { label: 'Privacy', link: '/settings/privacy' },
    { label: 'E-mail', link: '/settings/email' },
  ];
}
