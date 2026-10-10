import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Toast } from './toast';
import { TOAST_DISMISS_LABEL, ToastService } from './toast.service';

/** Fixed region in the application shell that shows the visible toasts, newest on top. */
@Component({
  selector: 'bn-toast-region',
  imports: [Toast],
  template: `
    <div class="toast-region" role="status" aria-live="polite">
      @for (toast of toasts.visible(); track toast.id) {
        <bn-toast
          [variant]="toast.variant"
          [heading]="toast.options.title"
          [body]="toast.options.body"
          [actionLabel]="toast.options.action?.label"
          [kind]="toast.options.kind"
          [dismissLabel]="dismissLabel()"
          (actionSelected)="toasts.act(toast.id)"
          (dismissed)="toasts.dismiss(toast.id)"
          (paused)="toasts.pause(toast.id, $event)"
        />
      }
    </div>
  `,
  styleUrl: './toast-region.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastRegion {
  protected readonly toasts = inject(ToastService);
  protected readonly dismissLabel = inject(TOAST_DISMISS_LABEL);
}
