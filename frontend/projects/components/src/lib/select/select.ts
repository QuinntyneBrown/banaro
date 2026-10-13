import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The design system's chevron select around one native `select[bn-input]`. With a `label` it is the
 * inline toolbar control ("Sort by"); without one it sits inside a `bn-field`, which names it.
 * The platform `<select>` stays the control, so keyboard and mobile pickers are the browser's own.
 */
@Component({
  selector: 'bn-select',
  imports: [NgTemplateOutlet],
  templateUrl: './select.html',
  styleUrl: './select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.select--field]': '!label()' },
})
export class Select {
  readonly label = input<string | null>(null);
}
