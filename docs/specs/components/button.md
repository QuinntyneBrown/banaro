# Button

| Field | Value |
|---|---|
| Selector | `a[bn-button]`, `button[bn-button]` |
| Library path | `frontend/projects/components/src/lib/button/` |
| Status | built |
| Traces to | L2-001, L2-007, L2-008, L2-010, L2-014, L2-039, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`button.html`](../../design-system/components/button.html) |
| Source mocks | [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/join/submitting`](../../mocks/pages/join/submitting.html), [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/event-detail/default`](../../mocks/pages/event-detail/default.html), [`pages/profile-edit/submitting`](../../mocks/pages/profile-edit/submitting.html), [`pages/project-edit/default`](../../mocks/pages/project-edit/default.html), [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`dialogs/delete-project/default`](../../mocks/dialogs/delete-project/default.html), [`dialogs/delete-project/busy`](../../mocks/dialogs/delete-project/busy.html), [`dialogs/change-photo/default`](../../mocks/dialogs/change-photo/default.html), [`notifications/toast/with-action`](../../mocks/notifications/toast/with-action.html), every page header |
| Rendering | [`button.html`](button.html) |

## Purpose and scope

Button triggers one action: join, save, say hello, RSVP, send, or confirm a deletion. It is an
attribute component on a native `<button>` (an operation) or `<a>` (a navigation that looks like an
action, such as "Join Banaro" or "Browse builders"), so the element keeps its native role, keyboard
behaviour, form submission and router integration. Every view keeps one primary action per action
group.

Use a [link](link.md) for navigation inside prose or a "See all" row, a [menu](menu.md) item inside
an open menu, a [button group](button-group.md) to name and lay out a set of related buttons, and
the [pagination](pagination.md) composite for "Show 12 more builders". Icon-only header, dialog-close
and toast-close controls use the `.icon-btn` block owned by the top bar, dialog, toast and banner
CRDs, not this component (D-12).

Out of scope:

- Form validation, the request itself and what happens after it; the page decides when `busy` and
  `disabled` are true and swaps the label text.
- Announcing the outcome of an action (toasts and live regions, L2-028, L2-050).
- Opening overlays: a menu trigger, popover target or dialog opener is a button whose
  `aria-expanded`/`aria-haspopup` attributes are set by the CDK directive or the native
  `popovertarget` behaviour, not by this component.
- Layout of several buttons (`.form-actions`, `.empty__actions`, dialog footers, `.btn-group`).

## Usage

