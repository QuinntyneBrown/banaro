/** What best describes a builder's role; the directory filters by it (L2-006, L2-010). */
export const BUILDER_ROLES = [
  'founder',
  'engineer',
  'designer',
  'product_manager',
  'other',
] as const;

/** Kinds of collaboration a builder is open to (L2-006 criterion 3, L2-021). */
export const OPEN_TO = ['co_founding', 'advising', 'contributing'] as const;

/** The onboarding steps, in order (L2-006). */
export const ONBOARDING_STEPS = ['about', 'skills', 'goals'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
