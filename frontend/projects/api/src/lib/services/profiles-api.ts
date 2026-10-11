import { HttpClient, HttpEventType } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { filter, map, Observable } from 'rxjs';
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
  PhotoCrop,
  PhotoUploadEvent,
  ProfileLink,
  ProfilePhoto,
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
  /** Sends the original file with the crop; the API crops, re-encodes and queues the scan. */
  uploadPhoto(file: File, crop: PhotoCrop): Observable<PhotoUploadEvent>;
  getPhoto(id: string): Observable<ProfilePhoto>;
  removePhoto(): Observable<void>;
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

  uploadPhoto(file: File, crop: PhotoCrop): Observable<PhotoUploadEvent> {
    const body = new FormData();
    body.append('photo', file, file.name);
    body.append('crop[x]', String(crop.x));
    body.append('crop[y]', String(crop.y));
    body.append('crop[size]', String(crop.size));
    return this.http
      .post<ProfilePhoto>('/api/v1/me/photo', body, { observe: 'events', reportProgress: true })
      .pipe(
        filter(
          (event) =>
            event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response,
        ),
        map((event): PhotoUploadEvent => {
          if (event.type === HttpEventType.Response) {
            return { kind: 'accepted', photo: event.body as ProfilePhoto };
          }
          const total = event.type === HttpEventType.UploadProgress ? (event.total ?? 0) : 0;
          const loaded = event.type === HttpEventType.UploadProgress ? event.loaded : 0;
          return { kind: 'progress', percent: total ? Math.round((loaded / total) * 100) : 0 };
        }),
      );
  }

  getPhoto(id: string): Observable<ProfilePhoto> {
    return this.http.get<ProfilePhoto>(`/api/v1/me/photo/${encodeURIComponent(id)}`);
  }

  removePhoto(): Observable<void> {
    return this.http.delete<void>('/api/v1/me/photo');
  }
}
