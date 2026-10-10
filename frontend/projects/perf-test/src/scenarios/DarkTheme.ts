import { ChangeDetectionStrategy, Component } from '@angular/core';
import TopBarScenario from './TopBar';
import ButtonScenario from './Button';

/** The shell's header and primary action inside the dark theme. */
@Component({
  selector: 'bn-dark-theme-scenario',
  imports: [TopBarScenario, ButtonScenario],
  template: `
    <div data-theme="dark">
      <bn-top-bar-scenario />
      <bn-button-scenario />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DarkThemeScenario {}
