import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Chip, ChipList } from 'components';

const SKILLS = [
  'React',
  'Figma',
  'Python',
  'Product strategy',
  'User research',
  'Laravel',
  'Data/ML',
  'Marketing',
  'Angular',
  'Swift',
  'Kotlin',
  'Fundraising',
];
const PRESSED = new Set(['Figma', 'Product strategy', 'User research']);

/** The onboarding skill catalogue, three chosen (docs/mocks/pages/onboarding/skills). */
@Component({
  selector: 'bn-skill-chips-scenario',
  imports: [Chip, ChipList],
  template: `
    <ul bn-chip-list aria-label="Skills">
      @for (skill of skills; track skill) {
        <li>
          <button bn-chip [pressed]="pressed.has(skill)">{{ skill }}</button>
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SkillChipsScenario {
  protected readonly skills = SKILLS;
  protected readonly pressed = PRESSED;
}
