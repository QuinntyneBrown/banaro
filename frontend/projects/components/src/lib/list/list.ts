import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

/** A list of rows (title, meta, optional media and end action) or a plain linked list. */
@Component({
  selector: 'ul[bn-list], ol[bn-list]',
  host: { '[class.rows]': "variant() === 'rows'", '[class.list]': "variant() === 'plain'" },
  template: `<ng-content />`,
  styleUrl: './list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class List {
  readonly variant = input<'rows' | 'plain'>('rows');
}

/** One row of a `bn-list`; reads the variant from its list. */
@Component({
  selector: 'li[bn-list-item]',
  imports: [NgTemplateOutlet, RouterLink],
  template: `
    <ng-template #media><ng-content select="[slot=media]" /></ng-template>
    <ng-template #end><ng-content select="[slot=end]" /></ng-template>
    @if (list.variant() === 'rows') {
      <ng-container [ngTemplateOutlet]="media" />
      <div class="rows__main">
        @switch (titleLevel()) {
          @case ('h2') {
            <h2 class="rows__title"><ng-container [ngTemplateOutlet]="titleText" /></h2>
          }
          @case ('h3') {
            <h3 class="rows__title"><ng-container [ngTemplateOutlet]="titleText" /></h3>
          }
          @case ('h4') {
            <h4 class="rows__title"><ng-container [ngTemplateOutlet]="titleText" /></h4>
          }
          @default {
            <p class="rows__title"><ng-container [ngTemplateOutlet]="titleText" /></p>
          }
        }
        @if (meta()) {
          <p class="rows__meta">{{ meta() }}</p>
        }
      </div>
      <ng-container [ngTemplateOutlet]="end" />
    } @else {
      @if (link()) {
        <a [routerLink]="link()" [attr.aria-current]="current() ? 'true' : null">
          <ng-container [ngTemplateOutlet]="media" />
          <span
            >{{ title() }}
            @if (meta()) {
              <br /><small>{{ meta() }}</small>
            }
          </span>
        </a>
      } @else {
        <ng-container [ngTemplateOutlet]="media" />
        <span>{{ title() }}</span>
      }
    }
    <ng-template #titleText>
      @if (link()) {
        <a [routerLink]="link()">{{ title() }}</a>
      } @else {
        {{ title() }}
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItem {
  protected readonly list = inject(List);

  readonly title = input.required<string>();
  readonly titleLevel = input<'h2' | 'h3' | 'h4' | 'p'>('p');
  readonly link = input<string | readonly unknown[] | null>(null);
  readonly meta = input<string | null>(null);
  readonly current = input(false, { transform: booleanAttribute });
}
