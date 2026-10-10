import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  BuilderRole,
  ExperienceEntry,
  Neighbourhood,
  OnboardingAbout,
  OnboardingGoals,
  OnboardingProgress,
  OnboardingStep,
  OpenTo,
  OwnProfile,
  ProfileLink,
  ProfileUpdate,
  SkillEntry,
  SkillRef,
} from '../models/profiles';

export interface ProfilesApi {
  getOnboarding(): Observable<OnboardingProgress>;
  saveOnboardingAbout(about: OnboardingAbout): Observable<OnboardingProgress>;
  saveOnboardingSkills(skills: SkillEntry[]): Observable<OnboardingProgress>;
  saveOnboardingGoals(goals: OnboardingGoals): Observable<OnboardingProgress>;
  completeOnboarding(): Observable<OnboardingProgress>;
  getOwnProfile(): Observable<OwnProfile>;
  updateOwnProfile(update: ProfileUpdate): Observable<OwnProfile>;
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

interface OwnProfileBody {
  id: string;
  name: string;
  headline: string | null;
  neighbourhood_id: number | null;
  bio: string | null;
  photo_url: string | null;
  skills: SkillRef[];
  experience: {
    title: string;
    organization: string | null;
    started_on: string;
    ended_on: string | null;
  }[];
  links: ProfileLink[];
  open_to: OpenTo[];
  looking_for: string | null;
  building: string | null;
  neighbourhoods: Neighbourhood[];
}

function toOwnProfile(body: OwnProfileBody): OwnProfile {
  return {
    id: body.id,
    name: body.name,
    headline: body.headline,
    neighbourhoodId: body.neighbourhood_id,
    bio: body.bio,
    photoUrl: body.photo_url,
    skills: body.skills,
    experience: body.experience.map((e): ExperienceEntry => ({
      title: e.title,
      organization: e.organization,
      startedOn: e.started_on,
      endedOn: e.ended_on,
    })),
    links: body.links,
    openTo: body.open_to,
    lookingFor: body.looking_for,
    building: body.building,
    neighbourhoods: body.neighbourhoods,
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

  getOwnProfile(): Observable<OwnProfile> {
    return this.http.get<OwnProfileBody>('/api/v1/me/profile').pipe(map(toOwnProfile));
  }

  updateOwnProfile(update: ProfileUpdate): Observable<OwnProfile> {
    return this.http
      .put<OwnProfileBody>('/api/v1/me/profile', {
        name: update.name,
        headline: update.headline,
        neighbourhood_id: update.neighbourhoodId,
        bio: update.bio,
        skills: update.skills,
        experience: update.experience.map((e) => ({
          title: e.title,
          organization: e.organization,
          started_on: e.startedOn,
          ended_on: e.endedOn,
        })),
        links: update.links,
        open_to: update.openTo,
        looking_for: update.lookingFor,
        building: update.building,
      })
      .pipe(map(toOwnProfile));
  }
}
