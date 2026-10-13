import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Button } from '../button/button';

/** The chosen file as the page describes it; the page formats the size ("1.2 MB"). */
export interface FileUploadFile {
  name: string;
  size: string;
  previewUrl?: string;
}

/**
 * A drop zone with a "Choose a photo" button for one file, showing the chosen file, its upload
 * progress or why it was refused. It checks nothing itself: the page validates and uploads (L2-008).
 */
@Component({
  selector: 'bn-file-upload',
  imports: [Button],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUpload {
  readonly label = input.required<string>();
  readonly controlId = input.required<string>();
  readonly accept = input('');
  readonly chooseLabel = input.required<string>();
  readonly chooseAgainLabel = input.required<string>();
  readonly help = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly file = input<FileUploadFile | null>(null);
  readonly previewAlt = input('');
  readonly busy = input(false, { transform: booleanAttribute });
  readonly progress = input<number | null>(null);
  readonly progressLabel = input('');
  readonly removeLabel = input<string | null>(null);
  /** Hides the choose control while the dialog offers "Try again" (the failed state). */
  readonly chooseHidden = input(false, { transform: booleanAttribute });

  readonly fileChosen = output<File>();
  readonly removed = output<void>();

  protected readonly over = signal(false);
  protected readonly labelId = computed(() => `${this.controlId()}-label`);
  protected readonly helpId = computed(() => `${this.controlId()}-help`);
  protected readonly errorId = computed(() => `${this.controlId()}-err`);
  protected readonly describedBy = computed(() =>
    [this.help() ? this.helpId() : null, this.error() ? this.errorId() : null]
      .filter(Boolean)
      .join(' '),
  );

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  /** Moves focus to the choose control, as after an invalid file. */
  focusChooser(): void {
    this.inputRef()?.nativeElement.focus();
  }

  protected picked(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    // Cleared so choosing the same file again still reports it.
    target.value = '';
    if (file && !this.busy()) this.fileChosen.emit(file);
  }

  protected dragOver(event: DragEvent): void {
    if (this.busy()) return;
    event.preventDefault();
    this.over.set(true);
  }

  protected dropped(event: DragEvent): void {
    event.preventDefault();
    this.over.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && !this.busy()) this.fileChosen.emit(file);
  }
}
