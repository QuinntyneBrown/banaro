import { ChangeDetectionStrategy, Component, inject, RESPONSE_INIT } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SessionStore, TranslatePipe, TranslationService } from 'api';
import { Button, ErrorPage, SearchBox } from 'components';
import { SeoService } from '../../shared/seo.service';

/** Shown for `/404` and for any URL that matches no route, which then answers 404 (L2-042). */
@Component({
  selector: 'bn-not-found-page',
  imports: [Button, ErrorPage, RouterLink, SearchBox, TranslatePipe],
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  /** A member's way home is the dashboard; a visitor's is the home page (L2-042). */
  protected readonly signedIn = inject(SessionStore).signedIn;
  private readonly router = inject(Router);

  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) response.status = 404;
    inject(SeoService).set({
      title: inject(TranslationService).t('errors.notFound.title'),
      noindex: true,
    });
  }

  protected search(query: string): void {
    this.router.navigate(['/builders'], { queryParams: query ? { q: query } : {} });
  }
}
