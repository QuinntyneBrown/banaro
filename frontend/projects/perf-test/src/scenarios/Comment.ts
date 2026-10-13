import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Comment } from 'components';

/** Hannah Kowalski's question on Psalter, from docs/mocks/pages/project-detail/default. */
@Component({
  selector: 'bn-comment-scenario',
  imports: [Comment],
  template: `
    <ol class="stack">
      <li
        bn-comment
        authorName="Hannah Kowalski"
        [authorHref]="['/builders', 'hannah-kowalski']"
        initials="HK"
        tone="clay"
        datetime="2026-10-07T09:00:00-04:00"
        when="2 days ago"
        body="I sat in on three of your beta users' first sessions in my head just from the onboarding copy. What happens when someone misses a week of reviews? That is where I'd expect people to quietly drop off."
      ></li>
    </ol>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommentScenario {}