Every `.btn` in `docs/mocks` (pages, dialogs, notifications). Rows that share a configuration are
grouped. "Surface" is what the button sits on.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Signed-out header on `about`, `code-of-conduct`, `contact`, `forgot-password`, `home`, `join`, `maintenance`, `offline`, `privacy`, `reset-password`, `sign-in`, `verify-email` | `a`, `text`, extra class `header__signin`; `a`, `primary`, `sm` | "Sign in"; "Join Banaro" | default | canvas (header) |
| Primary navigation sheet on all 49 screens | `button`, `quiet`, extra class `nav__close`, `popovertarget="primary-nav"` | "Close menu" | default | raised surface (nav popover) |
| `pages/home` hero and matching invitation | `button`/`a`, `primary`, `lg`; `a`, `quiet`, `lg`, `arrow` | "Join Banaro", "Start matching"; "Browse builders" + `.btn__arrow` | default, hover (arrow nudges) | canvas |
| Builder, match and event cards on `home`, `directory`, `dashboard`, `notifications`, `dialogs/say-hello` (page behind), `notifications/toast` (page behind) | `button`/`a`, `quiet`, `sm` | "Say hello", "Ask for advice", "Save a seat", "Pass", "Read about Psalter", "Give feedback", "Read the feedback" | default; `disabled` ("Mark all as read" with nothing unread) | surface (card) |
| Account, site and connection banners | `a`, `quiet`, `sm`; `a`, `primary`, `sm` | "Resend e-mail", "Finish profile", "Status updates", "Try again"; "Complete profile", "Set up matching", "Share a project" | default | info/warning/danger/success banner tint |
| Form submit on `contact`, `forgot-password`, `join`, `matching-setup`, `onboarding`, `profile-edit`, `project-edit`, `project-new`, `reset-password`, `settings`, `sign-in`, `not-found`, `directory` search | `button type="submit"`, `primary` | "Save changes", "Send reset link", "Join Banaro", "Start matching", "Continue", "Search", "Sign in" | default; busy with spinner and busy label: "Creating your account…", "Signing in…", "Saving…", "Saving your profile…", "Sharing…", "Updating…", "Sending…", "Starting matching" | surface (form card) or canvas |
| Dialog footers: `change-photo`, `give-feedback`, `offer-to-help`, `pass-suggestion`, `pause-matching`, `report`, `say-hello`, `session-expired` | `button`, `quiet` (safe action) then `button type="submit"`, `primary` | "Cancel", "Keep suggestion", "Keep matching" / "Upload", "Post feedback", "Send offer", "Pass", "Pause matching", "Send report", "Send message", "Sign back in" | default; busy ("Uploading…", "Posting…", "Sending…", "Pass", "Pause matching"); safe action `disabled` while busy | raised surface (dialog) |
| `dialogs/change-photo/default`, `invalid` | `button type="submit"`, `primary`, focusable disabled | "Save photo" | `aria-disabled="true"` until a valid file is chosen; still focusable | dialog |
| Destructive dialogs: `delete-project`, `delete-account`, `block-builder`, `cancel-rsvp` | `button`, `quiet` then `button type="submit"`, `danger` | "Keep project", "Keep my account", "Cancel", "Keep my spot" / "Delete project", "Delete my account", "Block Daniel", "Cancel RSVP" | default; `disabled` until the typed confirmation matches; busy ("Deleting…", "Blocking…", "Cancel RSVP"); failed state "Try again" | dialog |
| Edit forms while saving: `profile-edit/submitting`, `matching-setup/submitting` | `a`, `quiet`, `disabled`; `a`, `quiet`, `sm`, `disabled` | "Cancel"; "Change photo" | `aria-disabled="true" tabindex="-1"` | surface |
| `pages/directory` toolbar and filter sheet | `button`, `quiet`, `sm`, leading icon, extra class `filters-btn`, `popovertarget="filters"`; `button`, `primary`, extra class `filters__done`; `button`, `text`, `sm` | sliders icon + "Filters"; "Show 1,284 builders", "Show 38 builders", "Show 0 builders"; "Clear all" | default, expanded (sheet open) | canvas; raised surface (sheet) |
| `pages/directory` and `pages/projects` pager | `button`, `quiet`, `lg` / `md` | "Show 12 more builders", "Show 6 more builders", "Show more projects" | default, busy (see [pagination](pagination.md)) | canvas |
| Empty, no-results and error states on every list and detail page | `button`/`a`, `primary`; `button`/`a`, `quiet` | "Try again", "Clear all filters", "Clear filters", "Check again", "Search within 60 km", "Go back", "Back to builders", "Browse builders meanwhile" | default | dashed empty panel on canvas |
| Toasts: `notifications/toast/*`, `notifications/rsvp-toast/*` | `button`, `text`, `sm`, extra class `toast__action` | "Undo", "Try again", "View conversation", "Add to calendar" | default | raised surface (toast) |
| `pages/event-detail` RSVP panel, `notifications/rsvp-toast`, `dialogs/cancel-rsvp` (page behind) | `button`, `primary`, `block`, leading icon; `button`, `primary`, `block`; `a`, `text`, `block`; `button`, `quiet`, `block`; `a`, `primary`, `block` | calendar icon + "Add to calendar"; "Reserve a spot"; "Cancel RSVP"; "Leave the waitlist"; "See upcoming events", "See other events" | default | surface (aside panel) |
| `pages/messages` composer, `notifications/connection-banner` (page behind) | `button type="submit"`, `primary`, leading icon; `button`, `text`, `sm` | paper-plane icon + "Send"; "Retry", "Delete" (failed message) | default, busy "Sending…" | surface |
| `pages/matching`, `dialogs/pass-suggestion`, `dialogs/pause-matching` (page behind) | `a`, `text`, `sm`, leading icon; `button`, `primary`, `sm`; `a`, `primary`, `lg` | pause icon + "Pause matching"; "Resume matching"; "Start matching" | default | canvas |
| `pages/project-edit`, `dialogs/delete-project` (page behind) | `a`, `quiet`, leading icon, extra class `link-danger` | bin icon + "Delete project" | default | danger zone on surface |
| `pages/builder-profile`, `dialogs/report`, `dialogs/block-builder` (page behind) | menu trigger: `quiet`, trailing icon, `aria-label` that starts with the visible text | "More" + chevron, name "More actions for Daniel Reyes" | default, expanded | canvas (profile header) |
| Section and recovery links: `dashboard`, `home`, `forbidden`, `onboarding`, `project-new`, `verify-email` | `a`, `text`; `a`, `text`, `sm` | "See all 312 projects", "Open events", "Skip for now", "Need help?", "Back to projects", "Contact us" | default | canvas |
| Every other navigation-as-action across pages (`about`, `builder-profile`, `dashboard`, `events`, `matching`, `messages`, `notifications`, `onboarding`, `project-detail`, `projects`, `server-error`, `settings`…) | `a`, `primary` or `quiet` | "Say hello", "Edit profile", "Give feedback", "Offer to help", "Share a project", "Open messages", "Go to your dashboard", "Sign out", "See last season", "Who can see this" | default | canvas or surface |
| Design-system specimens only (no mock use yet) | `ghost`; `default` (no variant); icon-only `.btn--icon`; `aria-pressed` toggle | "Save changes"; "Edit profile" (icon-only) | default, hover, focus, active, disabled, busy, pressed, expanded | any |

