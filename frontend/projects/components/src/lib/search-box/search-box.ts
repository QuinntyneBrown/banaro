import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Button } from '../button/button';

/** Rounded search field with a submit button; emits the trimmed query. */
@Component({
  selector: 'bn-search-box',
  imports: [Button],
  template: `
    <form class="search" role="search" (submit)="submit($event)">
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
      <label class="vh" [attr.for]="inputId()">{{ label() }}</label>
      <input
        class="search__input"
        [id]="inputId()"
        name="q"
        type="search"
        autocomplete="off"
        [placeholder]="placeholder()"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
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
  readonly searched = output<string>();

  protected readonly query = signal('');

  protected submit(event: Event): void {
    event.preventDefault();
    this.searched.emit(this.query().trim());
  }
}
