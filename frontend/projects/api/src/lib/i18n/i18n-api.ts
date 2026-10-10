import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/** Flat map of translation keys to texts, as served by `GET /api/v1/i18n/{locale}`. */
export type Catalogue = Record<string, string>;

export interface I18nApi {
  catalogue(locale: string): Observable<Catalogue>;
}

export const I18N_API = new InjectionToken<I18nApi>('I18N_API');

@Injectable()
export class HttpI18nApi implements I18nApi {
  private readonly http = inject(HttpClient);

  catalogue(locale: string): Observable<Catalogue> {
    return this.http.get<Catalogue>(`/api/v1/i18n/${encodeURIComponent(locale)}`);
  }
}