Every row is buildable with the API below: a variant, a size, `block`, `arrow`, the two icon slots,
`iconOnly`, `busy`, `disabled`, `disabledInteractive`, `pressed`, `type`, and pass-through classes
and attributes on the native host.

## Anatomy

1. **Container** — the native host element with `.btn` and its modifiers. Pill shape, hairline
   border, height from the size, centred content with a gap.
2. **Busy indicator (busy only)** — `span.spinner`, `aria-hidden="true"`, the first child. A ring in
   `currentColor` with a transparent right edge.
3. **Leading icon (optional)** — the `[slot=icon]` content, an `svg.icon` (usually `.icon--sm`) with
   `aria-hidden="true"`, drawn in `currentColor`.
4. **Label** — the default slot, a text node. It is the accessible name unless the button is
   icon-only.
5. **Trailing icon (optional)** — the `[slot=icon-end]` content (for example the "More" chevron),
   `aria-hidden="true"`.
6. **Arrow (optional)** — `svg.btn__arrow.icon` rendered by the component when `arrow` is set,
   `aria-hidden="true"`; nudges right on hover.

Host: the consumer's own `<button>` or `<a>` is the host. The component adds classes and
attributes to it and renders parts 2, 3–5 (projected) and 6 inside it. There is no wrapper
element. Classes the consumer writes on the element (`header__signin`, `nav__close`,
`filters-btn`, `filters__done`, `toast__action`, `link-danger`) are kept beside the component's
classes.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'default' \| 'primary' \| 'quiet' \| 'ghost' \| 'text' \| 'danger'` | `'default'` | no | Adds `.btn--{variant}`; `default` adds no modifier. Design-system names: secondary = `quiet`, link = `text` (D-1). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | no | Adds `.btn--sm` or `.btn--lg`; `md` adds no modifier (D-2). |
| `block` | `boolean` | `false` | no | Adds `.btn--block`: `display: flex`, full width of the container. |
| `iconOnly` | `boolean` | `false` | no | Adds `.btn--icon`. The host must carry an `aria-label`; in dev mode the component throws when it is missing (D-18). |
| `arrow` | `boolean` | `false` | no | Renders the trailing `svg.btn__arrow` after the label. |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` and `aria-disabled="true"`, renders the spinner first, keeps focus, and suppresses activation (click, Enter, Space, form submission, router navigation) until it is false again (D-3). |
| `disabled` | `boolean` | `false` | no | On `<button>`: native `disabled`. On `<a>`: `aria-disabled="true"`, `tabindex="-1"` and suppressed activation; `href` stays (D-5). |
| `disabledInteractive` | `boolean` | `false` | no | With `disabled`: uses `aria-disabled="true"` instead of native `disabled`, keeps the element in the tab order, and suppresses activation ("Save photo", D-6). Ignored when `disabled` is false. |
| `pressed` | `boolean \| undefined` | `undefined` | no | `undefined` omits `aria-pressed` (not a toggle); `true`/`false` writes `aria-pressed` (D-14). Only on `<button>`. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | no | Written to the `type` attribute of a `<button>` host so a button never submits a form by accident (D-9). Ignored on `<a>`. |

- Inputs are signal inputs; the booleans use `booleanAttribute`, so bare attributes work
  (`<button bn-button busy>`).
- Native attributes the consumer writes stay native and are not inputs: `href`, `routerLink`,
  `target`, `rel`, `aria-label`, `aria-describedby`, `aria-haspopup`, `aria-expanded`,
  `aria-controls`, `popovertarget`, `form`, `name`, `value`, `id`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | The native `click` event (and `submit` on the form) is the output. While `busy`, or `disabled` on an anchor or with `disabledInteractive`, the component stops the click in the capture phase, so consumer `(click)` handlers and form submission do not run. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text (the label) | Required unless `iconOnly`. Translatable, from the catalogue. Never an element that carries its own role. |
| `[slot=icon]` | One `svg.icon` with `aria-hidden="true"` | Rendered before the label (after the spinner while busy). |
| `[slot=icon-end]` | One `svg.icon` with `aria-hidden="true"` | Rendered after the label. Do not combine with `arrow`. |

Each slot is declared once in the template (AGENTS.md); the template has no per-element branches.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Primary | `.btn--primary` | The one most important action in a group: submit, "Join Banaro", "Say hello", "Reserve a spot". |
| Quiet (design-system "secondary") | `.btn--quiet` | Safe and secondary actions: "Cancel", "Keep project", card actions, "Browse builders", pager. |
| Ghost | `.btn--ghost` | Low-emphasis actions on busy surfaces; transparent until hover. No mock use yet. |
| Text (design-system "link") | `.btn--text` | Action-shaped links and inline actions: "Sign in", "Clear all", toast actions, "Cancel RSVP". Narrow side padding. |
| Danger | `.btn--danger` | The confirming action of a destructive dialog only: "Delete project", "Delete my account", "Block Daniel", "Cancel RSVP". |
| Default | none | Neutral surface-filled button; design-system base, used for icon-only buttons. |

