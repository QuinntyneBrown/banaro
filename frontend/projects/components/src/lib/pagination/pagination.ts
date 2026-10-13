import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Button } from '../button/button';

/**
 * Moves through a long result set without losing the search and filters. The "load more" form adds
 * the next page below the current one; the page keeps the page number in the URL (L2-009 criterion
 * 5). The numbered and previous/next forms of the CRD come with the lists that need them.
 */
@Component({
  selector: 'bn-pagination',
  imports: [Button],
  template: `
    <div class="pager">
      @if (shown() < total()) {
        <button
          bn-button
          variant="quiet"
          size="lg"
          type="button"
          [busy]="busy()"
          [attr.aria-disabled]="busy() ? 'true' : null"
          (click)="loadMore()"
        >
          {{ busy() ? busyLabel() : moreLabel() }}
        </button>
      }
      <div class="pager__meter" aria-hidden="true"><span [style.width.%]="percent()"></span></div>
      <p #statusText class="pager__text" aria-live="polite" tabindex="-1">{{ status() }}</p>
    </div>
  `,
  styleUrl: './pagination.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly shown = input.required<number>();
  readonly total = input.required<number>();
  readonly page = input.required<number>();
  readonly pageCount = input.required<number>();
  readonly busy = input(false, { transform: booleanAttribute });
  readonly moreLabel = input('');
  readonly busyLabel = input('');
  readonly status = input.required<string>();

  readonly more = output<void>();

  protected readonly percent = computed(() =>
    this.total() ? Math.min(100, Math.max(1, (this.shown() / this.total()) * 100)) : 100,
  );

  private readonly statusText = viewChild.required<ElementRef<HTMLElement>>('statusText');
  private askedForMore = false;

  constructor() {
    // The button disappears on the last page; focus moves to the status text rather than the body.
    afterRenderEffect(() => {
      if (this.askedForMore && this.shown() >= this.total()) {
        this.askedForMore = false;
        this.statusText().nativeElement.focus();
      }
    });
  }

  protected loadMore(): void {
    if (this.busy()) return;
    this.askedForMore = true;
    this.more.emit();
  }
}
