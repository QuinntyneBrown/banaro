/** True when the error, or the database error Drizzle wrapped, is a unique-key violation. */
export function isUniqueViolation(error: unknown): boolean {
  const code = (value: unknown) => (value as { code?: string } | undefined)?.code;
  return code(error) === '23505' || code((error as { cause?: unknown })?.cause) === '23505';
}
