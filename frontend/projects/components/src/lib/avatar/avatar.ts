import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

export type AvatarTile = 'sage' | 'clay' | 'fjord' | 'oat';
export type AvatarSize = 'sm' | 'default' | 'md' | 'lg';

const PIXELS: Record<AvatarSize, number> = { sm: 32, default: 40, md: 48, lg: 64 };

/**
 * A person's photo, or an initials tile when there is no photo or it fails to load. Decorative
 * avatars sit next to the visible name and are hidden from assistive technology.
 */
@Component({
  selector: 'bn-avatar',
  template: `
    @if (src() && !failed()) {
      <img
        [class]="sizeClass('avatar')"
        [src]="src()"
        [width]="pixels()"
        [height]="pixels()"
        [alt]="decorative() ? '' : name()"
        [attr.loading]="lazy() ? 'lazy' : null"
        (error)="failed.set(true)"
      />
    } @else {
      <span
        [class]="sizeClass('avatar-initials tile--' + tile())"
        [attr.role]="decorative() ? null : 'img'"
        [attr.aria-label]="decorative() ? null : name()"
        [attr.aria-hidden]="decorative() ? 'true' : null"
        >{{ initials() }}
        @if (!initials()) {
          <ng-content />
        }
      </span>
    }
  `,
  styleUrl: './avatar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
  readonly name = input.required<string>();
  readonly src = input<string | null>(null);
  readonly initials = input('');
  readonly tile = input<AvatarTile>('sage');
  readonly size = input<AvatarSize>('default');
  readonly decorative = input(false, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });

  protected readonly failed = signal(false);
  protected readonly pixels = computed(() => PIXELS[this.size()]);

  protected sizeClass(base: string): string {
    return this.size() === 'default' ? base : `${base} avatar--${this.size()}`;
  }
}

/** Initials for a tile: the first letters of the first and last words of a name. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}
