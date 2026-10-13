import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Menu, MenuDivider, MenuHeader, MenuItem } from 'components';

/** The open account menu from docs/mocks/dialogs/account-menu. */
@Component({
  selector: 'bn-menu-scenario',
  imports: [Menu, MenuItem, MenuHeader, MenuDivider],
  template: `
    <bn-menu label="Your account">
      <bn-menu-header title="Amara Osei" meta="Founder · Leslieville" />
      <a bn-menu-item href="/builders/amara-osei">View profile</a>
      <a bn-menu-item href="/profile/edit">Edit profile</a>
      <a bn-menu-item href="/settings">Settings</a>
      <a bn-menu-item href="/projects?owner=me">Your projects</a>
      <bn-menu-divider />
      <button bn-menu-item>Sign out</button>
    </bn-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuScenario {}
