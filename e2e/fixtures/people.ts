/** A unique address per test run, so tests never collide on the unique e-mail index. */
export function uniqueEmail(name = 'amara'): string {
  return `${name}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@harvest.example`;
}

export const STRONG_PASSWORD = 'harvest-volunteers-2026';
