import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Button,
  Field,
  FieldRow,
  Form,
  FormActions,
  FormSection,
  Input,
  InputGroup,
} from 'components';

/** A profile-edit section: a field row, a skill input group and the actions. */
@Component({
  selector: 'bn-form-layout-scenario',
  imports: [Button, Field, FieldRow, Form, FormActions, FormSection, Input, InputGroup],
  template: `
    <form bn-form novalidate aria-label="Edit profile">
      <fieldset bn-form-section legend="Experience">
        <div bn-field-row>
          <bn-field label="Role title" controlId="experience-0-title">
            <input bn-input id="experience-0-title" type="text" value="Founder" />
          </bn-field>
          <bn-field label="Organisation" controlId="experience-0-organization">
            <input bn-input id="experience-0-organization" type="text" value="Harvest" />
          </bn-field>
        </div>
      </fieldset>
      <bn-field
        label="Skills"
        controlId="skill-add"
        help="Up to 12 skills. Press Enter to add one."
      >
        <bn-input-group>
          <input bn-input id="skill-add" type="text" placeholder="Add a skill, such as Laravel" />
          <button bn-button variant="quiet" type="button">Add</button>
        </bn-input-group>
      </bn-field>
      <div bn-form-actions>
        <button bn-button variant="primary" type="submit">Save changes</button>
        <a bn-button variant="quiet" href="/builders/amara-osei">Cancel</a>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FormLayoutScenario {}
