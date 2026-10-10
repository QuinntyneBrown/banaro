import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type ButtonVariant = 'default' | 'primary' | 'quiet' | 'text' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button styles on a native `<a>` or `<button>`, so the element keeps its own semantics and any
 * layout classes the consumer adds: `<a bn-button variant="primary" routerLink="/join">`.
 */
@Component({
  selector: 'a[bn-button], button[bn-button]',
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'busy() || null',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('default');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false, { transform: booleanAttribute });
  readonly arrow = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    [
      'btn',
      this.variant() !== 'default' && `btn--${this.variant()}`,
      this.size() !== 'md' && `btn--${this.size()}`,
      this.block() && 'btn--block',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
