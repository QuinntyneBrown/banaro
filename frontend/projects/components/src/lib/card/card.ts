import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarTile } from '../avatar/avatar';
import { Tag } from '../chip/chip';

/**
 * One builder in the directory: photo or initials, name link, role, match, place, skills, the
 * "Building" and "Open to" facts, presence and actions. The visitor variant shows only what a
 * signed-out visitor may see (L2-009 criteria 1 and 6).
 */
@Component({
  selector: 'article[bn-card]',
  imports: [NgTemplateOutlet, RouterLink, Tag],
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'card',
    '[id]': "'b-' + slug()",
    '[attr.aria-labelledby]': "'n-' + slug()",
    '[attr.data-state]': "selected() ? 'selected' : null",
    '[attr.aria-current]': "selected() ? 'true' : null",
  },
})
export class Card {
  readonly slug = input.required<string>();
  readonly name = input.required<string>();
  readonly link = input.required<string | readonly unknown[]>();
  readonly role = input.required<string>();
  readonly photo = input<string | null>(null);
  readonly initials = input.required<string>();
  readonly tile = input<AvatarTile>('sage');
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly headingLevel = input<2 | 3 | 4>(3);
  readonly variant = input<'member' | 'visitor'>('member');
  readonly match = input<number | null>(null);
  readonly matchLabel = input.required<string>();
  readonly place = input.required<string>();
  readonly skills = input<readonly string[]>([]);
  readonly skillsLabel = input.required<string>();
  readonly building = input<string | null>(null);
  readonly openTo = input.required<string>();
  readonly buildingLabel = input.required<string>();
  readonly openToLabel = input.required<string>();
  readonly noProjectLabel = input.required<string>();
  readonly selected = input(false, { transform: booleanAttribute });

  protected readonly photoFailed = signal(false);
  protected readonly member = computed(() => this.variant() === 'member');
  protected readonly nameId = computed(() => `n-${this.slug()}`);
}
