# File upload

| Field | Value |
|---|---|
| Selector | `bn-file-upload` |
| Library path | `frontend/projects/components/src/lib/file-upload/` |
| Status | planned |
| Traces to | L2-008, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`file-upload.html`](../../design-system/components/file-upload.html) |
| Source mocks | [`dialogs/change-photo/default`](../../mocks/dialogs/change-photo/default.html), [`dialogs/change-photo/invalid`](../../mocks/dialogs/change-photo/invalid.html), [`dialogs/change-photo/busy`](../../mocks/dialogs/change-photo/busy.html), [`dialogs/change-photo/failed`](../../mocks/dialogs/change-photo/failed.html) |
| Rendering | [`file-upload.html`](file-upload.html) |

## Purpose and scope

File upload lets Amara pick a new profile photo in the `change-photo` dialog: a dashed drop zone
that says "Drop a photo here or choose one from your device", a "Choose a photo" button that opens
the device's file chooser, and the chosen file shown by name and size ("amara-harvest-day.jpg ·
1.2 MB") with a preview, an upload progress bar, or an error ("That file is a HEIC and 14.8 MB.
Choose a JPG or PNG under 5 MB.").

The dialog around it, its "Save photo" and "Cancel" buttons and its failed alert are the
[dialog](dialog.md), [button](button.md) and [alert](alert.md). The progress line is the
[progress bar](progress-bar.md). The profile-edit row that opens the dialog ("Change photo") is
part of the profile-edit page.

Out of scope:

- Checking type, size, dimensions and content; uploading, cropping, scanning and storing (the page
  and the API, L2-008, L2-045).
