import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { SessionStore } from './session-store';

/** Loads the current session before the first render, so the header and guards know the member. */
export function provideSession(): EnvironmentProviders {
  return provideAppInitializer(() => inject(SessionStore).load());
}
