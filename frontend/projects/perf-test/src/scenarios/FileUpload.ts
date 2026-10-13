import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FileUpload } from 'components';

/** The invalid photo upload from docs/mocks/dialogs/change-photo/invalid. */
@Component({
  selector: 'bn-file-upload-scenario',
  imports: [FileUpload],
  template: `
    <bn-file-upload
      controlId="photo-file"
      accept="image/jpeg,image/png,image/webp"
      label="New photo"
      chooseLabel="Choose a photo"
      chooseAgainLabel="Choose a different photo"
      help="JPG, PNG or WebP, up to 5 MB. Square photos look best."
      error="That file is a HEIC and 14.8 MB. Choose a JPG, PNG or WebP under 5 MB."
      [file]="{ name: 'team-offsite.heic', size: '14.8 MB' }"
    >
      <strong>Drop a photo here</strong> or choose one from your device.
    </bn-file-upload>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FileUploadScenario {}
