import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  InjectionToken,
  input,
} from '@angular/core';

/** Provided by `bn-select` to the native select it wraps, which then takes the chevron control look. */
export const SELECT_HOST = new InjectionToken<true>('bn-select host');

/** Text input and select styles on the native element: `<input bn-input [invalid]="...">`. */
@Component({
  selector: 'input[bn-input], select[bn-input]',
  template: '<ng-content />',
  styleUrl: './input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.input]': '!inSelect',
    '[class.select__control]': 'inSelect',
    '[attr.aria-invalid]': 'invalid() || null',
  },
})
export class Input {
  readonly invalid = input(false, { transform: booleanAttribute });
  /** True inside a `bn-select`, which draws the chevron and the wrapper around the control. */
  protected readonly inSelect = inject(SELECT_HOST, { optional: true }) !== null;
}
