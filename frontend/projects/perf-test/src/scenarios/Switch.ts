import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Switch, SwitchControl } from 'components';

/** The online-status switch from Settings › Privacy (docs/mocks/pages/settings/privacy). */
@Component({
  selector: 'bn-switch-scenario',
  imports: [Switch, SwitchControl],
  template: `
    <bn-switch
      controlId="show-online"
      label="Show when I was last online"
      description='Builders see "Online now" or when you were last seen.'
    >
      <input bn-switch type="checkbox" id="show-online" name="show-online" checked />
    </bn-switch>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SwitchScenario {}