- The square crop step that L2-008 requires after a file is chosen (dialog content).
- Formatting the file size; the page passes "1.2 MB".

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/change-photo/default` | label "New photo", accept JPEG/PNG (WebP per D-1), help "JPG or PNG, up to 5 MB. Square photos look best." | prompt "**Drop a photo here** or choose one from your device."; button "Choose a photo" | empty; initial focus on "Choose a photo" | dialog surface |
| `dialogs/change-photo/invalid` | same, `error` set | file row "team-offsite.heic · 14.8 MB" with danger icon tile; button "Choose a different photo"; error "That file is a HEIC and 14.8 MB. Choose a JPG or PNG under 5 MB." | invalid; focus on "Choose a different photo" | dialog surface |
| `dialogs/change-photo/busy` | `busy`, `progress` 60 | file row with 64 px preview "Preview of your new photo", "amara-harvest-day.jpg · 1.2 MB"; progress "Uploading photo" | busy | dialog surface |
| `dialogs/change-photo/failed` | file set, not busy | file row with preview; help shown | failed (the alert above it says why) | dialog surface |
| design-system "file list" | file set, `removeLabel` "Remove photo" | "amara-profile.jpg · Ready to upload", "Remove photo" | selected | dialog surface |

## Anatomy

1. **Field** — `div.field` with the group label `span.field__label` "New photo".
2. **Drop zone** — `div.dropzone`, `role="group"` labelled by the field label. Dashed
   `--color-border-strong` rule, `--color-bg-subtle` fill, centred grid.
3. **Prompt icon** — `span.empty__icon` with the photo `svg.icon`, `aria-hidden="true"` (empty
   state).
4. **Prompt** — `p` with the projected prompt.
5. **File row** — `div.dropzone__file`: a 64 px preview `img` (or an error icon tile
   `span.empty__icon.empty--error`), then `p.rows__title` name and `p.rows__meta` size.
6. **Choose button** — `label.btn.btn--quiet[for]`, the visible control for the hidden input.
7. **File input** — `input.vh[type=file]`, keyboard-focusable through its label button.
8. **Remove button (optional)** — `button.btn.btn--quiet` "Remove photo".
9. **Progress (busy)** — `div.progress[role=progressbar]` after the drop zone.
10. **Help** — `p.field__help`; **Error** — `p.field__error` with icon.

Host: `bn-file-upload` is `display: block`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Group label, "New photo". |
| `controlId` | `string` | — | yes | Id of the file input; help is `{id}-help`, error `{id}-err`. |
| `accept` | `string` | `''` | no | Passed to the input's `accept`. The photo dialog passes `image/jpeg,image/png,image/webp`. |
| `chooseLabel` | `string` | — | yes | Button label when no file or a valid file: "Choose a photo". |
| `chooseAgainLabel` | `string` | — | yes | Button label in the invalid state: "Choose a different photo". |
| `help` | `string \| null` | `null` | no | Formats, size and what happens next. |
| `error` | `string \| null` | `null` | no | Sets the invalid state and renders `p.field__error`. |
| `file` | `{ name: string; size: string; previewUrl?: string } \| null` | `null` | no | Renders the file row; `previewUrl` shows a 64 × 64 preview. |
| `previewAlt` | `string` | `''` | no | Alt text for the preview, "Preview of your new photo". |
| `busy` | `boolean` | `false` | no | Uploading: hides the choose and remove buttons, shows the progress bar. |
| `progress` | `number \| null` | `null` | no | 0–100 while busy; `null` renders an indeterminate bar (`aria-busy="true"`). |
| `progressLabel` | `string` | — | yes when `busy` | Progress bar name, "Uploading photo". |
| `removeLabel` | `string \| null` | `null` | no | Shows a "Remove photo" button with a valid file. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `fileChosen` | `File` | A file is picked in the chooser or dropped on the zone (first file only). Not emitted while busy. |
| `removed` | `void` | "Remove photo" is activated. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | inline text with one `strong` | The prompt, shown only in the empty state. |

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Drop zone | `.dropzone` with icon, prompt and choose button | Empty state. |
| Button | the choose `label.btn` | Always present when not busy; the zone is never the only control. |
| File list | `.dropzone__file` row | A chosen, invalid, uploading or failed file. |

One size; the zone fills the dialog body. The preview is `--space-16` square.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Empty | no `file` | Photo icon tile, prompt, "Choose a photo" | Group "New photo"; button described by help |
| Drag over | a file dragged over the zone | `.dropzone--over`: rule and fill switch to `--color-accent` / `--color-accent-subtle` | — |
| Choose focus | `:focus-visible` on the input | Ring drawn on the label button (`:has(+ input:focus-visible)`) | "Choose a photo, button" with help |
| Choose hover, active | pointer on the label | Quiet button hover and active fills | — |
| Selected | `file`, no error, not busy | File row with preview; choose button; optional "Remove photo" | Name and size read as text |
| Invalid | `error` set | `aria-invalid="true"` on zone and input; zone `--color-danger-solid` rule, `--color-danger-bg` fill; danger icon tile; "Choose a different photo"; field error | Input described by help and error |
| Busy | `busy` | File row with preview; no buttons; progress bar below the zone at `progress` % | `role="progressbar"` named "Uploading photo" with `aria-valuenow` |
| Failed | page state: `file` set, `busy` false, alert above | File row with preview; help shown; no choose button while the dialog offers "Try again" | Alert announces the failure |
| Disabled | — | None: while busy the controls are removed, not disabled | — |

## Markup

```html
<!-- rendered: empty -->
<div class="field">
  <span class="field__label" id="photo-file-label">New photo</span>
  <div class="dropzone" role="group" aria-labelledby="photo-file-label">
    <span class="empty__icon"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4.5 4.5"/></svg></span>
    <p><strong>Drop a photo here</strong> or choose one from your device.</p>
    <label class="btn btn--quiet" for="photo-file">Choose a photo</label>
    <input class="vh" id="photo-file" name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-file-help">
  </div>
  <p class="field__help" id="photo-file-help">JPG, PNG or WebP, up to 5 MB. Square photos look best.</p>
</div>
```

```html
<!-- rendered: invalid -->
<div class="dropzone" role="group" aria-labelledby="photo-file-label" aria-invalid="true">
  <div class="dropzone__file"><span class="empty__icon empty--error"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5M12 15.5h.01"/></svg></span><div><p class="rows__title">team-offsite.heic</p><p class="rows__meta">14.8 MB</p></div></div>
  <label class="btn btn--quiet" for="photo-file">Choose a different photo</label>
  <input class="vh" id="photo-file" name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-invalid="true" aria-describedby="photo-file-help photo-file-err">
