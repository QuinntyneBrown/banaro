import { CdkMenuItem } from '@angular/cdk/menu';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';

/** One action or destination in a `bn-menu`; `triggered` fires after the menu has closed. */
@Component({
  selector: 'a[bn-menu-item], button[bn-menu-item]',
  hostDirectives: [{ directive: CdkMenuItem, inputs: ['cdkMenuItemDisabled: disabled'] }],
  host: {
    class: 'menu__item',
    '[class.menu__item--danger]': 'danger()',
    '[attr.type]': 'isButton ? "button" : null',
  },
  template: `<ng-content select="[slot=icon]" /><ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItem {
  readonly danger = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly triggered = output<void>();

  protected readonly isButton =
    inject<ElementRef<Element>>(ElementRef).nativeElement.tagName === 'BUTTON';

  constructor() {
    // CdkMenuItem closes the menu before it emits `triggered` (CRD decision D-3).
    inject(CdkMenuItem).triggered.subscribe(() => this.triggered.emit());
  }
}