Modifiers that combine with any variant: `.btn--block` (full width), `.btn--icon` (icon-only).

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| sm | `.btn--sm` | `--control-height-sm` (36 px); at least `--target-comfortable` (44 px) below 576 px | `--space-4` | `--text-label` |
| md | — | `--control-height-md` (44 px) | `--space-5` | `--text-label` |
| lg | `.btn--lg` | `--control-height-lg` (52 px) | `--space-8` | `--text-label` at `--font-size-md` |

Text variant: side padding `--space-2` at every size. Icon-only: padding `--space-2`, minimum
width `--control-height-md`, so it is at least 44 × 44 px. Width otherwise comes from the label.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Variant fill, label and border | Role button or link; name = label |
| Hover | `:hover` (`data-state="hover"` in specimens) | Primary `--color-accent-hover` and lifts by one hairline; danger `--color-danger-solid-hover`; quiet, ghost and default `--color-bg-subtle` (quiet border `--color-fg-default`); text label `--color-fg-link-hover`; arrow moves `--size-btn-translate-20` right | — |
| Focus | `:focus-visible` (`data-state="focus"`) | `--focus-ring-width` outline in `--color-focus-ring`, offset `--focus-ring-offset` | Focused |
| Active | `:active` (`data-state="active"`) | Moves down `--space-0-5`; primary `--color-accent-active`; danger `--color-danger-solid-hover` | — |
| Disabled | native `disabled` (`<button>`), or `aria-disabled="true"` (`<a>`, `disabledInteractive`) | `--color-bg-subtle` fill, `--color-fg-disabled` label, transparent border, `cursor: not-allowed`, no hover, no press | Exposed as disabled (dimmed). Native disabled and disabled anchors leave the tab order; `disabledInteractive` stays in it |
| Busy | `aria-busy="true"` + `aria-disabled="true"` | Spinner first, gap `--space-3`, disabled colours, `cursor: progress`; label replaced by the busy label the page supplies | Name is the busy label ("Saving…"); busy and disabled are exposed; focus stays on the button |
| Pressed | `aria-pressed="true"` | `--border-width-thick` outline in `--color-accent`, offset `--space-0-5` (not colour alone: the outline is a shape) | "pressed" / "toggle button, pressed" |
| Expanded | `aria-expanded="true"` set by a CDK trigger or native popover | No visual change (D-13) | "expanded" |
| Forced colours | `forced-colors: active` | Hairline border in `CanvasText`; focus ring `Highlight` | — |
| On tinted surfaces (banners, toasts, dialogs, panels) | context | Same tokens; quiet and text stay transparent and take the surface tint | — |

## Markup

Rendered DOM. Variants that differ only by modifier (`--quiet`, `--ghost`, `--text`, `--danger`,
`--sm`, `--lg`, `--block`) follow the first block.

```html
<!-- rendered: primary, md, anchor -->
<a class="btn btn--primary" href="/join">Join Banaro</a>
```

```html
<!-- rendered: quiet, lg, arrow -->
<a class="btn btn--quiet btn--lg" href="/builders">Browse builders <svg class="btn__arrow icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h15"/><path d="m13.5 6 6 6-6 6"/></svg></a>
```

```html
<!-- rendered: leading icon, consumer class kept, popover trigger -->
<button type="button" class="btn btn--quiet btn--sm filters-btn" popovertarget="filters" aria-expanded="false"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg>Filters</button>
```

```html
<!-- rendered: trailing icon, menu trigger (aria-* written by the CDK menu trigger) -->
<button type="button" class="btn btn--quiet" aria-label="More actions for Daniel Reyes" aria-haspopup="menu" aria-expanded="false">More <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></button>
```

```html
<!-- rendered: icon-only -->
<button type="button" class="btn btn--icon" aria-label="Edit profile"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">…</svg></button>
```

```html
<!-- rendered: busy submit -->
<button type="submit" class="btn btn--primary" aria-busy="true" aria-disabled="true"><span class="spinner" aria-hidden="true"></span>Creating your account…</button>
```

```html
<!-- rendered: disabled button, disabled anchor, focusable disabled -->
<button type="submit" class="btn btn--danger" disabled>Delete project</button>
<a class="btn btn--quiet" href="/builders/amara-osei" aria-disabled="true" tabindex="-1">Cancel</a>
<button type="submit" class="btn btn--primary" aria-disabled="true">Save photo</button>
```

```html
<!-- rendered: toggle -->
<button type="button" class="btn btn--quiet" aria-pressed="true">Saved</button>
```

