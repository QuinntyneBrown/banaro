import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button, Card, Status } from 'components';

const CAST = [
  ['Daniel Reyes', 'Full-stack engineer', 94, 'Mississauga · 26.9 km away', 'Psalter', true],
  ['Grace Liu', 'Product designer', 91, 'Markham · 24.3 km away', 'Gather', true],
  ['Noah Fischer', 'Mobile engineer', 88, 'The Annex · 5.8 km away', null, false],
  ['Ruth Alvarez', 'Founder', 86, 'Scarborough · 13.5 km away', 'Harvest', false],
  ['Elijah Brooks', 'Data engineer', 84, 'Etobicoke · 16.2 km away', null, true],
  ['Esther Nguyen', 'Product manager', 81, 'Riverdale · 1.4 km away', null, false],
  ['Samuel Okafor', 'Designer', 79, 'North York · 14.9 km away', 'Lumen', false],
  ['Hannah Kim', 'Founder', 77, 'Leslieville · 0 km away', 'Tend', true],
  ['Isaac Mensah', 'Backend engineer', 75, 'Brampton · 31.2 km away', null, false],
  ['Miriam Haddad', 'Researcher', 73, 'Vaughan · 25.7 km away', 'Wellspring', false],
  ['Joel Tanaka', 'Engineer', 71, 'Oakville · 35.4 km away', null, false],
  ['Leah Moreau', 'Product designer', 69, 'Richmond Hill · 22.1 km away', 'Plainsong', false],
] as const;

/** A page of 12 member cards, the directory's repeated composition (docs/mocks/pages/directory). */
@Component({
  selector: 'bn-directory-results-scenario',
  imports: [Button, Card, Status],
  template: `
    <ul class="results">
      @for (b of cast; track b[0]; let i = $index) {
        <li>
          <article
            bn-card
            [slug]="'b' + i"
            [name]="b[0]"
            [link]="['/builders', 'b' + i]"
            [role]="b[1]"
            [initials]="b[0][0]"
            [match]="b[2]"
            matchLabel="match"
            [place]="b[3]"
            [skills]="['Laravel', 'Angular', 'PostgreSQL']"
            skillsLabel="Skills"
            [building]="b[4]"
            openTo="Co-founding"
            buildingLabel="Building"
            openToLabel="Open to"
            noProjectLabel="No project listed"
          >
            <bn-status slot="status" [online]="b[5]">{{
              b[5] ? 'Online now' : 'Seen 4 h ago'
            }}</bn-status>
            <button slot="actions" bn-button variant="quiet" size="sm" type="button">
              Say hello
            </button>
          </article>
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DirectoryResultsScenario {
  protected readonly cast = CAST;
}
