export type BuilderRole = 'founder' | 'engineer' | 'designer' | 'product_manager' | 'other';
export type OpenTo = 'co_founding' | 'advising' | 'contributing';
export type OnboardingStep = 'about' | 'skills' | 'goals';

export interface Neighbourhood {
  id: number;
  name: string;
  /** The directory filter group, e.g. "Downtown Toronto". */
  area: string;
}

export interface SkillRef {
  id: number;
  name: string;
}

/** A skill to save: a catalogue skill by id, or any skill by name. */
export type SkillEntry = { id: number } | { name: string };

export interface OnboardingAbout {
  name: string;
  neighbourhoodId: number | null;
  role: BuilderRole | null;
}

export interface OnboardingGoals {
  openTo: OpenTo[];
  building: string | null;
}

/** Where a member is in onboarding, with the lists the steps choose from (L2-006). */
export interface OnboardingProgress {
  nextStep: OnboardingStep | 'finish';
  completed: boolean;
  about: OnboardingAbout;
  skills: SkillRef[];
  goals: OnboardingGoals;
  roles: BuilderRole[];
  neighbourhoods: Neighbourhood[];
  skillCatalogue: SkillRef[];
}
