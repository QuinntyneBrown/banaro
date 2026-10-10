import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Multi-line text styles on the native element: `<textarea bn-textarea [invalid]="...">`. */
@Component({
  selector: 'textarea[bn-textarea]',
  template: '',
  styleUrl: './textarea.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'textarea',
    '[attr.aria-invalid]': 'invalid() || null',
  },
})
export class Textarea {
  readonly invalid = input(false, { transform: booleanAttribute });
}
