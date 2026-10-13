/** How far along a project is, in L2-012's order (D-051). */
export const PROJECT_STAGES = ['idea', 'design', 'prototype', 'beta', 'pilot', 'launched'] as const;

/** The roles a project looks for, in the order pages list them (L2-012). */
export const LOOKING_FOR_ROLES = [
  'co_founder',
  'technical_co_founder',
  'contributor',
  'advisor',
  'designer',
  'engineer',
] as const;
