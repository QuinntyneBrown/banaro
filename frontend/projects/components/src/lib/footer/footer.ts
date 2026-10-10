import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavItem } from '../top-bar/top-bar';

/** Site footer: maker line, footer navigation and land acknowledgement. */
@Component({
  selector: 'bn-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly made = input.required<string>();
  readonly navLabel = input.required<string>();
  readonly land = input.required<string>();
  readonly links = input<NavItem[]>([]);
}
