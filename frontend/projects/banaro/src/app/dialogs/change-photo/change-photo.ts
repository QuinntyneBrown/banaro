import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import {
  formatFileSize,
  PhotoCrop,
  PROFILES_API,
  ProfilePhoto,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import { Alert, Button, Dialog, FileUpload, FileUploadFile } from 'components';
import {
  exhaustMap,
  filter,
  first,
  map,
  Observable,
  Subscription,
  switchMap,
  take,
  timer,
} from 'rxjs';
import { PhotoFileCheck } from '../../shared/photo-file-check';

type State = 'default' | 'invalid' | 'busy' | 'failed';

/** Polls for the scan every second and gives up after 30 s (D-039). */
const POLL_MS = 1000;
const POLL_LIMIT = 30;

export interface ChangePhotoData {
  hasPhoto: boolean;
}

/** Closes with the new photo URL, `null` after "Remove photo", or nothing when cancelled. */
export interface ChangePhotoResult {
  photoUrl: string | null;
}

interface Chosen {
  file: File;
  view: FileUploadFile;
  crop: PhotoCrop | null;
}

/**
 * Choose, upload and scan a new profile photo, or remove the current one (L2-008). Busy uploads
 * ignore Escape and the backdrop; "Cancel" aborts. The API decides; the browser check is for speed.
 */
@Component({
  selector: 'bn-change-photo-dialog',
  imports: [Alert, Button, Dialog, FileUpload, TranslatePipe],
  templateUrl: './change-photo.html',
  // "Remove photo" sits apart from the save and cancel actions (D-040).
  styles: '.change-photo__remove { margin-inline-end: auto; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePhotoDialog {
  private readonly ref = inject<DialogRef<ChangePhotoResult>>(DialogRef);
  private readonly data = inject<ChangePhotoData>(DIALOG_DATA);
  private readonly api = inject(PROFILES_API);
  private readonly checker = inject(PhotoFileCheck);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);

  protected readonly controlId = `${this.ref.id}-file`;
  protected readonly state = signal<State>('default');
  protected readonly chosen = signal<Chosen | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly progress = signal<number | null>(null);
  protected readonly alert = signal<{ title: string; body: string } | null>(null);
  protected readonly removing = signal(false);
  protected readonly canSave = computed(
    () => !!this.chosen()?.crop && this.state() !== 'invalid' && this.state() !== 'busy',
  );
  protected readonly canRemove = computed(
    () => this.data.hasPhoto && !this.chosen() && this.state() === 'default',
  );

  private readonly upload = viewChild.required(FileUpload);
  private work?: Subscription;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.work?.unsubscribe();
      this.revokePreview();
    });
  }

  protected async choose(file: File): Promise<void> {
    this.revokePreview();
    this.alert.set(null);
    const result = await this.checker.check(file);
    const view: FileUploadFile = { name: file.name, size: formatFileSize(file.size) };
    if (result.ok) {
      view.previewUrl = URL.createObjectURL(file);
      this.chosen.set({ file, view, crop: result.crop });
      this.error.set(null);
      this.state.set('default');
    } else {
      this.chosen.set({ file, view, crop: null });
      this.invalid(result.problem);
    }
  }

  protected save(): void {
    const chosen = this.chosen();
    if (!chosen?.crop || !this.canSave()) return;
    this.alert.set(null);
    this.progress.set(0);
    this.state.set('busy');
    this.work = this.api
      .uploadPhoto(chosen.file, chosen.crop)
      .pipe(
        map((event) => {
          if (event.kind === 'progress') this.progress.set(event.percent);
          return event;
        }),
        filter((event) => event.kind === 'accepted'),
        switchMap((event) => {
          // Uploaded; the progress bar turns indeterminate while the scan runs.
          this.progress.set(null);
          return this.waitForScan(event.photo.id);
        }),
      )
      .subscribe({
        next: (photo) => this.scanned(photo),
        error: (error: unknown) => this.uploadFailed(error),
      });
  }

  protected remove(): void {
    this.removing.set(true);
    this.alert.set(null);
    this.api.removePhoto().subscribe({
      next: () => this.ref.close({ photoUrl: null }),
      error: () => {
        this.removing.set(false);
        this.alert.set({
          title: this.i18n.t('profiles.photo.removeFailed.title'),
          body: this.i18n.t('profiles.photo.removeFailed.body'),
        });
      },
    });
  }

  /** "Cancel" stays available while busy and aborts the upload. */
  protected cancel(): void {
    this.work?.unsubscribe();
    this.ref.close();
  }

  /** Polls until the scan decides; still pending after the last poll errors, so it can be retried. */
  private waitForScan(id: string): Observable<ProfilePhoto> {
    return timer(POLL_MS, POLL_MS).pipe(
      take(POLL_LIMIT),
      exhaustMap(() => this.api.getPhoto(id)),
      first((photo) => photo.status !== 'pending'),
    );
  }

  private scanned(photo: ProfilePhoto): void {
    if (photo.status === 'ready') {
      this.ref.close({ photoUrl: photo.url });
      return;
    }
    this.invalid(this.i18n.t('profiles.photo.rejected'));
  }

  private uploadFailed(error: unknown): void {
    const failure = toApiError(error);
    if (failure.kind === 'validation') {
      const problem = failure.fields['photo'] ?? failure.fields['crop'];
      if (problem) {
        this.invalid(problem);
        return;
      }
    }
    this.progress.set(null);
    this.alert.set({
      title: this.i18n.t('profiles.photo.failed.title'),
      body: this.i18n.t('profiles.photo.failed.body'),
    });
    this.state.set('failed');
  }

  private invalid(problem: string): void {
    this.progress.set(null);
    this.error.set(problem);
    this.state.set('invalid');
    afterNextRender(() => this.upload().focusChooser(), { injector: this.injector });
  }

  private revokePreview(): void {
    const url = this.chosen()?.view.previewUrl;
    if (url) URL.revokeObjectURL(url);
  }
}
