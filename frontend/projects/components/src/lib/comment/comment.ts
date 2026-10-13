import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar, AvatarTile } from '../avatar/avatar';

/**
 * One member's note on a project: their face, their name linked to their profile, when they wrote
 * it and the words. The text is plain and shown as text, never as markup (L2-045). Reply, hide and
 * "New" arrive with the owner's tools (docs/specs/components/comment.md).
 */
@Component({
  selector: 'li[bn-comment]',
  imports: [Avatar, NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'comment' },
  template: `
    <bn-avatar
      [name]="authorName()"
      [src]="photo()"
      [initials]="initials()"
      [tile]="tone()"
      decorative
      lazy
    />
    <div>
      <div class="comment__head">
        @switch (headingLevel()) {
          @case (4) {
            <h4 class="comment__name"><ng-container [ngTemplateOutlet]="name" /></h4>
          }
          @default {
            <h3 class="comment__name"><ng-container [ngTemplateOutlet]="name" /></h3>
          }
        }
        <span class="comment__meta"
          ><time [attr.datetime]="datetime()">{{ when() }}</time></span
        >
      </div>
      <p class="comment__body">{{ body() }}</p>
    </div>
    <ng-template #name>
      @if (authorHref(); as link) {
        <a [routerLink]="link">{{ authorName() }}</a>
      } @else {
        {{ authorName() }}
      }
    </ng-template>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-4);
      padding-block: var(--space-6);
      border-top: var(--border-width-hairline) solid var(--color-border-default);
    }
    .comment__head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--space-1) var(--space-3);
    }
    .comment__name {
      margin: 0;
      font: var(--text-h4);
    }
    .comment__name a {
      color: inherit;
      text-decoration: none;
    }
    .comment__name a:hover {
      text-decoration: underline;
    }
    .comment__meta {
      font: var(--text-caption);
      color: var(--color-fg-subtle);
    }
    .comment__body {
      margin: var(--space-2) 0 0;
      color: var(--color-fg-muted);
      font: var(--text-body);
      max-width: var(--size-footer-land-max-width-17);
      white-space: pre-line;
    }
  `,
})
export class Comment {
  readonly authorName = input.required<string>();
  /** The author's profile; the name is plain text without it. */
  readonly authorHref = input<string | readonly unknown[] | null>(null);
  readonly photo = input<string | null>(null);
  readonly initials = input('');
  readonly tone = input<AvatarTile>('sage');
  /** ISO 8601, written on the `time` element. */
  readonly datetime = input.required<string>();
  /** The same moment in words, such as "2 days ago". */
  readonly when = input.required<string>();
  readonly body = input.required<string>();
  readonly headingLevel = input<3 | 4>(3);
}
