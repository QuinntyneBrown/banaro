import { Directive, inject } from '@angular/core';
import { ThemeService } from 'components';

const TEXT_FIELDS = ['INPUT', 'TEXTAREA', 'SELECT'];

/** Pressing `t` outside a text field switches the theme (L2-051 criterion 2). */
@Directive({
  selector: '[bnThemeShortcut]',
  host: { '(document:keydown)': 'onKeydown($event)' },
})
export class ThemeShortcut {
  private readonly theme = inject(ThemeService);

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 't' || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    const target = event.target as HTMLElement | null;
    if (target && (TEXT_FIELDS.includes(target.tagName) || target.isContentEditable)) return;
    this.theme.toggle();
  }
}
