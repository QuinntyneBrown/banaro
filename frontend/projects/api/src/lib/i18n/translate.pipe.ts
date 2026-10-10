import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationParams, TranslationService } from './translation.service';

/** `{{ key | t: params }}` — every user-facing string comes through this pipe (L2-052). */
@Pipe({ name: 't' })
export class TranslatePipe implements PipeTransform {
  private readonly translations = inject(TranslationService);

  transform(key: string, params?: TranslationParams): string {
    return this.translations.t(key, params);
  }
}
