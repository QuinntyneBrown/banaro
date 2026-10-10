import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Brand } from '../brand/brand';
import { Button } from '../button/button';

export interface NavItem {
  label: string;
  link: string;
}

/**
 * Site header: brand, primary navigation (a popover menu below 64rem) and an actions slot.
 * Project actions with `slot="actions"`.
 */
@Component({
  selector: 'bn-top-bar',
  imports: [Brand, Button, RouterLink, RouterLinkActive],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar {
  readonly brandName = input.required<string>();
  readonly brandLabel = input.required<string>();
  readonly navLabel = input.required<string>();
  readonly menuLabel = input.required<string>();
  readonly closeMenuLabel = input.required<string>();
  readonly items = input<NavItem[]>([]);
}
