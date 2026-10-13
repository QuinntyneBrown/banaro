import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DirectoryFacets, DirectoryFilters, TranslatePipe } from 'api';
import { Button, Dialog } from 'components';
import { DirectoryFiltersForm } from './directory-filters';

export interface FilterSheetData {
  facets: DirectoryFacets | null;
  filters: DirectoryFilters;
}

/**
 * The directory filters as a bottom sheet below 992 px (L2-010 criterion 6). Choices are staged
 * and applied by "Apply"; Escape or the close button leaves the filters as they were.
 */
@Component({
  selector: 'bn-filter-sheet',
  imports: [Button, Dialog, DirectoryFiltersForm, TranslatePipe],
  template: `
    <bn-dialog
      iconTone="none"
      [heading]="'directory.filters.title' | t"
      [closeLabel]="'directory.filters.close' | t"
    >
      <bn-directory-filters
        radioName="sheet-distance"
        [facets]="data.facets"
        [filters]="staged()"
        (filtersChange)="staged.set($event)"
      />
      <button slot="actions" bn-button variant="primary" type="button" block (click)="apply()">
        {{ 'directory.filters.apply' | t }}
      </button>
    </bn-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSheet {
  private readonly ref = inject<DialogRef<DirectoryFilters>>(DialogRef);
  protected readonly data = inject<FilterSheetData>(DIALOG_DATA);
  protected readonly staged = signal(this.data.filters);

  protected apply(): void {
    this.ref.close(this.staged());
  }
}
