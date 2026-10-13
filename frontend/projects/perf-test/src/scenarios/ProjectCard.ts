import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, ProjectCard, type ProjectFact } from 'components';

/** The three variants: Psalter as in pages/projects, pages/builder-profile and pages/dashboard. */
@Component({
  selector: 'bn-project-card-scenario',
  imports: [Button, ProjectCard, RouterLink],
  template: `
    <ul class="stack">
      <li
        bn-project-card
        name="Psalter"
        [href]="['/projects', 'psalter']"
        byline="by Daniel Reyes"
        ownerName="Daniel Reyes"
        [ownerHref]="['/builders', 'daniel-reyes']"
        line="Scripture memory with spaced repetition"
        tone="clay"
        [facts]="facts"
      ></li>
    </ul>
    <article
      bn-project-card
      variant="feature"
      name="Psalter"
      headingId="proj-name"
      [href]="['/projects', 'psalter']"
      byline="Scripture memory with spaced repetition"
      [facts]="facts.slice(0, 2)"
    >
      <a bn-button slot="actions" variant="quiet" size="sm" [routerLink]="['/projects', 'psalter']"
        >Read about Psalter</a
      >
    </article>
    <div
      bn-project-card
      variant="summary"
      eyebrow="Your project"
      [headingLevel]="2"
      name="Harvest"
      [href]="['/projects', 'harvest']"
      byline="Volunteer scheduling for GTA food banks"
      [facts]="summaryFacts"
    >
      <a bn-button slot="actions" variant="quiet" size="sm" [routerLink]="['/projects', 'harvest']"
        >Read the feedback</a
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectCardScenario {
  protected readonly facts: ProjectFact[] = [
    { term: 'Stage', value: '1,900 beta users' },
    { term: 'Looking for', value: 'Contributors (open source)' },
    { term: 'Feedback', value: '41 comments' },
  ];
  protected readonly summaryFacts: ProjectFact[] = [
    { term: 'Stage', value: 'Beta · 6 food banks' },
    { term: 'Looking for', value: 'Technical co-founder' },
    { term: 'Feedback', value: '23 comments, 4 new' },
  ];
}
