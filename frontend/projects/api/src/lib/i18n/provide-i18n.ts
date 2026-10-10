import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { TranslationService } from './translation.service';

/** Loads the locale's catalogue before the first render, on the server and in the browser. */
export function provideI18n(locale: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => inject(TranslationService).load(locale)),
  ]);
}
