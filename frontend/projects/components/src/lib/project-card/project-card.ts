import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ProjectCardVariant = 'card' | 'feature' | 'summary';
export type ProjectTone = 'sage' | 'clay' | 'fjord' | 'oat';

/** One labelled fact on a project card: its term and value arrive translated and formatted. */
export interface ProjectFact {
  readonly term: string;
  readonly value: string;
}

/**
 * A project outside its own page: a lettered mark, the name, who is building it, the one-line
 * pitch and a few facts. The host is the container (`li` in a list, `article` for the feature,
 * `div` for the summary) so list semantics stay valid. It holds no copy: every string arrives
 * through an input or the actions slot (docs/specs/components/project-card.md).
 */
@Component({
  selector: 'li[bn-project-card], article[bn-project-card], div[bn-project-card]',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.project]': "variant() === 'card'",
    '[class.aside-card]': "variant() !== 'card'",
    '[attr.aria-labelledby]': "variant() === 'feature' ? headingId() : null",
  },
})
export class ProjectCard {
  readonly variant = input<ProjectCardVariant>('card');
  readonly name = input.required<string>();
  /** When set, the name links to it. */
  readonly href = input<string | readonly unknown[] | null>(null);
  /** Card: the translated "by {owner}". Feature and summary: the one-line pitch. */
  readonly byline = input.required<string>();
  /** Card only: the owner's name inside `byline` becomes a link. Needs `ownerName` too. */
  readonly ownerHref = input<string | readonly unknown[] | null>(null);
  readonly ownerName = input<string | null>(null);
  /** Card only: the one-line description. */
  readonly line = input<string | null>(null);
  readonly facts = input<readonly ProjectFact[]>([]);
  readonly tone = input<ProjectTone>('sage');
  /** The mark's letter; the first letter of the name when unset. */
  readonly mark = input<string | null>(null);
  readonly headingLevel = input<2 | 3>(3);
  readonly headingId = input<string | null>(null);
  /** Summary only: shown above the head. */
  readonly eyebrow = input<string | null>(null);

  protected readonly letter = computed(
    () => this.mark() ?? [...this.name()][0]?.toLocaleUpperCase('en-CA') ?? '',
  );
  protected readonly summary = computed(() => this.variant() === 'summary');

  /** The byline cut around the owner's name, so the name can be a link. Null when there is nothing to link. */
  protected readonly ownerParts = computed(() => {
    const owner = this.ownerName();
    const at = owner && this.ownerHref() ? this.byline().indexOf(owner) : -1;
    return at < 0 || !owner
      ? null
      : {
          before: this.byline().slice(0, at),
          owner,
          after: this.byline().slice(at + owner.length),
        };
  });
}
