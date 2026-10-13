import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface StepperStep {
  /** Translated position, "Step 1 of 3". */
  position: string;
  label: string;
}

/**
 * Labelled progress for a multi-step form: earlier steps are complete, the current one carries
 * `aria-current="step"`. Not interactive.
 */
@Component({
  selector: 'bn-stepper',
  template: `
    <ol
      [class]="orientation() === 'vertical' ? 'stepper stepper--vertical' : 'stepper'"
      [attr.aria-label]="label()"
    >
      @for (step of steps(); track step.position; let i = $index) {
        <li
          class="stepper__step"
          [class.is-done]="i < index()"
          [attr.aria-current]="i === index() ? 'step' : null"
        >
          <span>{{ step.position }}</span>
          <span
            >{{ step.label }}
            @if (i < index()) {
              <span class="vh"> ({{ completeLabel() }})</span>
            }
          </span>
        </li>
      }
    </ol>
  `,
  styleUrl: './stepper.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stepper {
  readonly steps = input.required<readonly StepperStep[]>();
  readonly current = input(0);
  readonly label = input.required<string>();
  readonly completeLabel = input.required<string>();
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  protected readonly index = computed(() =>
    Math.min(Math.max(this.current(), 0), this.steps().length - 1),
  );
}
