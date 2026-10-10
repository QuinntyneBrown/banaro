# Dialog

| Field | Value |
|---|---|
| Selector | `bn-dialog` (layout), `bn-dialog-container` (CDK container, created by `DialogService`, never written in a template), `DialogService` (injectable that opens every dialog) |
| Library path | `frontend/projects/components/src/lib/dialog/` |
| Status | planned |
| Traces to | L2-005, L2-008, L2-016, L2-020, L2-026, L2-031, L2-032, L2-038, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`dialog.html`](../../design-system/components/dialog.html), pattern [`dialogs.html`](../../design-system/patterns/dialogs.html) |
| Source mocks | [`dialogs/say-hello`](../../mocks/dialogs/say-hello/default.html), [`dialogs/pass-suggestion`](../../mocks/dialogs/pass-suggestion/default.html), [`dialogs/give-feedback`](../../mocks/dialogs/give-feedback/default.html), [`dialogs/offer-to-help`](../../mocks/dialogs/offer-to-help/default.html), [`dialogs/delete-project`](../../mocks/dialogs/delete-project/default.html), [`dialogs/cancel-rsvp`](../../mocks/dialogs/cancel-rsvp/default.html), [`dialogs/pause-matching`](../../mocks/dialogs/pause-matching/default.html), [`dialogs/report`](../../mocks/dialogs/report/default.html), [`dialogs/block-builder`](../../mocks/dialogs/block-builder/default.html), [`dialogs/change-photo`](../../mocks/dialogs/change-photo/default.html), [`dialogs/delete-account`](../../mocks/dialogs/delete-account/default.html), [`dialogs/session-expired`](../../mocks/dialogs/session-expired/default.html) and every busy, invalid, failed and success state of each |
| Rendering | [`dialog.html`](dialog.html) |

## Purpose and scope

The dialog asks a member for one focused decision or a short edit without leaving the page: say hello
to Daniel Reyes, give feedback on Psalter, cancel an RSVP to Fall Demo Night, delete Harvest, or sign
back in after a session expires. It is modal: while it is open the page behind it is inert, Tab stays
inside it, and closing it returns focus to the control that opened it. Below 576 px it is a
full-width bottom sheet; from 576 px it is a centred panel at most 32 rem wide.

Every dialog in both applications opens through `DialogService`, a wrapper around Angular CDK
`Dialog` (AGENTS.md: never hand-roll a modal). The page's own dialog component (for example
`SayHelloDialog` in `projects/banaro/src/app/dialogs/say-hello/`) renders `<bn-dialog>` for the
header, body and footer, and fills the body with fields, alerts and copy. Use something else when:

- the overlay is not modal and holds a short action group or menu, such as the account menu — use
  [popover](popover.md) (the account menu mock says "Not modal");
- the panel slides in from an edge and holds navigation or filters — use [drawer](drawer.md);
- the editing is long (a whole profile or project) — use a page (`docs/design-system/patterns/dialogs.html`);
- the message is transient feedback after an action — use a toast (L2-028).

