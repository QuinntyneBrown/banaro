import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'solid' | 'count';

/** A short state word or a count; colour is never the only signal, the word is always there. */
@Component({
  selector: 'bn-badge',
  template: '<ng-content />',
  styleUrl: './badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': "isLabelledCount() ? 'img' : null",
    '[attr.aria-label]': 'isLabelledCount() ? label() : null',
    '[attr.aria-hidden]': "decorative() ? 'true' : null",
  },
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
  readonly label = input<string | null>(null);
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    this.tone() === 'neutral' ? 'badge' : `badge badge--${this.tone()}`,
  );
  protected readonly isLabelledCount = computed(
    () => this.tone() === 'count' && !!this.label() && !this.decorative(),
  );
}

/** A builder's presence: a dot and a word, "Online now" or "Seen 4 h ago" (L2-009, L2-050). */
@Component({
  selector: 'bn-status',
  template: '<span class="status__dot" aria-hidden="true"></span><ng-content />',
  styleUrl: './badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'status', '[class.status--online]': 'online()' },
})
export class Status {
  readonly online = input(false, { transform: booleanAttribute });
}
