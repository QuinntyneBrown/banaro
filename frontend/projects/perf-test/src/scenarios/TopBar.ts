import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, NavItem, TopBar } from 'components';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Builders', link: '/builders' },
  { label: 'Projects', link: '/projects' },
  { label: 'Events', link: '/events' },
  { label: 'Matching', link: '/matching' },
];

/** Visitor header from docs/mocks/pages/home. */
@Component({
  selector: 'bn-top-bar-scenario',
  imports: [TopBar, Button, RouterLink],
  template: `
    <bn-top-bar
      brandName="banaro"
      brandLabel="Banaro home"
      navLabel="Primary"
      menuLabel="Menu"
      closeMenuLabel="Close menu"
      [items]="items"
    >
      <a slot="actions" bn-button variant="text" routerLink="/sign-in">Sign in</a>
      <a slot="actions" bn-button variant="primary" size="sm" routerLink="/join">Join Banaro</a>
    </bn-top-bar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TopBarScenario {
  protected readonly items = NAV_ITEMS;
}
