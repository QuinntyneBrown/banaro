import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '../button/button';

let nextId = 0;

/**
 * Sets an irreversible action apart from the rest of an edit screen: a title, what would be lost and
 * one quiet red trigger. The confirmation itself is a dialog the page opens when the trigger fires
 * (docs/specs/components/danger-zone.md).
 */
@Component({
  selector: 'bn-danger-zone',
  imports: [Button],
  template: `
    <section class="danger-zone" [attr.aria-labelledby]="titleId">
      @switch (headingLevel()) {
        @case (3) {
          <h3 class="danger-zone__title" [id]="titleId">{{ heading() }}</h3>
        }
        @default {
          <h2 class="danger-zone__title" [id]="titleId">{{ heading() }}</h2>
        }
      }
      <p><ng-content /></p>
      <div>
        <button
          bn-button
          variant="quiet"
          type="button"
          class="link-danger"
          [disabled]="disabled()"
          (click)="actionTriggered.emit()"
        >
          <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 7h14M10 4h4M7 7l.8 12.5h8.4L17 7M10 11v5M14 11v5" />
          </svg>
          {{ actionLabel() }}
        </button>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .danger-zone {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      border: var(--border-width-hairline) solid var(--color-danger-border);
    }
    .danger-zone__title {
      margin: 0;
      font: var(--text-h4);
      color: var(--color-danger-fg);
    }
    .danger-zone p {
      margin: 0;
      color: var(--color-fg-muted);
    }
    .link-danger {
      color: var(--color-danger-fg);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DangerZone {
  readonly heading = input.required<string>();
  readonly headingLevel = input<2 | 3>(2);
  readonly actionLabel = input.required<string>();
  readonly disabled = input(false);
  /** The trigger was activated; the page opens the confirmation dialog. */
  readonly actionTriggered = output<void>();

  /** Unique per instance, so two zones on one page never clash. */
  protected readonly titleId = `bn-dz-${++nextId}-title`;
}
