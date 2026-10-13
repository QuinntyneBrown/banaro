import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Comment } from 'components';

interface Note {
  readonly name: string;
  readonly initials: string;
  readonly when: string;
  readonly body: string;
}

/** The five most recent comments on Psalter, the list a reader scrolls (docs/mocks/pages/project-detail/default). */
@Component({
  selector: 'bn-comment-list-scenario',
  imports: [Comment],
  template: `
    <ol class="stack">
      @for (note of notes; track note.name) {
        <li
          bn-comment
          [authorName]="note.name"
          [authorHref]="['/builders', note.name.toLowerCase().replace(' ', '-')]"
          [initials]="note.initials"
          datetime="2026-10-07T09:00:00-04:00"
          [when]="note.when"
          [body]="note.body"
        ></li>
      }
    </ol>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommentListScenario {
  protected readonly notes: readonly Note[] = [
    {
      name: 'Hannah Kowalski',
      initials: 'HK',
      when: '2 days ago',
      body: 'What happens when someone misses a week of reviews? That is where I would expect people to quietly drop off.',
    },
    {
      name: 'Noah Fischer',
      initials: 'NF',
      when: '3 days ago',
      body: 'The review queue is lovely. Could the streak count be optional? On a hard week it can feel like a verdict.',
    },
    {
      name: 'Grace Liu',
      initials: 'GL',
      when: '5 days ago',
      body: 'The verse card is the calmest screen I have seen in a memory app. Please keep the generous line spacing.',
    },
    {
      name: 'Marcus Bennett',
      initials: 'MB',
      when: '1 week ago',
      body: 'At 1,900 users, how is the scheduling job holding up? I would happily review the queue design.',
    },
    {
      name: 'Amara Osei',
      initials: 'AO',
      when: '1 week ago',
      body: 'I use Psalter every morning on the streetcar. The Psalm 121 deck got me through a very long September.',
    },
  ];
}
