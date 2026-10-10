import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Field, Input } from 'components';

/** Invalid e-mail field from docs/mocks/pages/contact/invalid. */
@Component({
  selector: 'bn-field-scenario',
  imports: [Field, Input],
  template: `
    <bn-field
      label="E-mail"
      controlId="c-email"
      error="Enter an e-mail address like name@example.com"
    >
      <input
        bn-input
        id="c-email"
        type="email"
        value="amara@"
        invalid
        aria-describedby="c-email-err"
      />
    </bn-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldScenario {}
