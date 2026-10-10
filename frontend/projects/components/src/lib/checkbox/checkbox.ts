import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Checkbox and radio styles on the native input: `<input type="checkbox" bn-checkbox>`. */
@Component({
  selector: 'input[bn-checkbox]',
  template: '',
  styleUrl: './checkbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'check__box',
    '[attr.aria-invalid]': 'invalid() || null',
  },
})
export class Checkbox {
  readonly invalid = input(false, { transform: booleanAttribute });
}

/**
 * A full-height clickable row that labels a projected checkbox: project the input first, then
 * the label text (which may hold links).
 */
@Component({
  selector: 'bn-check',
  template: `
    <!-- The control is the projected input, which the rule cannot see through ng-content. -->
    <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
    <label class="check">
      <ng-content select="input" />
      <span><ng-content /></span>
    </label>
  `,
  styleUrl: './check.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Check {}
