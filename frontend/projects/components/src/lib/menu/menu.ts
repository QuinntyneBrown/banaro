import { CdkMenu } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

/**
 * Non-modal action menu on the CDK Menu. The consumer declares it inside an `ng-template` that the
 * trigger opens, so the items find their menu:
 *
 * `<button [cdkMenuTriggerFor]="more" [cdkMenuPosition]="menuPositions('end')">` …
 * `<ng-template #more><bn-menu label="More actions">…items…</bn-menu></ng-template>`
 *
 * Focus moves to the first item, arrow keys move, Escape closes and returns focus to the trigger.
 */
@Component({
  selector: 'bn-menu',
  hostDirectives: [{ directive: CdkMenu, outputs: ['closed'] }],
  host: { class: 'menu', '[attr.aria-label]': 'label()' },
  template: `<ng-content />`,
  styleUrl: './menu.css',
  // The panel renders in the CDK overlay container, outside any component's host.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  readonly label = input.required<string>();
}

/**
 * Overlay positions for a menu trigger: below with an 8 px gap, flipping above when there is no
 * room. `end` aligns the panel's right edge with the trigger's (account menu).
 */
export function menuPositions(align: 'start' | 'end' = 'start'): ConnectedPosition[] {
  return [
    { originX: align, originY: 'bottom', overlayX: align, overlayY: 'top', offsetY: 8 },
    { originX: align, originY: 'top', overlayX: align, overlayY: 'bottom', offsetY: -8 },
  ];
}
