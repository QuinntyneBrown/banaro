import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Field, Textarea } from 'components';

/** Message field with help text from docs/mocks/pages/contact. */
@Component({
  selector: 'bn-textarea-scenario',
  imports: [Field, Textarea],
  template: `
    <bn-field
      label="Message"
      controlId="c-message"
      help="Tell us a little context. A real person reads every message, usually within two working days."
    >
      <textarea bn-textarea id="c-message" rows="6" aria-describedby="c-message-help"></textarea>
    </bn-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextareaScenario {}
