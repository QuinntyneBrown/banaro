import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '../button/button';

/**
 * Rounded search field with a submit button; emits the trimmed query on submit, and every change as
 * it is typed for pages that search as you type (the directory debounces it, L2-009).
 */
@Component({
  selector: 'bn-search-box',
  imports: [Button],
  template: `
    <form class="search" role="search" (submit)="submit($event, box.value)">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
      <label class="vh" [attr.for]="inputId()">{{ label() }}</label>
      <input
        #box
        class="search__input"
        [id]="inputId()"
        name="q"
        type="search"
        autocomplete="off"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="typed.emit(box.value)"
      />
      <button bn-button variant="primary" type="submit">{{ buttonLabel() }}</button>
    </form>
  `,
  styleUrl: './search-box.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBox {
  readonly label = input.required<string>();
  readonly buttonLabel = input.required<string>();
  readonly placeholder = input('');
  readonly inputId = input('q');
  /** The starting text, such as the search term from the URL. */
  readonly value = input('');
  readonly searched = output<string>();
  readonly typed = output<string>();

  protected submit(event: Event, query: string): void {
    event.preventDefault();
    this.searched.emit(query.trim());
  }
}
