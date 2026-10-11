import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../top-bar/top-bar';

/**
 * Section navigation for a page with sections, such as Settings: a row of links below 1024 px and a
 * column beside the content from there. The current section carries `aria-current="page"`.
 */
@Component({
  selector: 'bn-sidebar-navigation',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav [attr.aria-label]="label()">
      <ul class="settings-nav">
        @for (item of items(); track item.link) {
          <li>
            <a
              class="nav__link"
              [routerLink]="item.link"
              routerLinkActive
              ariaCurrentWhenActive="page"
              [routerLinkActiveOptions]="{ exact: true }"
              >{{ item.label }}</a
            >
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './sidebar-navigation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarNavigation {
  readonly label = input.required<string>();
  readonly items = input.required<readonly NavItem[]>();
}