```html
<!-- consumer -->
<a bn-button variant="primary" size="sm" routerLink="/join">{{ 'common.join' | t }}</a>
<a bn-button variant="quiet" size="lg" arrow routerLink="/builders">{{ 'home.hero.browse' | t }}</a>
<button bn-button variant="primary" type="submit" [busy]="saving()">
  {{ (saving() ? 'join.submitting' : 'join.submit') | t }}
</button>
<button bn-button variant="quiet" size="sm" class="filters-btn" popovertarget="filters">
  <svg slot="icon" class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg>{{ 'directory.filters' | t }}
</button>
<button bn-button variant="danger" type="submit" [disabled]="!nameMatches()" [busy]="deleting()">…</button>
<a bn-button variant="quiet" routerLink="/profile" [disabled]="saving()">{{ 'common.cancel' | t }}</a>
<button bn-button variant="primary" type="submit" [disabled]="!photo()" disabledInteractive>{{ 'photo.save' | t }}</button>
```

The classes `.btn`, `.btn--*`, `.btn__arrow`, `.spinner` and the ARIA attributes are the e2e
contract. The order of spinner, icon, label, trailing icon and arrow is fixed. The SVG paths of
projected icons are the consumer's and free to change.

## Design

- Layout: `inline-flex`, centred on both axes, gap `--space-2` (busy `--space-3`), no wrap at
  576 px and above.
- Height `--control-height-md` (sizes above); side padding `--space-5`; text variant
  `--space-2`; icon-only `--space-2` with minimum width `--control-height-md`.
- Label `--text-label` (lg `--font-size-md`), the button letter-spacing geometry token from
  `tokens.css`, sentence case as written (no CSS text transform), no underline.
- Shape: `--border-width-hairline` border (transparent except quiet), `--radius-full`.
- Icons `--space-5` square (`.icon`) or `--space-4` (`.icon--sm`); arrow `--space-4` square.
- Spinner `--space-4` square, `--border-width-thick` ring, `--radius-full`, one turn per
  `--duration-deliberate`, linear.
- Motion: background, border and transform transitions over `--duration-base` with
  `--ease-standard`; colour over `--duration-fast`. Primary hover lifts by one
  `--border-width-hairline`; active presses down `--space-0-5`; arrow translates
  `--size-btn-translate-20`.
- Focus: `--focus-ring-width` solid `--color-focus-ring`, offset `--focus-ring-offset`, from the
  global `:focus-visible` foundation.
- No elevation and no z-order of its own.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| `--bn-button-bg` | `--color-bg-surface` | primary `--color-accent`; danger `--color-danger-solid`; quiet, ghost, text `--color-transparent` |
| `--bn-button-fg` | `--color-fg-default` | primary `--color-fg-on-accent`; danger `--color-fg-on-danger`; text `--color-fg-link` |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Primary fill | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Primary fill, hover | `--color-accent-hover` | `--palette-sage-700` | `--palette-sage-200` |
| Primary fill, active | `--color-accent-active` | `--palette-sage-800` | `--palette-sage-100` |
| Primary label | `--color-fg-on-accent` | `--palette-birch-50` | `--palette-sage-950` |
| Default fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Default, quiet, ghost label | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Quiet border | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Hover fill (default, quiet, ghost) | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Text label | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |
| Text label, hover | `--color-fg-link-hover` | `--palette-sage-800` | `--palette-sage-200` |
| Danger fill | `--color-danger-solid` | `--palette-lingon-600` | `--palette-lingon-300` |
| Danger fill, hover and active | `--color-danger-solid-hover` | `--palette-lingon-700` | `--palette-lingon-100` |
| Danger label | `--color-fg-on-danger` | `--palette-white` | `--palette-lingon-950` |
| Disabled and busy fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Disabled and busy label | `--color-fg-disabled` | `--palette-oat-400` | `--palette-night-500` |
| Pressed outline | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Primary label |
| `--color-fg-on-accent` | `--color-accent-hover` | 4.5:1 | Primary label, hover |
| `--color-fg-on-accent` | `--color-accent-active` | 4.5:1 | Primary label, active |
| `--color-fg-on-danger` | `--color-danger-solid` | 4.5:1 | Danger label |
| `--color-fg-on-danger` | `--color-danger-solid-hover` | 4.5:1 | Danger label, hover |
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Default and quiet label on cards |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Label on hover fill |
| `--color-fg-link` | `--color-bg-canvas` | 4.5:1 | Text variant on the page |
| `--color-fg-link` | `--color-bg-surface` | 4.5:1 | Text variant on cards |
| `--color-fg-link-hover` | `--color-bg-surface` | 4.5:1 | Text variant, hover |
| `--color-accent` | `--color-bg-surface` | 3:1 | Primary edge against a card |
| `--color-accent` | `--color-bg-canvas` | 3:1 | Primary edge against the page |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Danger edge |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Quiet border |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus indicator on cards |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus indicator on the page |

Disabled and busy colours are exempt from 1.4.3 and 1.4.11 as inactive components; the busy
state is also conveyed by the spinner and the busy label, not by colour alone.

Forced colours: the button keeps a `CanvasText` hairline border, the focus ring uses `Highlight`,
and the disabled state relies on the system's `GrayText` treatment of `disabled`/`aria-disabled`.

## Responsive behaviour