Out of scope (owned by the page's dialog component or by sibling components):

- The fields, their validation and their messages ([text field](text-field.md), [textarea](textarea.md),
  [select](select.md), [radio group](radio-group.md), [file upload](file-upload.md), [form field](form-field.md)).
- The failed-state alert and moving focus to it ([alert](alert.md)); the dialog only hosts it in the body.
- The action buttons, their variants and their busy spinner ([button](button.md)); the dialog only lays
  them out in the footer.
- What a request does, whether Cancel aborts it, and which toast follows success.
- The opener's markup (it stays a native `<button>`; `DialogService` does not change it).

## Usage

Every dialog in `docs/mocks/dialogs/` uses the same block: `div.dialog[role=dialog][aria-modal=true]`
inside `div.backdrop`, with `dialog__header`, `dialog__body` and `dialog__footer`. No mock uses
`dialog--sm` or `dialog--lg`. The account menu (`dialogs/account-menu`) is filed under dialogs but is
not a dialog: it has no `.dialog` block and is specified by [popover](popover.md).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/say-hello` (from `directory`, L2-026) | md, accent icon (speech bubble), dismissible, form, `closableWhileBusy` | heading "Say hello to Daniel"; description "He'll get your note in his Banaro messages and an e-mail."; body `.dialog__who` (Daniel Reyes · Full-stack engineer · Mississauga · Online now) + textarea; actions Cancel (quiet) + "Send message" (primary, submit) | default (focus in the message field), busy "Sending…" (Cancel enabled, aborts), invalid (focus to the field), failed (alert after `.dialog__who`, "Try again") | dialog surface over the directory |
| `dialogs/give-feedback` (from `project-detail`, L2-016) | md, accent icon, dismissible, form, `closableWhileBusy` | heading "Give feedback on Psalter"; description; `.dialog__who` (Psalter · by Daniel Reyes · 41 comments so far); radio fieldset; textarea; Cancel + "Post feedback" | default (focus on first choice), busy "Posting…" (fields read-only), invalid, failed | dialog surface |
| `dialogs/offer-to-help` (from `project-detail`, L2-017) | md, accent icon (heart), dismissible, form, `closableWhileBusy` | heading "Offer to help with Psalter"; description; `.dialog__who`; two selects + textarea; Cancel + "Send offer" | default (focus on role select), busy "Sending…", invalid (two field errors), failed | dialog surface |
| `dialogs/pass-suggestion` (from `matching`, L2-024) | md, accent icon (person), dismissible, not closable while busy | heading "Pass on Daniel Reyes?"; no description; `.dialog__who` + paragraph; "Keep suggestion" + "Pass" (primary) | default (focus on Keep suggestion), busy (Keep suggestion disabled), failed | dialog surface |
| `dialogs/pause-matching` (from `matching`, L2-025) | md, accent icon (pause), dismissible, not closable while busy | heading "Pause matching?"; paragraph; "Keep matching" + "Pause matching" | default (focus on Keep matching), busy (Keep matching disabled), failed (alert first in body) | dialog surface |
| `dialogs/cancel-rsvp` (from `event-detail`, L2-020) | md, **danger** icon (calendar), dismissible, not closable while busy | heading "Cancel your RSVP?"; paragraph naming Fall Demo Night on Thursday 15 October; "Keep my spot" (quiet) + "Cancel RSVP" (danger) | default (focus on Keep my spot), busy (Keep my spot disabled), failed (alert first in body) | dialog surface |
| `dialogs/block-builder` (from `builder-profile`, L2-032) | md, **danger** icon, dismissible, `closableWhileBusy` (closes, request completes) | heading "Block Daniel Reyes?"; description; bullet list; muted note; Cancel + "Block Daniel" (danger) | default (focus on Cancel), busy "Blocking…", failed | dialog surface |
| `dialogs/report` (from `builder-profile`, L2-031) | md, accent icon (flag → check on success), dismissible, form, `closableWhileBusy` | heading "Report Daniel Reyes" → "Report sent"; radio fieldset of five reasons; optional textarea; Cancel + "Send report" → link "Block Daniel" (quiet `<a>`) + "Done" (primary, `type=button`) | default (focus on first reason), busy, invalid, failed, **success** (focus to heading, no description) | dialog surface |
| `dialogs/delete-project` (from `project-edit`, L2-014) | md, **danger** icon (bin), dismissible, form, `closableWhileBusy` until sent | heading "Delete Harvest?"; description; list; type-to-confirm field; "Keep project" + "Delete project" (danger, disabled until match) | default (focus in field), busy "Deleting…", invalid (as you type), failed | dialog surface |
| `dialogs/delete-account` (from `settings`, L2-038) | md, **danger** icon (bin), dismissible, form, not closable while busy | heading "Delete your account?"; description; long list; muted note; type-to-confirm field; "Keep my account" + "Delete my account" (danger) | default (focus in field), busy (all controls disabled), invalid, failed; tallest body, scrolls at 360 × 640 | dialog surface |
| `dialogs/change-photo` (from `profile-edit`, L2-008) | md, accent icon (image), dismissible, form, `closableWhileBusy` (aborts upload) | heading "Change your photo"; description; dropzone or file preview; progress bar while busy; Cancel + "Save photo" (primary, `aria-disabled` until a valid file) | default (focus on Choose a photo), busy "Uploading…", invalid (HEIC 14.8 MB), failed | dialog surface |
| `dialogs/session-expired` (from any page on 401, L2-005) | md, accent icon (lock), **not dismissible** (no ×, no Escape, no backdrop close), form, opens above any other open dialog | heading "Your session has expired"; description; read-only e-mail + password; link "Sign out" (quiet `<a>`) + "Sign back in" (primary) | default (focus in password), busy "Signing in…" (Sign out enabled), invalid (error with "reset it" link in a new tab), failed | dialog surface, stacked over the page or over another dialog |

Every row is built with the API below: one `size` (md), two icon tones, a dismissible flag, a busy
flag with `closableWhileBusy`, an optional description, a form wrapper, and three slots.

## Anatomy

1. **Backdrop** — `.backdrop` on the CDK overlay backdrop element. Fills the viewport with
   `--color-bg-backdrop` at `--z-modal`. Decorative; it carries no role.
2. **Panel** — `.dialog` on the `bn-dialog-container` host (the CDK dialog container). Carries
   `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` when there is a
   description, `aria-busy` while busy, and `tabindex="-1"`. Three grid rows: header, body, footer.
3. **Header** — `.dialog__header` (a `div`, never `<header>`). Icon, title and close control in one row.
4. **Icon (optional)** — `.dialog__icon`, plus `.dialog__icon--danger` for destructive dialogs. A
   rounded square holding one decorative `svg.icon[aria-hidden=true]`.
5. **Title** — `h2.dialog__title`, `id="{dialogId}-title"`, `tabindex="-1"`. It is the accessible name.
6. **Close control (optional)** — a small [icon button](top-bar.md#icon-button)
   (`button[bn-icon-button][size=sm]`, rendered `button.icon-btn.icon-btn--sm[type=button]`) with
   `label` from `closeLabel` ("Close dialog") and an × `svg.icon[aria-hidden=true]`. Absent when the
   dialog is not dismissible.
7. **Body** — `.dialog__body`. The only part that scrolls. Its first child is the description
   paragraph `p#{dialogId}-desc` when `description` is set; the page projects everything else.
8. **Footer** — `.dialog__footer`. The actions, safe action first and the primary or destructive
   action last, right-aligned and wrapping. A hairline rule separates it from the body.

Hosts: `bn-dialog-container` is the panel and carries the BEM block. The page's dialog component
host and the `bn-dialog` host are both `display: contents`, so the header, body and footer are grid
items of `.dialog`. When `form` is set, `bn-dialog` wraps body and footer in a
`form.dialog__form` that is also `display: contents`.

## API

### `DialogService.open(component, options)`

`open<C, D = unknown, R = unknown>(component: Type<C>, options?: DialogOptions<D>): DialogRef<R, C>`
returns the CDK `DialogRef`. The page closes the dialog with `ref.close(result)`; every dismissal
(×, Escape, backdrop) closes it with `undefined`.

| Option | Type | Default | Required | Rule |
|---|---|---|---|---|
| `data` | `D` | `undefined` | no | Passed to the content component through CDK's `DIALOG_DATA`. |
| `size` | `'sm' \| 'md'` | `'md'` | no | `md` caps the panel at `--size-dialog-max-width-27` (32 rem); `sm` adds `.dialog--sm` and caps it at `--layout-dialog-sm` (24 rem). Every product dialog uses `md`. |
| `autoFocus` | `'first-tabbable' \| 'first-heading' \| 'dialog' \| string` | `'first-tabbable'` | no | Where focus lands on open; a string is a CSS selector inside the dialog. Each dialog passes the target its mock names (see *Focus*). |
| `role` | `'dialog' \| 'alertdialog'` | `'dialog'` | no | Every mock uses `dialog`, including the destructive ones. |
| `sheetBelow` | `'SM' \| 'LG'` | `'SM'` | no | Breakpoint class below which the panel is a bottom sheet. `LG` exists for the directory filter sheet ([drawer](drawer.md)); every dialog in this CRD uses `SM`. |

Fixed configuration, not options: `hasBackdrop: true`, `backdropClass: 'backdrop'`,
`panelClass: 'bn-dialog'` (or `'bn-dialog--sheet'` below `sheetBelow`), `ariaModal: true`,
`restoreFocus: true`, `closeOnNavigation: true`, `ariaLabelledBy: '{id}-title'`, a unique `id`
(`bn-dialog-{n}`), CDK's `BlockScrollStrategy`, and `container: DialogContainer`.

### `bn-dialog` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | Text of `h2.dialog__title`. Translatable; it names the object ("Delete Harvest?"). |
| `description` | `string \| null` | `null` | no | When set, renders `<p id="{id}-desc">` as the first child of the body and sets `aria-describedby` on the panel. Translatable. |
| `iconTone` | `'accent' \| 'danger' \| 'none'` | `'accent'` | no | `accent` renders `.dialog__icon`; `danger` adds `.dialog__icon--danger`; `none` renders no icon wrapper. |
| `dismissible` | `boolean` | `true` | no | `false` removes the close control and ignores Escape and backdrop clicks (session-expired). |
| `closeLabel` | `string` | — | yes when `dismissible` | `aria-label` of the close control ("Close dialog"). Translatable. |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` on the panel; Escape and backdrop clicks are ignored; `submitted` is not emitted. |
| `closableWhileBusy` | `boolean` | `false` | no | While busy, `true` keeps the close control enabled (the page aborts or lets the request finish); `false` gives it `disabled`. |
| `form` | `boolean` | `false` | no | Wraps body and footer in `<form class="dialog__form" novalidate>` so footer `type="submit"` buttons and Enter in a single-line field submit. |

Booleans use `booleanAttribute`; all inputs are signal inputs.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `submitted` | `SubmitEvent` | The form is submitted and the dialog is not busy. The default navigation is always prevented. |
| `dismissed` | `'close-button' \| 'escape' \| 'backdrop'` | The member dismisses the dialog, just before it closes with `undefined`. The page uses it to abort an in-flight request when `closableWhileBusy` is set. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=icon]` | one `svg.icon[aria-hidden=true]` | Projected inside `.dialog__icon`; ignored when `iconTone` is `none`. |
| default | body content: paragraphs, `.dialog__who`, `bn-alert`, fields, lists | Projected into `.dialog__body` after the description. |
| `[slot=actions]` | `button[bn-button]` and `a[bn-button]` elements | Projected into `.dialog__footer`, safe action first. One `@if` per node (NG8011). |

Each slot is declared once in the template. Public method: `focusTitle(): void` moves focus to the
title (used when the report dialog turns into its success state).

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Default | — (`.dialog__icon`) | Introductions, feedback, offers, passing, pausing, reporting, photo, sign-in. |
| Destructive | `.dialog__icon--danger` on the icon; danger button last | Cancel RSVP, block, delete project, delete account. The heading names the loss. |
| Form | `form` input; `.dialog__form` wrapper | Any dialog with fields (say-hello, give-feedback, offer-to-help, report, delete-project, delete-account, change-photo, session-expired). |
| Scrollable | — (body overflow) | Any dialog whose body is taller than the viewport allows (delete-account at 360 × 640). |
| Non-dismissible | `dismissible = false` | Session expired only. |
| Bottom sheet | `bn-dialog--sheet` pane class | Every dialog below 576 px. |

| Size | Modifier | Max width | Padding | Type |
|---|---|---|---|---|
| sm | `.dialog--sm` | `--layout-dialog-sm` | header `--space-6` `--space-6` `--space-3`; body `--space-3` `--space-6` `--space-6`; footer `--space-4` `--space-6` `--space-6` | title `--text-h3`, body `--text-body` |
| md (default) | — | `--size-dialog-max-width-27` | same | same |

Height comes from the content, capped by the viewport (see *Responsive behaviour*).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Opening | `DialogService.open()` | Backdrop appears; panel rises by `--space-4` over `--duration-slow` with `--ease-enter` | Panel announced with role, name and description; focus moves to the `autoFocus` target |
| Default | open | As the mocks | Page behind is hidden from assistive technology and unreachable by Tab |
| Close hover | `:hover` on `.icon-btn` (`data-state="hover"` in specimens) | `--color-bg-subtle` circle, icon `--color-fg-default` | — |
| Close focus | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring`, offset `--focus-ring-offset` | Name "Close dialog" |
| Close active | `:active` | as hover | — |
| Busy, closable | `busy` and `closableWhileBusy` | Panel unchanged; the submit button shows its spinner and busy label; fields read-only | `aria-busy="true"` on the panel; Escape and backdrop ignored; × still works |
| Busy, not closable | `busy` without `closableWhileBusy` | Close control `disabled` (muted, no hover); safe action disabled by the page | `aria-busy="true"`; × out of the tab order; Escape and backdrop ignored |
| Disabled actions | page sets `disabled` / `aria-disabled` on actions (delete until the name matches) | Button disabled styles | Owned by [button](button.md) |
| Invalid | page sets `aria-invalid` on a field | Field error under the field; dialog unchanged | Dialog stays open; focus moves to the first invalid field (page) |
| Failed | page projects a danger `bn-alert` in the body | Alert in the body; primary action reads "Try again" | Dialog stays open with input kept; Escape works again |
| Success (in place) | page swaps heading, icon and body (report) | Check icon, heading "Report sent", new actions | Page calls `focusTitle()`; no description |
| Scrollable | body taller than the space left | Body scrolls; header and footer stay put | Body gets `tabindex="0"` while it overflows so keyboard users can scroll it |
| Non-dismissible | `dismissible = false` | No close control | Escape and backdrop ignored |
| Stacked | a second dialog opens while one is open (session-expired over say-hello) | Second backdrop over the first panel | Only the top dialog is reachable; closing it restores focus inside the dialog below |
| Bottom sheet | viewport below 576 px | Full width, anchored to the bottom, top corners `--radius-xl`, bottom corners square | Same semantics |

The design-system state matrix also shows `aria-invalid`, `data-state="failed"` and
`aria-expanded` on the panel; see D-7 for why the panel itself never carries them.

## Markup

```html
<!-- rendered: default (say-hello), centred from 576 px -->
<div class="cdk-overlay-backdrop backdrop cdk-overlay-backdrop-showing"></div>
<div class="cdk-global-overlay-wrapper">
  <div class="cdk-overlay-pane bn-dialog">
    <bn-dialog-container class="dialog" id="bn-dialog-1" role="dialog" aria-modal="true"
        aria-labelledby="bn-dialog-1-title" aria-describedby="bn-dialog-1-desc" tabindex="-1">
      <bn-say-hello-dialog><!-- display: contents -->
        <bn-dialog><!-- display: contents -->
          <div class="dialog__header">
            <span class="dialog__icon"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">…</svg></span>
            <h2 class="dialog__title" id="bn-dialog-1-title" tabindex="-1">Say hello to Daniel</h2>
            <button type="button" class="icon-btn icon-btn--sm" aria-label="Close dialog"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
          </div>
          <form class="dialog__form" novalidate>
            <div class="dialog__body">
              <p id="bn-dialog-1-desc">He'll get your note in his Banaro messages and an e-mail.</p>
              <div class="dialog__who">…Daniel Reyes…</div>
              <div class="field">…textarea…</div>
            </div>
            <div class="dialog__footer">
              <button type="button" class="btn btn--quiet">Cancel</button>
              <button type="submit" class="btn btn--primary">Send message</button>
            </div>
          </form>
        </bn-dialog>
      </bn-say-hello-dialog>
    </bn-dialog-container>
  </div>
</div>
```

```html
<!-- rendered: destructive header (cancel-rsvp); no description, so no aria-describedby -->
<div class="dialog__header">
  <span class="dialog__icon dialog__icon--danger"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">…</svg></span>
  <h2 class="dialog__title" id="bn-dialog-2-title" tabindex="-1">Cancel your RSVP?</h2>
  <button type="button" class="icon-btn icon-btn--sm" aria-label="Close dialog">…</button>
</div>
```

```html
<!-- rendered: busy, not closable (cancel-rsvp) -->
<bn-dialog-container class="dialog" role="dialog" aria-modal="true" aria-labelledby="bn-dialog-2-title" aria-busy="true" tabindex="-1">
  …<button type="button" class="icon-btn icon-btn--sm" aria-label="Close dialog" disabled>…</button>…
  <div class="dialog__footer">
    <button type="button" class="btn btn--quiet" disabled>Keep my spot</button>
    <button type="submit" class="btn btn--danger" aria-busy="true" disabled><span class="spinner" aria-hidden="true"></span>Cancel RSVP</button>
  </div>
</bn-dialog-container>
```

```html
<!-- rendered: non-dismissible header (session-expired) -->
<div class="dialog__header">
  <span class="dialog__icon"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">…</svg></span>
  <h2 class="dialog__title" id="bn-dialog-3-title" tabindex="-1">Your session has expired</h2>
</div>
```

```html
<!-- rendered: failed (pause-matching) — the alert is page content in the body -->
<div class="dialog__body">
  <div class="alert alert--danger" role="alert">…<p class="alert__title">We couldn't pause matching</p><p class="alert__body">Your matching is still running. Check your connection and try again.</p></div>
  <p>We will stop suggesting builders and stop the Monday e-mail. …</p>
</div>
```

The `sm` size adds `.dialog--sm` to the panel; the bottom sheet swaps the pane class to
`bn-dialog--sheet`. The `cdk-*` wrapper classes belong to CDK and may change with it; e2e page
objects locate the dialog by `getByRole('dialog', { name })` and the `.dialog*` classes only.

```html
<!-- consumer: the page's dialog component (say-hello) -->
<bn-dialog
  [heading]="'dialogs.sayHello.title' | t: { name: data.firstName }"
  [description]="'dialogs.sayHello.description' | t"
  [closeLabel]="'common.closeDialog' | t"
  form
  closableWhileBusy
  [busy]="sending()"
  (submitted)="send()"
  (dismissed)="abort()"
>
  <svg slot="icon" class="icon" viewBox="0 0 24 24" aria-hidden="true">…</svg>
  <div class="dialog__who">…</div>
  @if (failed()) {
    <bn-alert variant="danger" [heading]="'dialogs.sayHello.failed' | t">…</bn-alert>
  }
  <bn-field …><textarea bn-textarea …></textarea></bn-field>
  <button slot="actions" bn-button variant="quiet" type="button" (click)="ref.close()">{{ 'common.cancel' | t }}</button>
  <button slot="actions" bn-button variant="primary" type="submit" [busy]="sending()">{{ (failed() ? 'common.tryAgain' : 'dialogs.sayHello.send') | t }}</button>
</bn-dialog>
```

```ts
// consumer: the page opens it
this.dialogs.open(SayHelloDialog, { data: { builderId }, autoFocus: '#hello-msg' });
this.dialogs.open(CancelRsvpDialog, { data: { eventId }, autoFocus: '.btn--quiet' });
```

## Design

- Panel: background `--color-bg-surface-raised`, text `--color-fg-default`, rule
  `--border-width-hairline` in `--color-border-default`, radius `--radius-xl` (sheet: top corners
  only), elevation `--shadow-4`, width 100 % up to the size's maximum.
- Grid rows `auto minmax(0, 1fr) auto`, so only the body scrolls.
- Header: flex, `align-items: flex-start`, gap `--space-4`; padding `--space-6` `--space-6`
  `--space-3`. Title flexes, `--text-h3`, wraps (never truncates).
- Icon: `--size-switch-control-width-23` × `--size-dialog-icon-height-29`, radius `--radius-md`,
  `--color-accent-subtle` with `--color-fg-accent`; danger `--color-danger-bg` with `--color-danger-icon`.
- Close control: the icon button's `sm` size (specified in [top bar](top-bar.md#icon-button)):
  `--space-8` circle inside the header with a negative margin of `--space-1` / `--space-2`, icon
  `--color-fg-muted`; below 576 px its hit area is at least `--target-comfortable` square (D-5).
- Body: grid, gap `--space-5`, padding `--space-3` `--space-6` `--space-6`, `overflow-y: auto`; a
  direct-child paragraph is `--color-fg-muted`.
- `.dialog__who`: flex, gap `--space-4`, avatar `--space-12` square.
- Footer: flex, `justify-content: flex-end`, wrap, gap `--space-3`, padding `--space-4` `--space-6`
  `--space-6`, top rule `--border-width-hairline` `--color-border-default`. In the sheet the bottom
  padding adds `env(safe-area-inset-bottom)`.
- Backdrop `--color-bg-backdrop`; layer `--z-modal` for the backdrop and pane. A stacked dialog
  sits above the one below it in DOM order at the same layer.
- Motion: entrance `rise` keyframes (translate from `--space-4`) over `--duration-slow` with
  `--ease-enter`; no exit animation.

Component tokens: none. The dialog reads semantic tokens directly; a consumer never re-skins it.

| Token | Aliases | Overridden by |
|---|---|---|
| `--size-dialog-max-width-27` | 32 rem | `.dialog--sm` uses `--layout-dialog-sm` |
| `--size-dialog-icon-height-29` | 2.75 rem | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel | `--color-bg-surface-raised` | `--palette-white` | `--palette-night-850` |
| Title and body text | `--color-fg-default` | resolved live in the HTML | resolved live |
| Lead paragraph | `--color-fg-muted` | resolved live | resolved live |
| Panel and footer rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Backdrop | `--color-bg-backdrop` | warm ink at 45 % | black at 60 % |
| Icon tile | `--color-accent-subtle` / `--color-fg-accent` | `--palette-sage-50` / `--palette-sage-700` | `--palette-sage-950` / `--palette-sage-300` |
| Danger icon tile | `--color-danger-bg` / `--color-danger-icon` | `--palette-lingon-100` / `--palette-lingon-600` | `--palette-lingon-950` / `--palette-lingon-300` |
| Close icon | `--color-fg-muted`, hover `--color-fg-default` on `--color-bg-subtle` | resolved live | resolved live |
| Focus ring | `--color-focus-ring` | resolved live | resolved live |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Title and body text |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Lead paragraph, field help |
| `--color-fg-subtle` | `--color-bg-surface-raised` | 4.5:1 | Metadata (`.rows__meta`) |
| `--color-fg-accent` | `--color-accent-subtle` | 3:1 | Icon glyph (non-text) |
| `--color-danger-icon` | `--color-danger-bg` | 3:1 | Danger icon glyph |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring on the close control and actions |

Forced colours: the panel keeps its border because `--color-border-default` becomes `CanvasText`
under `forced-colors: active` (tokens.css); the backdrop is ignored by the system palette, which is
acceptable because the page behind is inert.

## Responsive behaviour

- Below 576 px (XS): the pane spans the viewport width and is anchored to the bottom edge
  (`GlobalPositionStrategy.bottom()`, width 100 %); top corners `--radius-xl`, bottom corners square;
  max height `calc(100dvh - var(--space-4))`; footer bottom padding includes the safe-area inset.
- From 576 px (SM up): the pane is centred horizontally and vertically, width 100 % up to 32 rem
  (`md`), max height `calc(100dvh - var(--space-12))`, all corners `--radius-xl`.
- Crossing 576 px while open (rotation, window resize) switches the form at once by calling
  `updatePosition()` and `updateSize()`; the dialog stays open and keeps focus and input.
- Height: header and footer always stay visible; only the body scrolls.
- Text wraps everywhere: a long heading such as "Offer to help with Open Table GTA" wraps beside the
  icon; footer actions wrap to a second line at 320 px rather than overflow.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every
  target is at least 44 × 44 CSS px below 576 px, including the close control.

## Accessibility

### Role and pattern

`role="dialog"` with `aria-modal="true"` on the panel, following the WAI-ARIA APG
[Dialog (Modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). CDK hides the
page's other top-level elements from assistive technology (`aria-hidden`) while the dialog is open,
and the backdrop blocks the pointer.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Move through the dialog's controls; wraps from last to first and back (CDK focus trap). |
| <kbd>Escape</kbd> | Closes a dismissible dialog that is not busy, emitting `dismissed('escape')`. Ignored while busy and in a non-dismissible dialog. |
| <kbd>Enter</kbd> | In a single-line field of a `form` dialog, submits (same as the submit button). In a textarea, inserts a new line. On a button, activates it. |
| <kbd>Space</kbd> | Activates the focused button. |

### Focus

- On open, focus moves to the `autoFocus` target. The targets the mocks name: say-hello → message
  field; give-feedback → first feedback kind; offer-to-help → role select; pass-suggestion → "Keep
  suggestion"; pause-matching → "Keep matching"; cancel-rsvp → "Keep my spot"; block-builder →
  "Cancel"; report → first reason; delete-project and delete-account → confirmation field;
  change-photo → "Choose a photo"; session-expired → password field. A destructive dialog never
  starts on its destructive action.
- Tab is contained in the top-most open dialog.
- On close, focus returns to the element that had focus when the dialog opened (`restoreFocus`); if
  that element is gone (Harvest deleted), the page moves focus per its own rules.
- `focusTitle()` focuses the title (`tabindex="-1"`, no visible ring on programmatic focus beyond
  `:focus-visible` rules).
- The focus ring is `--focus-ring-width` (2 px) `--color-focus-ring` at `--focus-ring-offset`.

### Labelling

- Name: `aria-labelledby` → the `h2` title. Description: `aria-describedby` → the description
  paragraph, only when `description` is set.
- Close control: `aria-label` from `closeLabel` ("Close dialog"); the × glyph is `aria-hidden`.
- Busy: `aria-busy="true"` on the panel; the submit button carries its own `aria-busy` and busy label.
- The icon is decorative (`aria-hidden="true"`); the heading carries the meaning, so danger is never
  shown by colour alone.

### Announcements

Opening announces the dialog's role, name and description through focus movement; the dialog has
no live region of its own. The failed alert (`role="alert"`) and field errors announce themselves
(owned by [alert](alert.md) and [form field](form-field.md)).

### Motion

The entrance rise is the only motion. Under `prefers-reduced-motion: reduce` the animation is
removed (tokens set `--duration-slow` to 0.01 ms and components.css removes animations), and the
dialog appears in place.

## Content and internationalisation

- The heading asks the question or names the task, and names the object: "Delete Harvest?",
  "Cancel your RSVP?", "Pass on Daniel Reyes?", "Give feedback on Psalter". Questions end with "?";
  tasks do not.
- Destructive dialogs explain what is lost before the button: "This permanently removes the project
  page, its 23 comments and its insights. It can't be undone."
- The safe action names what is kept ("Keep my spot", "Keep project", "Keep my account"); the
  destructive action repeats the verb ("Cancel RSVP", "Delete project"). After a failure the primary
  action reads "Try again".
- Dates follow L2-052: "Thursday 15 October".
- Translatable inputs: `heading`, `description`, `closeLabel`; every slot's text comes from the
  catalogue too. Data values: builder and project names, counts ("41 comments so far"), e-mail
  addresses.
- Long strings wrap; French runs about 30 % longer, so nothing in the header or footer has a fixed
  width.

## Performance

- Change detection: `OnPush` on `bn-dialog` and `bn-dialog-container`; signal inputs; `computed` for
  the icon classes and the close control's disabled state.
- `bn-dialog` injects `DialogRef` optionally, so it renders inline (no overlay) in perf scenarios and
  CRD renderings.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Dialog.ts` renders one inline
  `bn-dialog` for say-hello: heading "Say hello to Daniel", the description, Daniel Reyes's
  `.dialog__who` row, a textarea with Amara's note, Cancel and "Send message"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: add the say-hello dialog to `DarkTheme`.
- Layout stability: opening the dialog must not move the page. CDK's block scroll strategy keeps the
  scroll position; the shell sets `scrollbar-gutter: stable` so removing the page scrollbar does not
  shift content. The dialog never shows a skeleton; data it needs arrives through `data`.
- Weight: `@angular/cdk/dialog`, `@angular/cdk/overlay`, `@angular/cdk/layout` (`BreakpointObserver`)
  and `@angular/cdk/a11y` only.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara on the directory, when she opens "Say hello" for Daniel Reyes, then a panel with `role="dialog"`, `aria-modal="true"` and the classes `.dialog`, `.dialog__header`, `.dialog__body` and `.dialog__footer` appears, its accessible name is "Say hello to Daniel" and its description is "He'll get your note in his Banaro messages and an e-mail." (L2-026)
- **AC-2** Given Amara on Daniel Reyes's profile, when she opens "Block", then the icon tile has `.dialog__icon--danger`, the heading is "Block Daniel Reyes?", the footer shows "Cancel" first and "Block Daniel" last, and "Block Daniel" is the danger button. (L2-032)
- **AC-3** Given the session-expired dialog, when it renders, then it has no close control, and pressing Escape or clicking the backdrop leaves it open with focus inside it. (L2-005)
- **AC-4** Given the say-hello dialog is open and sending returns 401, when the session-expired dialog opens, then it sits above the say-hello dialog, only its controls are reachable by Tab, and after "Sign back in" succeeds it closes and focus returns to the say-hello dialog's "Send message" button. (L2-005)
- **AC-5** Given the report dialog for Daniel Reyes, when the report is accepted, then the same dialog shows the heading "Report sent" with a check icon, has no `aria-describedby`, offers "Block Daniel" and "Done", and focus is on the heading. (L2-031)

### States

- **AC-6** Given the say-hello dialog is sending, when Amara presses Escape or clicks the backdrop, then the dialog stays open, the panel has `aria-busy="true"`, and the close control stays enabled. (L2-050)
- **AC-7** Given the cancel-rsvp dialog is busy, when it renders, then the close control has `disabled`, "Keep my spot" is disabled, and neither Escape nor a backdrop click closes it. (L2-020)
- **AC-8** Given the change-photo dialog is uploading "amara-harvest-day.jpg", when Amara presses Escape, then the upload continues and the dialog stays open; when she chooses the close control, then `dismissed` emits `'close-button'` and the dialog closes. (L2-008)
- **AC-9** Given the give-feedback dialog is posting, when Amara presses Enter or activates "Posting…" again, then `submitted` is not emitted a second time and only one comment is posted. (L2-016)
- **AC-10** Given the say-hello dialog's send fails, when the failed state shows, then the dialog stays open, Amara's note to Daniel is unchanged, the alert sits in `.dialog__body`, and Escape closes the dialog again. (L2-026)
- **AC-11** Given the report dialog with no reason chosen, when Amara submits it, then `submitted` emits, the dialog does not close itself, and it stays open showing "Choose the reason that fits best." (L2-031)
- **AC-12** Given the delete-account dialog at 360 × 640 px, when it opens, then the header with "Delete your account?" and the footer with "Keep my account" and "Delete my account" are fully inside the viewport, the body scrolls, and the body is reachable by Tab while it overflows. (L2-038)

### Keyboard and focus

- **AC-13** Given Amara on Fall Demo Night, when she opens "Cancel RSVP", then focus is on "Keep my spot", not on "Cancel RSVP". (L2-050)
- **AC-14** Given the cancel-rsvp dialog is open, when Amara presses Tab from "Cancel RSVP", then focus wraps to the close control, and Shift+Tab from the close control moves to "Cancel RSVP"; focus never reaches the page behind. (L2-050)
- **AC-15** Given the say-hello dialog opened from Daniel Reyes's "Say hello" button, when Amara presses Escape, then the dialog closes, `dismissed` emits `'escape'`, and focus returns to that "Say hello" button. (L2-050)
- **AC-16** Given the pause-matching dialog is open and not busy, when Amara clicks the backdrop, then the dialog closes and focus returns to "Pause matching" on `/matching`. (L2-050)
- **AC-17** Given any dismissible dialog, when its close control is focused with the keyboard, then it shows a 2 px `--color-focus-ring` outline with at least 3:1 contrast against the panel, and its accessible name is "Close dialog". (L2-050)

### Screen readers

- **AC-18** Given the give-feedback dialog is open over Psalter's project page, when the accessibility tree is read, then the page behind is hidden from assistive technology and axe-core reports no WCAG 2.2 A or AA violations in the light or dark theme. (L2-050)
- **AC-19** Given the cancel-rsvp dialog, when it opens, then the danger meaning is carried by the heading "Cancel your RSVP?" and the button text "Cancel RSVP", and the icon is `aria-hidden="true"`. (L2-050)

### Theming

- **AC-20** Given the dark theme, when the say-hello dialog opens, then the panel uses `--color-bg-surface-raised`, the backdrop `--color-bg-backdrop`, and the title and lead paragraph measure at least 4.5:1 against the panel. (L2-050)
- **AC-21** Given the dialog's styles, when inspected, then every colour comes from a design-system token, and toggling the theme with `t` while a dialog is open repaints it without reopening. (L2-051)

### Responsive

- **AC-22** Given a 360 px viewport, when the give-feedback dialog opens, then the pane has `bn-dialog--sheet`, spans the full width, touches the bottom edge, and has rounded top corners and square bottom corners. (L2-049)
- **AC-23** Given a 768 px viewport, when the give-feedback dialog opens, then the pane has `bn-dialog`, is centred, and is no wider than 32 rem. (L2-049)
- **AC-24** Given the give-feedback dialog open at 360 px with feedback typed, when the viewport widens to 768 px, then the dialog becomes a centred panel without closing, and the typed feedback and focus are kept. (L2-049)
- **AC-25** Given a 320 px viewport, when the offer-to-help dialog opens, then there is no horizontal scroll, the heading wraps, the footer actions wrap rather than clip, and the close control's hit area is at least 44 × 44 px. (L2-049)

### Motion

- **AC-26** Given `prefers-reduced-motion: reduce`, when any dialog opens, then it appears in place without the rise animation, and with motion allowed it rises over `--duration-slow`. (L2-050)

### Content

- **AC-27** Given the en-CA catalogue, when the say-hello dialog renders, then its heading, description, close label and action labels come from the catalogue, and the component holds no hard-coded copy. (L2-052)

### Performance

- **AC-28** Given a change to the dialog, when the perf test runs the `Dialog` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/dialog/` with `dialog-service.ts` (`DialogService`),
  `dialog-container.ts` (`DialogContainer`, selector `bn-dialog-container`, extends CDK
  `CdkDialogContainer`, `ViewEncapsulation.None` rule `bn-dialog-container > * { display: contents }`),
  `dialog.ts` / `dialog.html` / `dialog.css` (`Dialog`, selector `bn-dialog`, host
  `display: contents`), and `dialog-options.ts` (`DialogOptions`, `DialogSize`, `DialogIconTone`).
  Export all from `public-api.ts`.
- `DialogService` is the design's `BnDialog` (detailed designs `adapt-responsive-layout` and
  `meet-accessibility-standards`); AGENTS.md drops the `Bn` prefix from class names.
- Breakpoints come from `BREAKPOINTS` (`lib/layout/breakpoints.ts`) via `BreakpointObserver`; the
  service subscribes while the dialog is open and unsubscribes on close.
- `bn-dialog` sets `dialogRef.disableClose = !dismissible() || busy()` in an `effect`, and listens to
  `keydownEvents` and `backdropClick` to emit `dismissed` with the right reason before calling
  `close()`.
- Body overflow: a `ResizeObserver` on `.dialog__body` toggles `tabindex="0"` while
  `scrollHeight > clientHeight`.
- Composes: [button](button.md) for the actions and the icon button (`button[bn-icon-button]`,
  owned by [top bar](top-bar.md#icon-button)) for the close control, and
  hosts [alert](alert.md), [form field](form-field.md) and the field components in its body.
- Add `Dialog.ts` to `frontend/projects/perf-test/src/scenarios/` and `index.ts`, and the say-hello
  dialog to `DarkTheme.ts`, in the same change.
- `@angular/cdk` is not yet in `frontend/package.json`; add it (matching the Angular major) in the first slice that builds this component.
- Mock clean-ups the pages make when they adopt the component: delete-account's inner `<form>` goes
  (the dialog's `form` wraps body and footer); the static `id="dlg-title"` / `"dlg-desc"` become the
  generated ids.

## Decisions

- **D-1** *At which width does the dialog switch between sheet and centred panel?* At 576 px (the
  L2 SM class). L2-049 AC5 and the `adapt-responsive-layout` design say 576 px; components.css and
  `--layout-breakpoint-sm` say 40 rem (640 px). L2 is the requirement and the parity widths (360,
  768, 1280) agree under both values; the design-system media query moves to 576 px.
- **D-2** *Does a backdrop click close the dialog?* Yes, when it is dismissible and not busy, as
  the `meet-accessibility-standards` design states (`disableClose` bound to busy). Entered text is
  protected because busy and non-dismissible dialogs ignore it, and failed states keep their input.
- **D-3** *Does the close control work while busy?* It follows the dialog's safe action, which each
  mock's note defines: `closableWhileBusy` for say-hello, give-feedback, offer-to-help, change-photo
  (abort) and block-builder, report, delete-project (request completes); disabled for cancel-rsvp,
  pass-suggestion, pause-matching and delete-account, whose notes say the member "cannot dismiss
  mid-flight". The busy mocks draw the × enabled everywhere; the CRD disables it where the safe
  action is disabled so there is no back door. Escape never closes a busy dialog (L2-050 AC3).
- **D-4** *`div` or `header`/`footer`, `h2` or `h3`?* `div.dialog__header`, `div.dialog__footer`
  and `h2.dialog__title`, as in all 45 dialog mocks. The design-system specimen uses `<header>`,
  `<footer>` and `h3`; inside a top-layer panel `<header>` would become a second banner landmark.
- **D-5** *Is the 32 px close control a large enough target?* Not below 576 px: L2-049 AC1 requires
  44 × 44. The glyph stays `--space-8`; below 576 px the hit area grows to `--target-comfortable`
  (padding with a matching negative margin) without moving the glyph.
- **D-6** *Which sizes exist?* `sm` and `md`. The design system also defines `dialog--lg` (40 rem),
  but L2-049 AC5 caps dialogs at 32 rem and no mock uses it, so it is not part of the API.
- **D-7** *Does the panel carry `aria-invalid`, `data-state="failed"` or `aria-expanded`, as the
  design-system state matrix shows?* No. `aria-invalid` is not allowed on `role="dialog"`, failure is
  shown by the projected alert, and `aria-expanded` belongs on a disclosure, not on a modal. The
  matrix's busy specimen (`aria-busy` on the panel) is kept.
- **D-8** *How does a footer submit button submit fields that live in the body?* The `form` input
  wraps body and footer in one `form.dialog__form` (`display: contents`, `novalidate`), so the mock
  markup and layout are unchanged and Enter in a single-line field submits.
- **D-9** *What happens when the dialog is taller than the viewport?* The pane is capped at
  `calc(100dvh - var(--space-12))` (sheet: `- var(--space-4)`), and only the body scrolls. The
  delete-account mock at 360 px lets the footer run off the bottom; the cap fixes that.
- **D-10** *Is the body a tab stop?* Only while it overflows, so keyboard users can scroll long
  text such as the delete-account list (WCAG 2.1.1); otherwise it adds no stop.
- **D-11** *How is the description wired?* Through the `description` input, which renders the lead
  paragraph with the generated id. Dialogs whose mocks have no `dlg-desc` (cancel-rsvp,
  pass-suggestion, pause-matching, report success) leave it unset and project their paragraph.
- **D-12** *Exit animation?* None. The design system specifies only the entrance rise; closing at
  once returns focus without delay.