</div>
<p class="field__help" id="photo-file-help">…</p>
<p class="field__error" id="photo-file-err"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg><span>That file is a HEIC and 14.8 MB. Choose a JPG or PNG under 5 MB.</span></p>
```

```html
<!-- rendered: busy -->
<div class="dropzone" role="group" aria-labelledby="photo-file-label">
  <div class="dropzone__file"><img src="…" width="64" height="64" alt="Preview of your new photo"><div><p class="rows__title">amara-harvest-day.jpg</p><p class="rows__meta">1.2 MB</p></div></div>
</div>
<div class="progress" role="progressbar" aria-label="Uploading photo" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"><div class="progress__bar" style="width: 60%"></div></div>
```

The failed state is the busy markup without the progress bar and with the help line; the
selected state adds the choose label and input, and the "Remove photo" button when
`removeLabel` is set.

```html
<!-- consumer -->
<bn-file-upload controlId="photo-file" accept="image/jpeg,image/png,image/webp"
  [label]="'photo.label' | t" [chooseLabel]="'photo.choose' | t" [chooseAgainLabel]="'photo.chooseAgain' | t"
  [help]="'photo.help' | t" [error]="error()" [file]="file()" [previewAlt]="'photo.previewAlt' | t"
  [busy]="uploading()" [progress]="progress()" [progressLabel]="'photo.uploading' | t"
  (fileChosen)="check($event)">
  <strong>{{ 'photo.drop' | t }}</strong> {{ 'photo.dropRest' | t }}