- Below 576 px: `sm` buttons grow to at least `--target-comfortable` (44 px) high (L2-049);
  labels may wrap onto a second line, centred, so a long or translated label never forces
  horizontal scroll (D-10). From 576 px the label does not wrap.
- `block` buttons fill their container at every width; the RSVP panel and the filter sheet use it.
- Groups of buttons wrap (owned by the containers); the button itself never shrinks below its
  label's longest word.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom every button and its label stay
  visible and operable; every target is at least 44 × 44 CSS px on touch devices (icon-only
  included).

## Accessibility

### Role and pattern

Native `<button>` (role `button`) or `<a href>` (role `link`), following the
[WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). A toggle uses
`aria-pressed`. The component never adds `role` to the host.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to and from the button. Native `disabled` buttons and disabled anchors are skipped; busy and `disabledInteractive` buttons are reached. |
| <kbd>Enter</kbd> | Activates a `<button>` and follows an `<a>`; does nothing while busy or disabled. |
| <kbd>Space</kbd> | Activates a `<button>` (and toggles `aria-pressed`); does nothing on an `<a>`, or while busy or disabled. |

### Focus

- The ring comes from the global `:focus-visible` rule and is never suppressed.
- Entering the busy state never moves or drops focus (no native `disabled` while busy); when busy
  ends, focus is still on the button unless the page deliberately moves it (dialog close, route
  change).
- A disabled anchor has `tabindex="-1"`; the component restores the consumer's `tabindex` (or
  removes it) when it is enabled again.

### Labelling

- The accessible name is the visible label. Labels are a verb and an object: "Save changes",
  "Say hello", "Delete project".
- Icon-only buttons require `aria-label` ("Edit profile"); every icon is `aria-hidden="true"`.
- When `aria-label` extends the visible label it starts with it (WCAG 2.5.3): "More" →
  "More actions for Daniel Reyes".
- While busy the name is the busy label the page supplies ("Saving…"); a button whose busy label
  equals its idle label ("Pass", "Pause matching", "Cancel RSVP") keeps it.

### Announcements

The button announces nothing itself. `aria-busy`, disabled and pressed states are exposed on the
element; the outcome of the action is announced by the page's live region or toast (L2-050,
L2-028).

### Motion

Hover lift, press translate, arrow nudge and spinner rotation run only under
`prefers-reduced-motion: no-preference`. With `reduce`, colour changes are instant, nothing moves,
and the spinner is a static ring; the busy label still shows the state.

## Content and internationalisation

- Sentence case, a verb and an object, no trailing full stop: "Join Banaro", "Show 1,284
  builders", "Reserve a spot". One primary per group; the safe action comes first in dialogs
  ("Keep project" before "Delete project").
- Busy labels use the present participle and a single ellipsis character: "Saving…",
  "Creating your account…", "Deleting…". When the action is a short noun or already names the
  outcome, keep the idle label: "Pass", "Pause matching", "Cancel RSVP".
- Numbers in labels follow L2-052 ("Show 1,284 builders"); names come from data ("Block Daniel",
  "More actions for Daniel Reyes").
- Translatable: the label, the busy label and any `aria-label`, all from the catalogue through the
  `t` pipe. The component contains no copy. Data values: builder and project names inside labels.
- French runs about 30 % longer: labels wrap below 576 px (D-10) and never truncate.

## Performance

- Change detection: `OnPush`; signal inputs; one `computed` for the class list and one for the
  disabled/busy attribute set; the capture-phase click guard is one listener registered once.
