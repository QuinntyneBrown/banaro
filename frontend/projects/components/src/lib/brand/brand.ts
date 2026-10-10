import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Banaro wordmark on a native link. The consumer names the link:
 * `<a bn-brand routerLink="/" aria-label="Banaro home" name="banaro">`.
 */
@Component({
  selector: 'a[bn-brand]',
  templateUrl: './brand.html',
  styleUrl: './brand.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'brand' },
})
export class Brand {
  /** Visible wordmark, such as "banaro". */
  readonly name = input.required<string>();
}
