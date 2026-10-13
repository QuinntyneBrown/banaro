import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type SkeletonShape = 'text' | 'title' | 'photo' | 'circle' | 'block' | 'pill' | 'none';

/**
 * A placeholder shaped like the content still loading, sized to the final layout so nothing shifts
 * when it arrives (L2-007 criterion 7, L2-048). Hidden from assistive technology; the container
 * carries `aria-busy`.
 */
@Component({
  selector: 'span[bn-skeleton]',
  host: {
    '[class]': 'classes()',
    'aria-hidden': 'true',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.border-radius]': "radius() ? 'var(--radius-' + radius() + ')' : null",
  },
  template: '',
  styleUrl: './skeleton.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skeleton {
  readonly shape = input<SkeletonShape>('text');
  readonly short = input(false, { transform: booleanAttribute });
  readonly width = input<string>();
  readonly height = input<string>();
  readonly radius = input<'sm' | 'md' | 'lg' | 'full'>();

  protected readonly classes = computed(() => {
    const shape = this.shape() === 'none' ? '' : ` skeleton--${this.shape()}`;
    return `skeleton${shape}${this.short() ? ' is-short' : ''}`;
  });
}

/** A card of skeletons: `media` draws the photo row and two lines itself. */
@Component({
  selector: 'div[bn-skeleton-card]',
  imports: [Skeleton],
  host: { class: 'skeleton-card', 'aria-hidden': 'true' },
  template: `
    @if (layout() === 'media') {
      <div class="skeleton-card__top">
        <span bn-skeleton shape="photo"></span>
        <div>
          <span bn-skeleton width="60%"></span>
          <span bn-skeleton short></span>
        </div>
      </div>
      <span bn-skeleton></span>
      <span bn-skeleton short></span>
    } @else {
      <ng-content />
    }
  `,
  styleUrl: './skeleton.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonCard {
  readonly layout = input<'custom' | 'media'>('custom');
}
