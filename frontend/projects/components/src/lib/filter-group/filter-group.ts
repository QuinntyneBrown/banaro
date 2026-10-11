import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';
import { Chip, ChipList } from '../chip/chip';

/** One option of a filter group; the count arrives formatted ("486"). */
export interface FilterOption {
  value: string;
  label: string;
  count?: string | null;
}

/**
 * One group of directory filters in a `fieldset` with its `legend` (L2-010 criterion 5): checkboxes
 * (any of), radios (one of) or toggle chips with `aria-pressed`, each with its count.
 */
@Component({
  selector: 'bn-filter-group',
  imports: [Checkbox, Chip, ChipList],
  template: `
    <fieldset class="filter">
      <legend class="filter__legend">{{ legend() }}</legend>
      @if (kind() === 'chips') {
        <ul bn-chip-list>
          @for (option of options(); track option.value) {
            <li>
              <button
                bn-chip
                type="button"
                [pressed]="isOn(option.value)"
                [count]="option.count ?? null"
                (pressedChange)="changed.emit({ value: option.value, on: $event })"
              >
                {{ option.label }}
              </button>
            </li>
          }
        </ul>
      } @else {
        <ul class="filter__list">
          @for (option of options(); track option.value) {
            <li>
              <label class="check">
                <input
                  bn-checkbox
                  [type]="kind()"
                  [name]="name()"
                  [value]="option.value"
                  [checked]="isOn(option.value)"
                  (change)="changed.emit({ value: option.value, on: $any($event.target).checked })"
                />
                <span>{{ option.label }}</span>
                @if (option.count !== undefined && option.count !== null) {
                  <span class="check__count">{{ option.count }}</span>
                }
              </label>
            </li>
          }
        </ul>
      }
    </fieldset>
  `,
  styleUrl: './filter-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterGroup {
  readonly legend = input.required<string>();
  readonly kind = input<'checkbox' | 'radio' | 'chips'>('checkbox');
  /** Radio group name; also names checkboxes for form posts. */
  readonly name = input.required<string>();
  readonly options = input.required<readonly FilterOption[]>();
  readonly selected = input<readonly string[]>([]);

  /** An option was turned on or off; a radio only ever turns one on. */
  readonly changed = output<{ value: string; on: boolean }>();

  private readonly chosen = computed(() => new Set(this.selected()));

  protected isOn(value: string): boolean {
    return this.chosen().has(value);
  }
}

/** The filters in force as removable chips, with "Clear all" (L2-010 criterion 3). */
@Component({
  selector: 'bn-active-filters',
  imports: [Button, Chip, ChipList],
  template: `
    <div class="cluster">
      <ul bn-chip-list [attr.aria-label]="label()">
        @for (chip of chips(); track chip.key) {
          <li>
            <button
              bn-chip
              kind="remove"
              type="button"
              [removeLabel]="chip.removeLabel"
              (removed)="removed.emit(chip.key)"
            >
              {{ chip.label }}
            </button>
          </li>
        }
      </ul>
      <button bn-button variant="text" size="sm" type="button" (click)="cleared.emit()">
        {{ clearLabel() }}
      </button>
    </div>
  `,
  styleUrl: './filter-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveFilters {
  /** The list's accessible name, "Active filters". */
  readonly label = input.required<string>();
  readonly chips = input.required<readonly { key: string; label: string; removeLabel: string }[]>();
  readonly clearLabel = input.required<string>();

  readonly removed = output<string>();
  readonly cleared = output<void>();
}
