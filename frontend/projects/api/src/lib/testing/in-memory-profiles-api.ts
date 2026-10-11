import { Observable, of } from 'rxjs';
import {
  OnboardingAbout,
  OnboardingGoals,
  OnboardingProgress,
  OnboardingStep,
  OwnProfile,
  PhotoCrop,
  PhotoUploadEvent,
  ProfilePhoto,
  ProfileUpdate,
  SkillEntry,
} from '../models/profiles';
import { ProfilesApi } from '../services/profiles-api';

const STEPS: OnboardingStep[] = ['about', 'skills', 'goals'];

/** Fake of the contract for tests: keeps one member's onboarding in memory. */
export class InMemoryProfilesApi implements ProfilesApi {
  readonly saved = new Set<OnboardingStep>();
  progress: OnboardingProgress = {
    nextStep: 'about',
    completed: false,
    about: { name: '', neighbourhoodId: null, role: null },
    skills: [],
    goals: { openTo: [], building: null },
    roles: ['founder', 'engineer', 'designer', 'product_manager', 'other'],
    neighbourhoods: [{ id: 1, name: 'Leslieville', area: 'Downtown Toronto' }],
    skillCatalogue: [{ id: 1, name: 'Figma' }],
  };

  ownProfile: OwnProfile = {
    id: '01jb0000000000000000000000',
    name: 'Amara Osei',
    headline: null,
    neighbourhoodId: 1,
    bio: null,
    photoUrl: null,
    skills: [],
    experience: [],
    links: [],
    openTo: ['co_founding'],
    lookingFor: null,
    building: null,
    neighbourhoods: [{ id: 1, name: 'Leslieville', area: 'Downtown Toronto' }],
  };

  getOwnProfile(): Observable<OwnProfile> {
    return of(this.ownProfile);
  }

  updateOwnProfile(update: ProfileUpdate): Observable<OwnProfile> {
    const skills = update.skills.map((s, i) =>
      'id' in s ? { id: s.id, name: '' } : { id: 2000 + i, name: s.name },
    );
    this.ownProfile = { ...this.ownProfile, ...update, skills };
    return of(this.ownProfile);
  }

  /** Uploads are accepted and become ready at once. */
  uploadPhoto(file: File, crop: PhotoCrop): Observable<PhotoUploadEvent> {
    void crop;
    const photo: ProfilePhoto = {
      id: `photo-${file.name}`,
      status: 'ready',
      url: `/photos/${file.name}`,
    };
    this.ownProfile = { ...this.ownProfile, photoUrl: photo.url };
    return of<PhotoUploadEvent[]>({ kind: 'progress', percent: 100 }, { kind: 'accepted', photo });
  }

  getPhoto(id: string): Observable<ProfilePhoto> {
    return of({ id, status: 'ready', url: this.ownProfile.photoUrl });
  }

  removePhoto(): Observable<void> {
    this.ownProfile = { ...this.ownProfile, photoUrl: null };
    return of(undefined);
  }

  getOnboarding(): Observable<OnboardingProgress> {
    return of(this.progress);
  }

  saveOnboardingAbout(about: OnboardingAbout): Observable<OnboardingProgress> {
    return this.save('about', { about });
  }

  saveOnboardingSkills(skills: SkillEntry[]): Observable<OnboardingProgress> {
    const refs = skills.map((s, i) =>
      'id' in s
        ? (this.progress.skillCatalogue.find((c) => c.id === s.id) ?? { id: s.id, name: '' })
        : { id: 1000 + i, name: s.name },
    );
    return this.save('skills', { skills: refs });
  }

  saveOnboardingGoals(goals: OnboardingGoals): Observable<OnboardingProgress> {
    return this.save('goals', { goals });
  }

  completeOnboarding(): Observable<OnboardingProgress> {
    this.progress = { ...this.progress, completed: true };
    return of(this.progress);
  }

  private save(
    step: OnboardingStep,
    change: Partial<OnboardingProgress>,
  ): Observable<OnboardingProgress> {
    this.saved.add(step);
    const nextStep = STEPS.find((s) => !this.saved.has(s)) ?? 'finish';
    this.progress = { ...this.progress, ...change, nextStep };
    return of(this.progress);
  }
}
