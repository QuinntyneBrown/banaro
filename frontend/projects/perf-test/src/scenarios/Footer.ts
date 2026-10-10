import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Footer, NavItem } from 'components';

const LINKS: NavItem[] = [
  { label: 'About', link: '/about' },
  { label: 'Code of conduct', link: '/code-of-conduct' },
  { label: 'Privacy', link: '/privacy' },
  { label: 'Contact', link: '/contact' },
];

@Component({
  selector: 'bn-footer-scenario',
  imports: [Footer],
  template: `
    <bn-footer
      made="Made in Toronto. © 2026 Banaro."
      navLabel="Footer"
      land="Banaro gathers on the traditional territory of many nations, including the Mississaugas of the Credit, the Anishnabeg, the Chippewa, the Haudenosaunee and the Wendat peoples."
      [links]="links"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FooterScenario {
  protected readonly links = LINKS;
}
