import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  BuilderRole,
  Neighbourhood,
  OnboardingAbout,
  OnboardingGoals,
  OnboardingProgress,
  OnboardingStep,
  OpenTo,
  SkillEntry,
  SkillRef,
} from '../models/profiles';

export interface ProfilesApi {
  getOnboarding(): Observable<OnboardingProgress>;
  saveOnboardingAbout(about: OnboardingAbout): Observable<OnboardingProgress>;
  saveOnboardingSkills(skills: SkillEntry[]): Observable<OnboardingProgress>;
  saveOnboardingGoals(goals: OnboardingGoals): Observable<OnboardingProgress>;
  completeOnboarding(): Observable<OnboardingProgress>;
}

export const PROFILES_API = new InjectionToken<ProfilesApi>('PROFILES_API');

interface OnboardingBody {
  next_step: OnboardingStep | 'finish';
  completed: boolean;
  about: { name: string; neighbourhood_id: number | null; role: BuilderRole | null };
  skills: SkillRef[];
  goals: { open_to: OpenTo[]; building: string | null };
  roles: BuilderRole[];
  neighbourhoods: Neighbourhood[];
  skill_catalogue: SkillRef[];
}

function toProgress(body: OnboardingBody): OnboardingProgress {
  return {
    nextStep: body.next_step,
    completed: body.completed,
    about: {
      name: body.about.name,
      neighbourhoodId: body.about.neighbourhood_id,
      role: body.about.role,
    },
    skills: body.skills,
    goals: { openTo: body.goals.open_to, building: body.goals.building },
    roles: body.roles,
    neighbourhoods: body.neighbourhoods,
    skillCatalogue: body.skill_catalogue,
  };
}

@Injectable()
export class HttpProfilesApi implements ProfilesApi {
  private readonly http = inject(HttpClient);

  getOnboarding(): Observable<OnboardingProgress> {
    return this.http.get<OnboardingBody>('/api/v1/me/onboarding').pipe(map(toProgress));
  }

  saveOnboardingAbout(about: OnboardingAbout): Observable<OnboardingProgress> {
    return this.http
      .put<OnboardingBody>('/api/v1/me/onboarding/about', {
        name: about.name,
        neighbourhood_id: about.neighbourhoodId,
        role: about.role,
      })
      .pipe(map(toProgress));
  }

  saveOnboardingSkills(skills: SkillEntry[]): Observable<OnboardingProgress> {
    return this.http
      .put<OnboardingBody>('/api/v1/me/onboarding/skills', { skills })
      .pipe(map(toProgress));
  }

  saveOnboardingGoals(goals: OnboardingGoals): Observable<OnboardingProgress> {
    return this.http
      .put<OnboardingBody>('/api/v1/me/onboarding/goals', {
        open_to: goals.openTo,
        building: goals.building,
      })
      .pipe(map(toProgress));
  }

  completeOnboarding(): Observable<OnboardingProgress> {
    return this.http
      .post<OnboardingBody>('/api/v1/me/onboarding/complete', {})
      .pipe(map(toProgress));
  }
}
