import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

/** A group of option cards; `inline` lays them side by side. */
@Component({
  selector: 'bn-choices',
  host: { class: 'choices', '[class.choices--inline]': 'inline()' },
  template: `<ng-content />`,
  styleUrl: './choice.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Choices {
  readonly inline = input(false, { transform: booleanAttribute });
}

/**
 * One option card around a native radio or checkbox, which keeps every native attribute and the
 * form binding. The whole card is the label.
 */
@Component({
  selector: 'bn-choice',
  template: `
    <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -- the projected input sits inside the label -->
    <label class="choice">
      <ng-content select="input" />
      <span class="choice__title">{{ label() }}</span>
      @if (description()) {
        <span class="choice__text">{{ description() }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Choice {
  readonly label = input.required<string>();
  readonly description = input<string | null>(null);
}