</bn-file-upload>
```

## Design

- Drop zone: grid, `justify-items: center`, gap `--space-3`, padding `--space-10` / `--space-6`,
  centred text, dashed `--border-width-hairline` rule, radius `--radius-lg`.
- File row: flex, gap `--space-4`, left-aligned; preview `--space-16` square, radius
  `--radius-md`, `object-fit: cover`.
- Name `--text-h4` (`.rows__title`), size `--text-body-sm` (`.rows__meta`).
- Icon tile as the empty-state tile; the error tile uses `--color-danger-bg` and
  `--color-danger-icon` (`.empty--error`).
- Progress: `--space-2` tall, full radius, `--color-border-default` track, `--color-accent` bar;
  width set by the progress bar from `progress`.
- Motion: none of its own; the progress width changes without animation.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Zone fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Zone rule | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Prompt text | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Invalid rule | `--color-danger-solid` | `--palette-lingon-600` | `--palette-lingon-300` |
| Invalid fill | `--color-danger-bg` | `--palette-lingon-100` | `--palette-lingon-950` |
| Error icon | `--color-danger-icon` | `--palette-lingon-600` | `--palette-lingon-300` |
| Error text | `--color-danger-fg` | `--palette-lingon-700` | `--palette-lingon-300` |
| Drag-over rule / fill | `--color-accent` / `--color-accent-subtle` | `--palette-sage-600` / `--palette-sage-50` | `--palette-sage-300` / `--palette-sage-950` |
| Progress track / bar | `--color-border-default` / `--color-accent` | `--palette-oat-300` / `--palette-sage-600` | `--palette-night-700` / `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-subtle` | 4.5:1 | Prompt and size |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | File name |
| `--color-fg-default` | `--color-danger-bg` | 4.5:1 | File name when invalid |
| `--color-danger-icon` | `--color-danger-bg` | 3:1 | Error icon |
| `--color-danger-fg` | `--color-bg-surface` | 4.5:1 | Field error |
| `--color-focus-ring` | `--color-bg-subtle` | 3:1 | Focus on the choose button |

## Responsive behaviour

- The layout does not change across breakpoints; inside the bottom-sheet dialog at 360 px the
  zone fills the width and long file names wrap (`overflow-wrap: anywhere`).
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; the
  choose and remove buttons are at least 44 × 44 CSS px.
- Dragging is never required: the choose button works on touch and keyboard (WCAG 2.5.7).

## Accessibility

### Role and pattern

A native `input type="file"` with a visible `label` styled as a button; the zone is a group named
by the field label. The progress line is a native-pattern `progressbar`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Reaches the file input (its label shows the ring), then "Remove photo" when present. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Opens the device's file chooser. |

### Focus

The dialog puts initial focus on the choose control. After an invalid file, the page returns
focus to the choose control ("Choose a different photo"). While busy the controls are removed;
focus stays on the dialog's "Cancel", which aborts the upload.

### Labelling

The input is named by its label button text and described by the help and, when invalid, the
error (`aria-describedby="{id}-help {id}-err"`). The preview has alt "Preview of your new photo".
Icons are hidden.

### Announcements

The invalid state is announced through focus: the page moves focus to "Choose a different photo",
whose description includes the error. No separate live region, so the error is not read twice.
Progress is exposed through `aria-valuenow` and not announced on every change; the dialog
announces completion or failure.

### Motion

None.

## Content and internationalisation

- State formats, maximum size and what happens next: "JPG, PNG or WebP, up to 5 MB. Square
  photos look best."
- The error names the problem and the fix: "That file is a HEIC and 14.8 MB. Choose a JPG or PNG
  under 5 MB."
- Never claim success while the file is still scanning (design-system rule); the dialog shows
  "Uploading…" until the server confirms.
- Sizes use one decimal with "MB": "1.2 MB", "14.8 MB", formatted by the page.
- Translatable inputs and slots: `label`, `chooseLabel`, `chooseAgainLabel`, `help`, `error`,
  `previewAlt`, `progressLabel`, `removeLabel`, the prompt. Data values: the file name and size.

## Performance

- Change detection: `OnPush`, signal inputs; the state (empty, selected, invalid, busy) is one
  `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/FileUpload.ts` renders the
  change-photo drop zone in its busy state with "amara-harvest-day.jpg · 1.2 MB" at 60 %;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `DarkTheme` gains the empty drop zone.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf
  test against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: the preview `img` declares `width="64" height="64"` so the row never jumps
  when it loads (L2-048).
- Weight: no file-handling libraries; it reads `File` from the native input and the drop event.

## Acceptance criteria

### Rendering

- **AC-1** Given the `change-photo` dialog opens, when the file upload renders, then it shows a `div.dropzone` grouped under "New photo" with "Drop a photo here or choose one from your device.", a "Choose a photo" control and the help line. (L2-008)
- **AC-2** Given the photo dialog, when the input renders, then its `accept` lists `image/jpeg`, `image/png` and `image/webp`. (L2-008)

### States

- **AC-3** Given Amara chooses "amara-harvest-day.jpg", when the input changes, then `fileChosen` emits that `File` once. (L2-008)
- **AC-4** Given Amara drops "amara-harvest-day.jpg" on the zone, when the drop completes, then `fileChosen` emits the first dropped file and the zone leaves its drag-over look. (L2-008)
- **AC-5** Given the page rejects "team-offsite.heic" at 14.8 MB, when it sets `error`, then the zone and input have `aria-invalid="true"`, the file row shows the danger icon tile with "team-offsite.heic" and "14.8 MB", the button reads "Choose a different photo", and the error reads "That file is a HEIC and 14.8 MB. Choose a JPG or PNG under 5 MB." (L2-008)
- **AC-6** Given an upload at 60 %, when `busy` is set, then the row shows the 64 × 64 preview, the choose button is gone, and a progress bar named "Uploading photo" has `aria-valuenow="60"`. (L2-008)
- **AC-7** Given the upload failed, when the dialog shows its failed state, then the file row keeps "amara-harvest-day.jpg" and its preview so "Try again" can resend it without choosing again. (L2-008)
- **AC-8** Given Amara has a valid photo chosen and `removeLabel` is "Remove photo", when she activates it, then `removed` is emitted once. (L2-008)

### Keyboard and focus

- **AC-9** Given the dialog has opened, when Amara presses Tab to reach the choose control and presses Enter, then the device file chooser opens, and the focused control shows a 2 px `--color-focus-ring` with at least 3:1 contrast against the zone. (L2-050)
- **AC-10** Given an invalid file was chosen, when the error appears, then focus is on "Choose a different photo". (L2-050)

### Screen readers

- **AC-11** Given the invalid state, when a screen reader focuses the input, then it reads "Choose a different photo" followed by the help and the error text. (L2-050)
- **AC-12** Given the en-CA catalogue, when the component renders, then the prompt, labels, help and error come from the catalogue and the size reads "14.8 MB". (L2-052)

### Theming

- **AC-13** Given the dark theme, when the zone renders empty and invalid, then its colours change through tokens only, the prompt keeps at least 4.5:1 on the zone fill, and the error text at least 4.5:1. (L2-051)

### Responsive

- **AC-14** Given a 360 px viewport with the dialog as a bottom sheet, when a file named "amara-harvest-day-with-the-whole-food-bank-team.jpg" is shown, then the name wraps, the choose button is at least 44 × 44 CSS px, and nothing scrolls horizontally. (L2-049)

### Performance

- **AC-15** Given the `FileUpload` perf-test scenario, when the perf test runs against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)
- **AC-16** Given the busy state, when the preview image loads, then the file row does not change size because the image declares its 64 × 64 dimensions. (L2-048)

## Implementation notes

- New folder `frontend/projects/components/src/lib/file-upload/` with `file-upload.ts`
  (`bn-file-upload`, class `FileUpload`) and `file-upload.css` copied from `.dropzone`,
  `.dropzone__file`, `.dropzone[aria-invalid]`, `.dropzone input[type="file"]`, `.empty__icon`,
  `.empty--error`, `.rows__title` and `.rows__meta`, plus the component-scoped `.dropzone--over`
  and the label focus rule. Export from `public-api.ts`.
- Composes `bn-progress-bar` for the progress line and reuses `bn-field-error` for the error.
- Keep the hidden input hidden: `components.css` gives `.dropzone input[type="file"]` `width: 100%`,
  which overrides `.vh`'s width and pushes the absolutely positioned input past the page edge
  (the CRD rendering overflowed until clipped). The component's CSS gives `.dropzone`
  `position: relative` and keeps `.vh` sizing on the input (D-7).
- Drop handling: `dragenter`/`dragover` (prevent default, set over), `dragleave`, `drop` (emit
  `dataTransfer.files[0]`); ignore all of them while busy.
- Add `FileUpload.ts` and export it from `src/scenarios/index.ts` in the same change.

## Decisions

- **D-1** *L2-008 accepts JPEG, PNG and WebP; the mocks say "JPG or PNG" and accept only
  `image/jpeg,image/png`.* L2 wins: the dialog passes WebP in `accept` and the help reads "JPG,
  PNG or WebP, up to 5 MB." Raised to the lead so the mock copy can catch up.
- **D-2** *The mock's "New photo" is a `span` not tied to anything.* The zone gets
  `role="group"` and `aria-labelledby` the span, so the group has a name; the input keeps the
  button text as its own name.
- **D-3** *What does drag-over look like? Neither source shows it.* A component-scoped
  `.dropzone--over` with `--color-accent` rule and `--color-accent-subtle` fill, the same sage
  language as a pressed chip. The design system should add it.
- **D-4** *What is shown in the failed state?* What the mock shows: the file row with preview and
  the help line, no choose button; the dialog's "Try again" resends the same file and its alert
  explains the failure.
- **D-5** *Where is "Remove photo" (L2-008 AC5)?* Optional through `removeLabel`, shown with a
  valid file as in the design system's file-list variant. The change-photo mocks do not show it,
  so the dialog decides whether to pass it.
- **D-6** *The mock sets the bar width inline. Who owns that mechanism?* The
  [progress bar](progress-bar.md); this component only passes `progress`, and the rendered
  markup above shows the resulting width.
- **D-7** *The design system's `.dropzone input[type="file"] { width: 100% }` rule widens the
  visually hidden input and causes horizontal overflow.* The component keeps the input at the
  `.vh` size and makes the zone `position: relative`; the design-system rule only applies to a
  visible input. Raised to the lead as a design-system defect.
