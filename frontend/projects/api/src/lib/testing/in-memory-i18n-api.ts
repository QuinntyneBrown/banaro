import { Observable, of } from 'rxjs';
import { Catalogue, I18nApi } from '../i18n/i18n-api';

/** Fake of the contract for tests: `{ provide: I18N_API, useValue: new InMemoryI18nApi({...}) }`. */
export class InMemoryI18nApi implements I18nApi {
  constructor(private readonly texts: Catalogue = {}) {}

  catalogue(): Observable<Catalogue> {
    return of(this.texts);
  }
}
