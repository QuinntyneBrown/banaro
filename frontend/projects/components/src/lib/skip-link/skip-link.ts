import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

/** First focusable element: moves focus to the main landmark without changing the route. */
@Component({
  selector: 'bn-skip-link',
  template: `<a class="skip-link" [href]="'#' + target()" (click)="skip($event)">{{ label() }}</a>`,
  styleUrl: './skip-link.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkipLink {
  private readonly document = inject(DOCUMENT);

  readonly label = input.required<string>();
  readonly target = input('main');

  protected skip(event: Event): void {
    const main = this.document.getElementById(this.target());
    if (!main) return;
    event.preventDefault();
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    main.focus();
  }
}
