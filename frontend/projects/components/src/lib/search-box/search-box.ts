import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { Button } from '../button/button';

/**
 * Rounded search field with a submit button; emits the trimmed query on submit, and every change as
 * it is typed for pages that search as you type (the directory debounces it, L2-009).
 */
@Component({
  selector: 'bn-search-box',
  imports: [Button, NgTemplateOutlet],
  template: `
    <ng-template #field>
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
    </ng-template>
    @if (embedded()) {
      <div class="search"><ng-container [ngTemplateOutlet]="field" /></div>
    } @else {
      <form class="search" role="search" (submit)="submit($event)">
        <ng-container [ngTemplateOutlet]="field" />
      </form>
    }
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
  /** Renders `div.search` instead of `form.search`, to sit inside a toolbar's own form. */
  readonly embedded = input(false, { transform: booleanAttribute });
  readonly searched = output<string>();
  readonly typed = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected submit(event: Event): void {
    event.preventDefault();
    const box = this.host.nativeElement.querySelector<HTMLInputElement>('input.search__input');
    this.searched.emit((box?.value ?? '').trim());
  }
}
