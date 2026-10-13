import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';

/**
 * A toggle chip (skills, filters) or a removable chip (active filters, chosen skills). The page owns
 * the state: `pressed` is never changed by the chip, which only asks through `pressedChange`.
 */
@Component({
  selector: 'button[bn-chip]',
  host: {
    class: 'chip',
    type: 'button',
    '[attr.aria-pressed]': "kind() === 'remove' ? 'true' : pressed() ? 'true' : 'false'",
    '[attr.aria-label]': "kind() === 'remove' ? removeLabel() : null",
    '(click)': 'activate()',
  },
  template: `
    @if (kind() === 'toggle' && pressed()) {
      <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    }
    <ng-content />
    @if (count() !== null) {
      <span class="chip__count">{{ count() }}</span>
    }
    @if (kind() === 'remove') {
      <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    }
  `,
  styleUrl: './chip.css',
  // Styles the host button itself and the list classes around it.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Chip {
  readonly kind = input<'toggle' | 'remove'>('toggle');
  readonly pressed = input(false, { transform: booleanAttribute });
  readonly count = input<string | null>(null);
  readonly removeLabel = input<string>();

  readonly pressedChange = output<boolean>();
  readonly removed = output<void>();

  protected activate(): void {
    if (this.kind() === 'remove') this.removed.emit();
    else this.pressedChange.emit(!this.pressed());
  }
}

/** A list of chips or tags: `.chips`, `.tags` or `.active-filters`. */
@Component({
  selector: 'ul[bn-chip-list]',
  host: { '[class]': 'listClass()' },
  template: `<ng-content />`,
  styleUrl: './chip.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipList {
  readonly layout = input<'chips' | 'tags' | 'active-filters'>('chips');
  protected readonly listClass = computed(() => this.layout());
}

/** A static tag: a skill on a card, "Open to co-founding". */
@Component({
  selector: 'li[bn-tag], span[bn-tag], p[bn-tag]',
  host: { class: 'pill', '[class.pill--sage]': "tone() === 'sage'" },
  template: `<ng-content select="[slot=icon]" /><ng-content />`,
  styleUrl: './chip.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tag {
  readonly tone = input<'neutral' | 'sage'>('neutral');
}
