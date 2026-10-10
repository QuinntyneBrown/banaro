import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type EmptyIconName =
  | 'alert'
  | 'search'
  | 'calendar'
  | 'message'
  | 'bell'
  | 'mail'
  | 'clock'
  | 'check'
  | 'offline'
  | 'photo';

/** The icon tile of an empty state, drawn as the mocks draw it. */
@Component({
  selector: 'span[bn-empty-icon]',
  host: { class: 'empty__icon', '[class.empty--error]': "tone() === 'danger'" },
  template: `
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      @switch (icon()) {
        @case ('search') {
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        }
        @case ('calendar') {
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        }
        @case ('message') {
          <path
            d="M4.5 6.5A2.5 2.5 0 0 1 7 4h10a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 17 16h-5.5L7 19.5V16a2.5 2.5 0 0 1-2.5-2.5z"
          />
        }
        @case ('bell') {
          <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
          <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
        }
        @case ('mail') {
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
          <path d="m4 7 8 6 8-6" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        }
        @case ('check') {
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        }
        @case ('offline') {
          <path d="M3.5 3.5 20.5 20.5" />
          <path d="M8.5 15.5a5 5 0 0 1 4-1.4M5 12a9 9 0 0 1 3.5-2M19 12a9 9 0 0 0-6-3" />
          <path d="M12 19h.01" />
        }
        @case ('photo') {
          <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="m4 18 5-5 4 4 3-3 4.5 4.5" />
        }
        @default {
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5M12 15.5h.01" />
        }
      }
    </svg>
  `,
  styleUrl: './empty-state.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyIcon {
  readonly icon = input.required<EmptyIconName>();
  readonly tone = input<'accent' | 'danger'>('accent');
}

/**
 * What to show when there is nothing yet, nothing matched, or loading failed: an icon, a title,
 * one or two sentences and up to three actions (`slot="actions"`).
 */
@Component({
  selector: 'bn-empty-state',
  imports: [EmptyIcon],
  template: `
    <div [class]="classes()" [attr.role]="live() ? 'status' : null">
      <span bn-empty-icon [icon]="iconName()"></span>
      @switch (headingLevel()) {
        @case (1) {
          <h1 class="empty__title">{{ heading() }}</h1>
        }
        @case (3) {
          <h3 class="empty__title">{{ heading() }}</h3>
        }
        @default {
          <h2 class="empty__title">{{ heading() }}</h2>
        }
      }
      <p><ng-content /></p>
      <div class="empty__actions"><ng-content select="[slot=actions]" /></div>
    </div>
  `,
  styleUrl: './empty-state.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly heading = input.required<string>();
  readonly headingLevel = input<1 | 2 | 3>(2);
  readonly icon = input<EmptyIconName>();
  readonly tone = input<'neutral' | 'error'>('neutral');
  readonly compact = input(false, { transform: booleanAttribute });
  readonly live = input(false, { transform: booleanAttribute });

  protected readonly iconName = computed<EmptyIconName>(() => this.icon() ?? 'alert');
  protected readonly classes = computed(() =>
    ['empty', this.tone() === 'error' ? 'empty--error' : '', this.compact() ? 'empty--compact' : '']
      .filter(Boolean)
      .join(' '),
  );
}
