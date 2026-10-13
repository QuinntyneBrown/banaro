import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button, EmptyState } from 'components';

/** The profile that could not load (docs/mocks/pages/profile-edit/error). */
@Component({
  selector: 'bn-empty-state-scenario',
  imports: [Button, EmptyState],
  template: `
    <bn-empty-state tone="error" heading="We couldn't load your profile">
      Banaro had trouble reaching the server. Nothing was changed. Try again, or head back to your
      profile.
      <button slot="actions" bn-button variant="primary" type="button">Try again</button>
      <a slot="actions" bn-button variant="quiet" href="/builders/amara-osei"
        >Back to your profile</a
      >
    </bn-empty-state>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmptyStateScenario {}
