import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

/** A form's frame: `plain` (`.form`) or `card` (`.form-card`); busy while it loads or submits. */
@Component({
  selector: 'form[bn-form], div[bn-form]',
  host: {
    '[class.form]': "variant() === 'plain'",
    '[class.form-card]': "variant() === 'card'",
    '[attr.aria-busy]': "busy() ? 'true' : null",
  },
  template: `<ng-content />`,
  styleUrl: './form-layout.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Form {
  readonly variant = input<'plain' | 'card'>('plain');
  readonly busy = input(false, { transform: booleanAttribute });
}

/** A titled group of fields, or one question made of several controls (`level="question"`). */
@Component({
  selector: 'fieldset[bn-form-section]',
  host: { class: 'form-section' },
  template: `
    <legend [class]="level() === 'question' ? 'field__label' : 'form-section__title'">
      {{ legend() }}
    </legend>
    <ng-content />
  `,
  styleUrl: './form-layout.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSection {
  readonly legend = input.required<string>();
  readonly level = input<'section' | 'question'>('section');
}

/** Two short related fields side by side from 48 rem. */
@Component({
  selector: 'div[bn-field-row]',
  host: { class: 'field-row' },
  template: `<ng-content />`,
  styleUrl: './form-layout.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldRow {}

/** The form's buttons; `end` puts Cancel or Back first and the primary action last. */
@Component({
  selector: 'div[bn-form-actions]',
  host: { class: 'form-actions', '[class.form-actions--end]': "align() === 'end'" },
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormActions {
  readonly align = input<'start' | 'end'>('start');
}

/** A text input with a trailing action, such as the profile's "Add" for skills. */
@Component({
  selector: 'bn-input-group',
  host: { class: 'input-group' },
  template: `<ng-content />`,
  styleUrl: './form-layout.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroup {}
