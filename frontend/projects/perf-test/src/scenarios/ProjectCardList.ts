import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProjectCard, type ProjectFact, type ProjectTone } from 'components';

interface Project {
  readonly name: string;
  readonly owner: string;
  readonly line: string;
  readonly tone: ProjectTone;
  readonly facts: readonly ProjectFact[];
}

const fact = (stage: string, lookingFor: string, comments: number): ProjectFact[] => [
  { term: 'Stage', value: stage },
  { term: 'Looking for', value: lookingFor },
  { term: 'Feedback', value: `${comments} comments` },
];

/** The seven projects of docs/mocks/pages/projects/default: the showcase list a visitor scrolls. */
@Component({
  selector: 'bn-project-card-list-scenario',
  imports: [ProjectCard],
  template: `
    <ul class="stack">
      @for (project of projects; track project.name) {
        <li
          bn-project-card
          [name]="project.name"
          [href]="['/projects', project.name.toLowerCase()]"
          [byline]="'by ' + project.owner"
          [line]="project.line"
          [tone]="project.tone"
          [facts]="project.facts"
        ></li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProjectCardListScenario {
  protected readonly projects: readonly Project[] = [
    {
      name: 'Harvest',
      owner: 'Amara Osei',
      line: 'Volunteer scheduling for GTA food banks',
      tone: 'sage',
      facts: fact('Beta · 6 food banks', 'Technical co-founder', 23),
    },
    {
      name: 'Psalter',
      owner: 'Daniel Reyes',
      line: 'Scripture memory with spaced repetition',
      tone: 'clay',
      facts: fact('1,900 beta users', 'Contributors (open source)', 41),
    },
    {
      name: 'Gather',
      owner: 'Grace Liu',
      line: 'Check-in and RSVP for small church events',
      tone: 'fjord',
      facts: fact('Prototype', 'Frontend engineer', 12),
    },
    {
      name: 'Ledgerline',
      owner: 'Noah Fischer',
      line: 'Plain-language giving reports for charities',
      tone: 'oat',
      facts: fact('Pilot · 4 charities', 'Advisor (CRA compliance)', 9),
    },
    {
      name: 'Kindred',
      owner: 'Sofia Marquez',
      line: 'Mentor matching for newcomers to Canada',
      tone: 'sage',
      facts: fact('Pilot · 3 churches', 'Contributors', 17),
    },
    {
      name: 'Wellspring',
      owner: 'Elijah Brooks',
      line: 'Low-cost water-quality sensors for rural partners',
      tone: 'clay',
      facts: fact('Hardware prototype', 'Co-founder', 6),
    },
    {
      name: 'Sabbath',
      owner: 'Ruth Alvarez',
      line: 'A gentle rest and screen-time coach',
      tone: 'fjord',
      facts: fact('Design', 'iOS engineer', 14),
    },
  ];
}
