import { CdkDialogContainer } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * The dialog panel: CDK's container (focus trap, `role`, `aria-modal`, labelling) carrying the
 * `.dialog` surface itself.
 */
@Component({
  selector: 'bn-dialog-container',
  imports: [CdkPortalOutlet],
  host: { class: 'dialog' },
  template: `<ng-template cdkPortalOutlet />`,
  styleUrl: './dialog.css',
  encapsulation: ViewEncapsulation.None,
  // The CDK base class manages its own change detection for the attached content.
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DialogContainer extends CdkDialogContainer {}
