import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

/**
 * A setting that is on or off right away: a row with a stable title, an optional sentence and a
 * native checkbox with `role="switch"` (L2-036, L2-037). Project one `input[bn-switch]`.
 */
@Component({
  selector: 'bn-switch',
  template: `
    <label
      class="switch"
      [class.switch--label-right]="labelPosition() === 'end'"
      [attr.for]="controlId()"
    >
      <span class="switch__label">
        <span class="switch__title" [id]="controlId() + '-title'">{{ label() }}</span>
        @if (description()) {
          <span class="switch__text" [id]="controlId() + '-text'">{{ description() }}</span>
        }
      </span>
      <ng-content select="input" />
    </label>
  `,
  styleUrl: './switch.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Switch {
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly description = input<string | null>(null);
  readonly labelPosition = input<'start' | 'end'>('start');
}

/** The switch control on a native checkbox, named and described by its row. */
@Component({
  selector: 'input[bn-switch]',
  template: '',
  styleUrl: './switch.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'switch__control',
    role: 'switch',
    '[attr.aria-labelledby]': "row.controlId() + '-title'",
    '[attr.aria-describedby]': "row.description() ? row.controlId() + '-text' : null",
  },
})
export class SwitchControl {
  protected readonly row = inject(Switch);
}
