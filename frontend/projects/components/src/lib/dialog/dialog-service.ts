import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { DOCUMENT, inject, Injectable } from '@angular/core';
import { DialogContainer } from './dialog-container';

export interface DialogOptions<D> {
  data?: D;
  size?: 'sm' | 'md';
  /** Where focus lands on open; a string is a selector inside the dialog. */
  autoFocus?: 'first-tabbable' | 'first-heading' | 'dialog' | string;
  role?: 'dialog' | 'alertdialog';
  /** The dialog renders a description, so the panel names it in `aria-describedby`. */
  described?: boolean;
  /** Width below which the dialog rises as a bottom sheet: 576 px (`SM`) or 992 px (`LG`). */
  sheetBelow?: 'SM' | 'LG';
}

const SHEET_QUERIES = { SM: '(max-width: 35.99rem)', LG: '(max-width: 61.99rem)' } as const;

let nextId = 0;

/**
 * Opens dialogs the one Banaro way: modal, labelled by their title, focus trapped and restored,
 * closed on navigation, scroll blocked, and a bottom sheet below 576 px (L2-049). `bn-dialog`
 * handles Escape and backdrop clicks, so a busy or non-dismissible dialog can ignore them.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private readonly document = inject(DOCUMENT);

  open<C, D = unknown, R = unknown>(
    component: ComponentType<C>,
    options: DialogOptions<D> = {},
  ): DialogRef<R, C> {
    const id = `bn-dialog-${++nextId}`;
    const query = SHEET_QUERIES[options.sheetBelow ?? 'SM'];
    const sheet = !!this.document.defaultView?.matchMedia(query).matches;
    const position = this.overlay.position().global().centerHorizontally();
    return this.dialog.open<R, D, C>(component, {
      id,
      data: options.data,
      role: options.role ?? 'dialog',
      ariaModal: true,
      ariaLabelledBy: `${id}-title`,
      ariaDescribedBy: options.described ? `${id}-desc` : null,
      autoFocus: options.autoFocus ?? 'first-tabbable',
      restoreFocus: true,
      closeOnNavigation: true,
      disableClose: true,
      hasBackdrop: true,
      backdropClass: 'backdrop',
      panelClass: [
        'bn-dialog',
        sheet ? 'bn-dialog--sheet' : '',
        options.size === 'sm' ? 'bn-dialog--sm' : '',
      ].filter(Boolean),
      positionStrategy: sheet ? position.bottom('0') : position.centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      container: DialogContainer,
    });
  }
}
