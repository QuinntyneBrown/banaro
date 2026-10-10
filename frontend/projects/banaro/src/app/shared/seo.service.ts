import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface PageMeta {
  title: string;
  description?: string;
  /** Path of the canonical URL, such as `/`. Omit for pages that have none, such as error pages. */
  path?: string;
  /** Keeps the page out of search results (L2-042 criterion 5). */
  noindex?: boolean;
}

/**
 * Sets the title, description, canonical link and robots directive. During SSR they land in the
 * HTML response, so crawlers read them without running script (L2-039 criterion 4).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  set(page: PageMeta): void {
    this.title.setTitle(page.title);

    if (page.description) this.meta.updateTag({ name: 'description', content: page.description });
    else this.meta.removeTag('name="description"');

    if (page.noindex) this.meta.updateTag({ name: 'robots', content: 'noindex' });
    else this.meta.removeTag('name="robots"');

    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!page.path) {
      canonical?.remove();
      return;
    }
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', new URL(page.path, this.document.location.origin).href);
  }
}
