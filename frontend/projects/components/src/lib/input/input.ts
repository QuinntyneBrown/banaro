import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Text input and select styles on the native element: `<input bn-input [invalid]="...">`. */
@Component({
  selector: 'input[bn-input], select[bn-input]',
  template: '<ng-content />',
  styleUrl: './input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'input',
    '[attr.aria-invalid]': 'invalid() || null',
  },
})
export class Input {
  readonly invalid = input(false, { transform: booleanAttribute });
}