- Perf-test scenarios in `frontend/projects/perf-test/src/scenarios/`:
  `Button.ts` renders the home hero's `<a bn-button variant="primary" size="lg">Join Banaro</a>`;
  `ButtonBusy.ts` renders the contact form's busy submit "Sending…";
  `ButtonIcon.ts` (to add) renders the directory's "Filters" quiet small button with its leading
  icon. Iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme` (hero button in the dark theme), and every card, dialog, toast
  and banner scenario that contains a button.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf
  test against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: the busy spinner sits in the existing gap and label swap is the page's; the
  button reserves its height from the size token, so busy and idle never change the row height.
- Weight: no dependencies beyond `@angular/core`; no icon library (icons are projected SVG).

## Acceptance criteria

### Rendering

- **AC-1** Given the home hero for a visitor, when it renders, then "Join Banaro" is an `<a>` with exactly the classes `btn btn--primary btn--lg`, a `--color-accent` fill, a label contrast of at least 4.5:1, and a height of `--control-height-lg`. (L2-039)
- **AC-2** Given the home hero, when "Browse builders" renders, then it is an `<a class="btn btn--quiet btn--lg">` whose last child is `svg.btn__arrow` with `aria-hidden="true"`, and its accessible name is exactly "Browse builders". (L2-039)
- **AC-3** Given the signed-out header, when "Sign in" renders, then it is an `<a>` with the classes `btn btn--text header__signin` (the consumer's class kept), and its label contrast against the page is at least 4.5:1. (L2-050)
- **AC-4** Given the directory toolbar below 992 px, when "Filters" renders, then the leading `[slot=icon]` SVG comes before the text, is `aria-hidden="true"`, the name is "Filters", and the host keeps the `filters-btn` class and `popovertarget`. (L2-010)
- **AC-5** Given the event detail RSVP panel, when "Reserve a spot" renders with `block`, then it has `.btn--block` and its width equals the panel's content width at 360, 768 and 1280 px. (L2-049)
- **AC-6** Given an icon-only button labelled "Edit profile", when it renders, then it has `.btn--icon`, the accessible name "Edit profile", and a box of at least 44 × 44 CSS px. (L2-049)
- **AC-7** Given a `<button bn-button>` with no `type` inside the profile edit form, when it is pressed, then the form is not submitted, because the host carries `type="button"`. (L2-007)

### States

- **AC-8** Given Amara submits the join form, when the request is in flight, then the submit button shows "Creating your account…", has `aria-busy="true"` and `aria-disabled="true"`, its first child is `span.spinner[aria-hidden="true"]`, and pressing it again, or pressing Enter in a field, sends no second request. (L2-001)
- **AC-9** Given the profile edit form is saving, when the member looks at it, then "Saving…" is busy and disabled-looking (`--color-bg-subtle` fill, `--color-fg-disabled` label), and "Cancel" is an anchor with `aria-disabled="true"` and `tabindex="-1"` whose click does not navigate. (L2-007)
- **AC-10** Given the delete-project dialog for Harvest, when the typed name does not match, then "Delete project" is a `<button class="btn btn--danger">` with native `disabled`, and when "Harvest" is typed it becomes enabled without moving focus from the field. (L2-014)
- **AC-11** Given the owner confirms deletion of Harvest, when the request is in flight, then "Deleting…" is busy with the spinner, keeps the `.btn--danger` class, and a second press sends nothing. (L2-014)
- **AC-12** Given the change-photo dialog with no file chosen, when "Save photo" renders, then it has `aria-disabled="true"`, no `disabled` attribute, is reachable with Tab, and pressing it submits nothing. (L2-008)
- **AC-13** Given a toggle button with `pressed` true, when it renders, then it has `aria-pressed="true"` and a `--border-width-thick` outline in `--color-accent`, so the state is shown by shape and not by colour alone; with `pressed` undefined the attribute is absent. (L2-050)

### Keyboard and focus

- **AC-14** Given any enabled button, when it is reached with Tab, then it shows a `--focus-ring-width` ring in `--color-focus-ring` at `--focus-ring-offset` with at least 3:1 contrast against the surface, and Enter and Space activate a `<button>` while Enter follows an `<a>`. (L2-050)
- **AC-15** Given focus is on "Send report" in the report dialog, when the member presses it and it becomes busy, then focus stays on the button, and when the request ends it is still on the button unless the dialog closes. (L2-050)
- **AC-16** Given "Mark all as read" is disabled because nothing is unread, when the member tabs through the notifications page, then the button is skipped. (L2-050)

### Screen readers

- **AC-17** Given the builder profile of Daniel Reyes, when the "More" trigger is read, then its name is "More actions for Daniel Reyes", which starts with the visible text "More", and it announces as collapsed or expanded. (L2-050)
- **AC-18** Given every variant in every state on the rendering page and on each mock route, when axe-core runs in both themes, then it reports no WCAG 2.2 A or AA violation caused by a button. (L2-050)

### Theming

- **AC-19** Given the dark theme, when a primary, quiet, text and danger button render, then every colour comes from the semantic tokens in the Colour table (primary fill resolves to `--palette-sage-300`), and switching theme changes them without any component code. (L2-051)
- **AC-20** Given the dark theme, when the primary, danger and text buttons are measured, then their labels reach at least 4.5:1 against their fills or surfaces. (L2-050)
- **AC-21** Given forced-colours mode, when any button renders, then it has a visible `CanvasText` border and a visible focus ring. (L2-050)

### Content

- **AC-22** Given the app in en-CA, when any button renders, then its label, busy label and `aria-label` come from the translation catalogue, and the component's template contains no user-facing text. (L2-052)

### Responsive

- **AC-23** Given a builder card at 360 px wide, when its small "Say hello" button is measured, then it is at least 44 px high. (L2-049)
- **AC-24** Given a 320 px viewport and a label one third longer than "Browse builders meanwhile", when the button renders, then the label wraps inside the button and the page has no horizontal scroll. (L2-049)

### Motion

- **AC-25** Given `prefers-reduced-motion: reduce`, when a member hovers the primary button, presses any button, hovers "Browse builders" or waits on a busy button, then nothing lifts, presses, nudges or spins, and the busy label is still shown. (L2-050)

### Performance

- **AC-26** Given a change to the button, when the perf test runs `Button`, `ButtonBusy`, `ButtonIcon` and `DarkTheme` against the base branch, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

Gaps between `frontend/projects/components/src/lib/button/` and this CRD:

- `busy` sets only `aria-busy`. Add `aria-disabled="true"`, the capture-phase activation guard
  (click, form submission, router navigation) and render a real `span.spinner[aria-hidden]` as
  the first child instead of the `::before` pseudo-element (D-4).
- Add the `disabled`, `disabledInteractive`, `pressed`, `type` and `iconOnly` inputs, with the
  element-specific mapping in the API table. Read the host tag once (`ElementRef`) to choose the
  `<button>` or `<a>` mapping.
- Replace the bare `<ng-content />` with three slots in a fixed order: spinner, `[slot=icon]`,
  default, `[slot=icon-end]`, then the existing arrow.
- Add the below-576 px wrap rule (`white-space: normal`, centred text) next to the existing
  `sm` target rule.
- Add `:host([aria-busy='true'])` colour parity with disabled and remove the duplicate
  transition declarations copied from the design-system file.
- Add the dev-mode `aria-label` assertion for `iconOnly`.
- Update `ButtonBusy.ts` to use `busy` alone (no consumer `disabled`) and add `ButtonIcon.ts`;
  export it from `scenarios/index.ts`.
- Callers that relied on native `disabled` while busy change to `[busy]` only.

## Decisions

- **D-1** *Which variant names does the API use?* The BEM modifier names already in the library
  and the mocks: `quiet` and `text`, not the design-system display names "secondary" and "link".
  The classes are the e2e contract and the existing API uses them; renaming would change every
  consumer.
- **D-2** *Does `md` add `.btn--md`?* No. The design-system size specimen shows `.btn--md`, but
  `components.css` defines no such rule and no mock uses it; md is the base.
- **D-3** *Native `disabled` or `aria-disabled` while busy?* `aria-disabled="true"` with
  `aria-busy="true"` and an activation guard. The mocks write native `disabled`, but a disabled
  button drops focus mid-submit, which breaks L2-050 (focus order, dialog focus retention). The
  rendering is identical because the CSS treats both alike, L2-001's "disabled and cannot be
  triggered again" still holds, and the design-system busy specimen uses no native `disabled`.
- **D-4** *Pseudo-element or element for the spinner?* A real `span.spinner` with
  `aria-hidden="true"`, as in every busy mock, so markup parity and the spinner block's styles
  hold.
- **D-5** *How is an anchor disabled?* `aria-disabled="true"` plus `tabindex="-1"`, keeping
  `href`, with clicks suppressed, exactly as the profile-edit and matching-setup mocks render
  "Cancel" and "Change photo".
- **D-6** *How does "Save photo" stay focusable while disabled?* A `disabledInteractive` input
  (with `disabled`) writes `aria-disabled` instead of native `disabled`, as the change-photo mock
  notes. Other disabled buttons in the mocks use native `disabled`.
- **D-7** *How are icons placed?* Two slots, `[slot=icon]` before the label and `[slot=icon-end]`
  after it, matching the design system's leading and trailing icon variants; the `arrow` input
  stays for the animated `.btn__arrow`.
- **D-8** *Does the component support `<summary>`?* No. The builder-profile "More" trigger is a
  `summary.btn` in the mock; it becomes a `<button bn-button>` menu trigger (see [menu](menu.md)),
  because the menu is built on CDK Menu, not `details`.
- **D-9** *What is the default `type`?* `"button"`, so only explicit `type="submit"` buttons
  submit; every mock button already declares its type.
- **D-10** *May labels wrap?* Below 576 px yes, centred; from 576 px no. The design system sets
  `white-space: nowrap`, which overflows at 320 px with longer translated labels (L2-049).
- **D-11** *What does `link-danger` on a quiet button do?* It is kept as a pass-through class and
  has no colour effect, which is how the project-edit mock renders: `.btn`'s own colour rule wins
  over `.link-danger` in the cascade. The danger meaning is carried by the bin icon and the
  confirmation dialog.
- **D-12** *Does Button cover `.icon-btn`?* No. `.icon-btn` is a separate block (header icons,
  dialog close, toast and banner dismiss) documented with the top bar, dialog, toast and banner;
  `.btn--icon` is the button's own icon-only form.
- **D-13** *How does the expanded state look?* Unchanged: the design system's expanded specimen
  has no rule of its own; the menu or sheet it opens is the visible change.
- **D-14** *When is `aria-pressed` written?* Only when `pressed` is a boolean, so ordinary buttons
  are never announced as toggles.
- **D-15** *Busy with a leading icon?* The spinner comes first and the icon stays, as the
  design-system busy specimen shows.
- **D-16** *Which hover fill do quiet, ghost and default use?* `--color-bg-subtle`, with the quiet
  border darkening to `--color-fg-default`, as the cascade in `components.css` resolves; the
  earlier quiet hover to `--color-bg-surface` is overridden there.
- **D-17** *Do disabled and busy buttons react to hover and press?* No: no fill change, no lift,
  no press translate.
- **D-18** *What if an icon-only button has no `aria-label`?* The component throws in dev mode;
  production renders as given. An unnamed button fails WCAG 4.1.2.
