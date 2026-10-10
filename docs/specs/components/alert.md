# Alert and banner

| Field | Value |
|---|---|
| Selector | `bn-alert`, `bn-banner` |
| Library path | `frontend/projects/components/src/lib/alert/`, `frontend/projects/components/src/lib/banner/` |
| Status | built |
| Traces to | L2-001, L2-003, L2-019, L2-021, L2-024, L2-025, L2-028, L2-030, L2-040, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`alert.html`](../../design-system/components/alert.html) |
| Source mocks | [`dialogs/*/failed`](../../mocks/dialogs/pass-suggestion/failed.html), [`pages/sign-in/error`](../../mocks/pages/sign-in/error.html), [`pages/contact/success`](../../mocks/pages/contact/success.html), [`pages/dashboard/partial`](../../mocks/pages/dashboard/partial.html), [`pages/home/partial`](../../mocks/pages/home/partial.html), [`pages/event-detail/ended`](../../mocks/pages/event-detail/ended.html), [`pages/event-detail/cancelled`](../../mocks/pages/event-detail/cancelled.html), [`pages/matching/paused`](../../mocks/pages/matching/paused.html), [`pages/matching/reviewed`](../../mocks/pages/matching/reviewed.html), [`pages/matching-setup/success`](../../mocks/pages/matching-setup/success.html), [`pages/join/success`](../../mocks/pages/join/success.html), [`pages/profile-edit/success`](../../mocks/pages/profile-edit/success.html), [`pages/settings/success`](../../mocks/pages/settings/success.html), [`notifications/account-banner/*`](../../mocks/notifications/account-banner/info.html), [`notifications/site-banner/*`](../../mocks/notifications/site-banner/info.html), [`notifications/connection-banner/*`](../../mocks/notifications/connection-banner/warning.html) |
| Rendering | [`alert.html`](alert.html) |

## Purpose and scope

The design-system page "Alert and banner" covers two components that share four status variants.
**`bn-alert`** is a boxed message inside the content: a form or dialog that failed ("We couldn't pass on
this suggestion"), a page state that needs explaining ("This event has ended"), a confirmation that
stays on screen after a save ("Message sent"), or one section of a page that did not load ("We couldn't
load your events"). **`bn-banner`** is a full-width strip above the header for conditions that outlive
one page: the account ("Verify your e-mail to keep getting matches"), the site ("Planned maintenance on
Saturday 10 October") and the connection ("You are offline").

Use a [toast](toast.md) for a brief outcome of an action that needs no lasting place on the page. Use an
[inline message](inline-message.md) for a one-line status beside the thing it describes. Use the
[error page](error-page.md) when a whole route fails and the [empty state](empty-state.md) when a whole
collection is empty or failed. Field-level errors belong to the form field (`bn-field-error`) and the
list of form errors to `bn-form-summary`.

Out of scope:

- Deciding when a banner shows, which banner wins, and how long a dismissal lasts. `BannerService`,
  `DismissalStore` and the account, site and connection banner sources own that (detailed design
  `notifications/system-notifications`, `resilience/handle-offline-and-maintenance`). The banner only
  renders, emits `dismissed`, and runs its own auto-dismiss timer when told to.
- What an action does ("Try again", "Resend e-mail"). The consumer projects the button or link and
  handles it.
- Moving focus. Neither component moves focus when it appears; the page decides focus after a failed
  submit (first invalid field, L2-001).
- The button and link styles inside the actions ([button](button.md)).

## Usage

Every use of `.alert` and `.banner` in `docs/mocks/`:

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/{block-builder, cancel-rsvp, change-photo, delete-account, delete-project, give-feedback, offer-to-help, pass-suggestion, pause-matching, report, say-hello, session-expired}/failed` | `bn-alert` danger | title "We couldn't block Daniel", "We couldn't cancel your RSVP", "We couldn't upload your photo", "We couldn't delete your account", "We couldn't delete Harvest", "We couldn't post your feedback", "We couldn't send your offer", "We couldn't pass on this suggestion", "We couldn't pause matching", "We couldn't send your report", "We couldn't send your message", "We couldn't sign you in"; body one or two sentences; no actions (the dialog's own primary button retries) | default (`role="alert"`) | dialog surface (`--color-bg-surface-raised`) |
| `pages/sign-in/error` | `bn-alert` danger | "Those details don't match" / "Check your e-mail and password and try again, or reset your password."; action link "Reset password" (quiet, sm) | default | auth card surface |
| `pages/dashboard/partial` | `bn-alert` danger | "We couldn't load your events" / "Your matches are up to date. Events didn't load this time."; actions "Try again" (quiet button, sm) and "Open events" (text link, sm) | default | canvas, in place of the section |
| `pages/home/partial` | `bn-alert` danger | "We couldn't load projects" / "Builders and events loaded, but this section didn't…"; actions "Try again", "See all 312 projects" | default | canvas (see D-9) |
| `pages/contact/success` | `bn-alert` success | "Message sent" / "We will reply to amara@harvest.example, usually within two working days. A copy is in your inbox."; action link "Back to the home page" | default (`role="status"`) | canvas |
| `pages/profile-edit/success` | `bn-alert` success | "Profile saved" / "Your changes are live. Builders see them now."; action link "View your profile" | default | canvas (see D-10) |
| `pages/settings/success`, `pages/matching-setup/success`, `pages/matching/reviewed` | `bn-alert` success | "Saved", "We have your search", "Next suggestions arrive Monday 12 October"; no actions | default | canvas |
| `pages/event-detail/ended`, `pages/join/success` | `bn-alert` info | "This event has ended" / "The demos wrapped up at 9:30 pm. Here is how the evening went."; "Nothing yet?" / "Look in your spam folder, or wait a minute. The link works for 24 hours." | default | canvas, auth card |
| `pages/matching/paused` | `bn-alert` info | "Paused since Friday 9 October" / "You will not get suggestions or the Monday e-mail…"; action "Resume matching" (primary button, sm) | default | canvas |
| `pages/event-detail/cancelled` | `bn-alert` warning | "The host cancelled this event" / a quoted note from Naomi Fraser (long, wraps) | default (`role="status"`) | canvas |
| Forms with a 429 (`/join`, `/sign-in`, `/forgot-password`, `session-expired` dialog) | `bn-alert` danger, top of the form | "Too many sign-in attempts." / "Try again in 15 minutes." (L2-001, L2-003, L2-004, L2-005; no mock) | default | auth card, dialog |
| `notifications/account-banner/info` | `bn-banner` info, dismissible | "Finish your profile so builders can find you. It takes about two minutes."; action link "Finish profile" | default | full width above the header |
| `notifications/account-banner/warning`, `…/persistent` | `bn-banner` warning, dismissible | "Verify your e-mail to keep getting matches. We sent a link to amara@harvest.example."; action "Resend e-mail" | default | above the header |
| `notifications/account-banner/success` | `bn-banner` success, dismissible, auto-dismiss | "Your e-mail is verified. Thanks, Amara. Your Monday matches are on their way." | default, auto-dismissing | above the header |
| `notifications/account-banner/danger` | `bn-banner` danger, dismissible | "Your verification link has expired, so matching is paused."; action "Send a new link" | default (`role="alert"`) | above the header |
| `notifications/site-banner/{info, warning, danger, success}` | `bn-banner`, dismissible; success auto-dismisses | "Planned maintenance on Saturday 10 October, 2 to 3 am ET…", "Messages are delayed…" + "Status updates", "Matching e-mails are down…" + "Status updates", "Maintenance finished…" | default | above the header |
| `notifications/site-banner/persistent` | `bn-banner` info, **not** dismissible | "Planned maintenance on Saturday 10 October, 2 to 3 am ET. This notice stays until the work is done." | default | above the header |
| `notifications/connection-banner/warning` | `bn-banner` warning, **not** dismissible | "You are offline. What you write stays on this page until you reconnect." | default | above the header |
| `notifications/connection-banner/info` | `bn-banner` info, dismissible | "Reconnecting… Banaro will update as soon as you are back." | default | above the header |
| `notifications/connection-banner/danger` | `bn-banner` danger, dismissible | "We couldn't reconnect. Check your network, then try again."; action "Try again" | default (`role="alert"`) | above the header |
| `notifications/connection-banner/success` | `bn-banner` success, dismissible, auto-dismiss 6 s | "Back online. Banaro is up to date." | default, auto-dismissing | above the header |
| Design-system page only | `bn-alert` info, dismissible | "A note for local builders" + text button "Dismiss" | default | canvas |

Every row is buildable with the API below.

## Anatomy

`bn-alert`:

1. **Container** — `.alert` (+ `.alert--{variant}`). A two-column grid: icon column and content column.
   Carries `role="alert"` (danger) or `role="status"` (the rest).
2. **Status icon** — `svg.icon`, `aria-hidden="true"`, first child. Shape per variant (see *Variants*);
   colour from the variant's icon token.
3. **Title** — `p.alert__title`. One short sentence, the first thing read.
4. **Body** — `p.alert__body`, column 2. The default slot; inline content only.
5. **Actions (optional)** — `div.alert__actions`, column 2. Present only when actions are projected.
6. **Dismiss (optional)** — `button.btn.btn--text` "Dismiss", the last item inside `.alert__actions`
   (which then always renders), so it sits in column 2 under the body.

Host: `bn-alert` is `display: block` and renders the `.alert` element inside it. Layout classes the page
adds (`stack` spacing, width) go on the host.

`bn-banner`:

1. **Container** — `.banner` (+ `.banner--{variant}`), full width, hairline bottom rule. Carries the
   role and `data-banner="{kind}"`.
2. **Inner row** — `div.wrap.banner__inner`. Uses the page container width and margins; a wrapping
   flex row.
3. **Status icon** — `svg.icon`, `aria-hidden="true"`.
4. **Text** — `p.banner__text`. One or two sentences.
5. **Action (optional)** — the default slot, one `btn btn--quiet btn--sm` link or button.
6. **Dismiss (optional)** — `button.icon-btn` with a 16 px close icon and an `aria-label`.

Host: `bn-banner` is `display: block`; the shell places it as the first element after the skip link,
before `bn-top-bar`.

## API

### Inputs

`bn-alert`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | no | Info adds no modifier; the others add `.alert--{variant}`. Danger sets `role="alert"`, the others `role="status"`. Also picks the icon. |
| `heading` | `string` | — | yes | Text of `.alert__title`. Translatable. |
| `dismissible` | `boolean` (`booleanAttribute`) | `false` | no | Renders the "Dismiss" text button. |
| `dismissLabel` | `string` | — | when `dismissible` | Visible label of the dismiss button, from the catalogue ("Dismiss"). |

`bn-banner`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | no | Info adds no modifier; the others add `.banner--{variant}`. Danger sets `role="alert"`, the others `role="status"`. Also picks the icon. |
| `text` | `string` | — | yes | Text of `.banner__text`. Translatable or announcement data. |
| `kind` | `'account' \| 'site' \| 'connection'` | — | no | Written to `data-banner`; page objects and the shell tell banners apart by it. |
| `dismissible` | `boolean` (`booleanAttribute`) | `false` | no | Renders the close `icon-btn`. False for the connection warning and the persistent site banner. |
| `dismissLabel` | `string` | — | when `dismissible` | `aria-label` of the close button, from the catalogue ("Dismiss banner"). |
| `autoDismissMs` | `number` | `0` | no | When above 0, emits `dismissed` after this many milliseconds of visible, unpaused time. The shell passes `6000` for success banners. 0 never auto-dismisses. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `bn-alert` `dismissed` | `void` | The dismiss button is activated. The alert does not remove itself; the consumer removes it. |
| `bn-banner` `dismissed` | `'user' \| 'timeout'` | The close button is activated (`'user'`), or the auto-dismiss time has run out (`'timeout'`). Emitted once per showing. The banner does not remove itself; `BannerService` does, and records a `'user'` dismissal in `DismissalStore`. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `bn-alert` default | Inline text and inline elements (`<a>`, `<strong>`, `<q>`) | Projected into `p.alert__body`. No block elements. |
| `bn-alert` `[slot=actions]` | One to three `a[bn-button]` / `button[bn-button]`, size `sm` | Projected into `div.alert__actions` in order. The first is the recovery action. Declared once. |
| `bn-banner` default | One `a[bn-button]` or `button[bn-button]`, variant `quiet`, size `sm` | Rendered after the text and before the close button. |

Every user-facing string (heading, body, text, action labels, dismiss labels) arrives through an input
or a slot from the translation catalogue (L2-052); neither component hard-codes copy.

## Variants and sizes

| Variant | Modifier | Icon | Role | Use for |
|---|---|---|---|---|
| Info | none (`.alert`, `.banner`) | circle with "i" (`M12 11v5M12 8h.01`) | `status` | Neutral state: event ended, matching paused, maintenance notice, reconnecting |
| Success | `.alert--success`, `.banner--success` | check (`m5 12.5 4.5 4.5L19 7.5`) | `status` | A save or setup that completed and stays confirmed on the page |
| Warning | `.alert--warning`, `.banner--warning` | triangle (`M12 4 3.5 19h17z`, `M12 10v4M12 16.5h.01`) | `status` | Something needs attention but nothing failed: event cancelled, verify e-mail, offline |
| Danger | `.alert--danger`, `.banner--danger` | circle with "!" (`M12 7.5v5M12 15.5h.01`) | `alert` | A request failed or access is about to stop |

Each component has one size; its width comes from its container (`bn-alert`) or the viewport
(`bn-banner`), and its height from the content. Spacing is fixed by the tokens in *Design*.

## States

Both components are passive: the container has no hover, focus, active or disabled state. Projected
buttons and links follow the [button](button.md) contract.

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default (info/success/warning) | rendered | Tinted fill, hairline border, icon, title, body | `role="status"` (polite live region); content added later is announced politely |
| Default (danger) | rendered | Danger tint and icon | `role="alert"`; announced at once when inserted, focus does not move |
| With actions | `[slot=actions]` filled | `.alert__actions` row under the body, wrapping | Actions in tab order after the body |
| Without actions | slot empty | No `.alert__actions` element in the DOM | — |
| Dismissible (alert) | `dismissible` | "Dismiss" text button, last in `.alert__actions` | Button named "Dismiss" |
| Dismissible (banner) | `dismissible` | Close `icon-btn` at the end of the row | Button named by `dismissLabel` ("Dismiss banner") |
| Not dismissible (banner) | `dismissible` false | No close button | — |
| Close hover | `:hover` on `.icon-btn` | `--color-bg-subtle` circle, icon to `--color-fg-default` | — |
| Close focus | `:focus-visible` | `--color-focus-ring` ring, `--focus-ring-width`, `--focus-ring-offset` | Focus stays on the button |
| Auto-dismissing (banner) | `autoDismissMs > 0` | Unchanged | Unchanged; the timer runs only while visible |
| Paused (banner) | pointer over the banner, or focus inside it | Unchanged | Timer stops; resumes with the remaining time when both leave |
| Long text | heading/body or text over the measure | Wraps; never truncates | Full text read |

## Markup

```html
<!-- rendered: bn-alert, danger, no actions (dialogs/pass-suggestion/failed) -->
<bn-alert>
  <div class="alert alert--danger" role="alert">
    <svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5M12 15.5h.01"></path></svg>
    <p class="alert__title">We couldn't pass on this suggestion</p>
    <p class="alert__body">Daniel is still in your three. Try again in a moment.</p>
  </div>
</bn-alert>
```

```html
<!-- rendered: bn-alert, danger, two actions (pages/dashboard/partial) -->
<div class="alert alert--danger" role="alert">
  <svg aria-hidden="true" class="icon" viewBox="0 0 24 24">…</svg>
  <p class="alert__title">We couldn't load your events</p>
  <p class="alert__body">Your matches are up to date. Events didn't load this time.</p>
  <div class="alert__actions">
    <button class="btn btn--quiet btn--sm" type="button">Try again</button>
    <a class="btn btn--text btn--sm" href="/events">Open events</a>
  </div>
</div>
```

```html
<!-- rendered: bn-alert, info, dismissible (design-system page) -->
<div class="alert" role="status">
  <svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 11v5M12 8h.01"></path></svg>
  <p class="alert__title">A note for local builders</p>
  <p class="alert__body">Check your email to finish joining Banaro.</p>
  <div class="alert__actions"><button class="btn btn--text" type="button">Dismiss</button></div>
</div>
```

Success adds `.alert--success` and the check icon; warning adds `.alert--warning` and the triangle icon
(`role="status"` for both).

```html
<!-- rendered: bn-banner, warning, action, dismissible (notifications/account-banner/warning) -->
<bn-banner>
  <div class="banner banner--warning" role="status" data-banner="account">
    <div class="wrap banner__inner">
      <svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="M12 4 3.5 19h17z"></path><path d="M12 10v4M12 16.5h.01"></path></svg>
      <p class="banner__text">Verify your e-mail to keep getting matches. We sent a link to amara@harvest.example.</p>
      <button class="btn btn--quiet btn--sm" type="button">Resend e-mail</button>
      <button aria-label="Dismiss banner" class="icon-btn" type="button"><svg aria-hidden="true" class="icon icon--sm" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>
    </div>
  </div>
</bn-banner>
```

```html
<!-- rendered: bn-banner, warning, not dismissible (notifications/connection-banner/warning) -->
<div class="banner banner--warning" role="status" data-banner="connection">
  <div class="wrap banner__inner">
    <svg aria-hidden="true" class="icon" viewBox="0 0 24 24">…</svg>
    <p class="banner__text">You are offline. What you write stays on this page until you reconnect.</p>
  </div>
</div>
```

```html
<!-- consumer -->
<bn-alert variant="danger" [heading]="'dashboard.events.failed.title' | translate">
  {{ 'dashboard.events.failed.body' | translate }}
  <button slot="actions" bn-button variant="quiet" size="sm" type="button" (click)="reloadEvents()">{{ 'common.tryAgain' | translate }}</button>
  <a slot="actions" bn-button variant="text" size="sm" routerLink="/events">{{ 'dashboard.events.open' | translate }}</a>
</bn-alert>

<bn-banner kind="connection" variant="danger" dismissible
           [text]="'connection.failed' | translate" [dismissLabel]="'banner.dismiss' | translate"
           (dismissed)="banners.dismiss('connection', $event)">
  <button bn-button variant="quiet" size="sm" type="button" (click)="connectivity.retry()">{{ 'common.tryAgain' | translate }}</button>
</bn-banner>

<bn-banner kind="connection" variant="success" dismissible [autoDismissMs]="6000"
           [text]="'connection.restored' | translate" [dismissLabel]="'banner.dismiss' | translate"
           (dismissed)="banners.dismiss('connection', $event)" />
```

The mocks render the banner action as `<a href="#">`; a control that runs code (resend, retry) is a
`<button type="button">`, a control that navigates (Finish profile, Status updates) is an `<a>` (D-6).
Page objects locate by `.alert`, `.alert--{variant}`, `.alert__title`, `.alert__body`,
`.alert__actions`, `.banner`, `[data-banner]`, `.banner__text` and the roles; those are the contract.

## Design

- `bn-alert`: grid `auto 1fr`, gap `--space-3` (row) × `--space-4` (column); padding `--space-5`; radius
  `--radius-md`; border `--border-width-hairline` solid. Icon `.icon` (`--space-5` square) nudged down by
  `--space-1` to sit on the title's first line. Title `--text-h4`; body `--text-body-sm` in
  `--color-fg-default`; actions a wrapping flex row with gap `--space-3`.
- `bn-banner`: bottom border `--border-width-hairline`; inner row `.wrap` (max width
  `--layout-container-max`, side padding `--layout-margin`), wrapping flex, `align-items: center`, gap
  `--space-3` × `--space-5`, padding-block `--space-3`. Text `--text-body-sm` in `--color-fg-default`,
  `flex: 1 1 var(--size-banner-text-flex-25)` so an action wraps below the text on narrow screens.
- Close button `.icon-btn`: `--target-comfortable` square, radius `--radius-full`, icon `.icon--sm`
  (`--space-4`).
- Motion: none on the containers. The close button's colour and background change over
  `--duration-fast` / `--duration-base` with `--ease-standard`, inside
  `prefers-reduced-motion: no-preference`.
- Elevation and layer: none; both are in the normal flow. The banner scrolls away with the page.

Component tokens: neither component declares its own custom properties. Variants re-skin through the
semantic status roles in *Colour*; a consumer never overrides colours.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Info fill | `--color-info-bg` | `--palette-fjord-100` | `--palette-fjord-900` |
| Info border | `--color-info-border` | `--palette-fjord-300` | `--palette-fjord-700` |
| Info title | `--color-info-fg` | `--palette-fjord-700` | `--palette-fjord-100` |
| Info icon | `--color-info-icon` | `--palette-fjord-700` | `--palette-fjord-300` |
| Success fill / border / title / icon | `--color-success-bg` / `--color-success-border` / `--color-success-fg` / `--color-success-icon` | `--palette-sage-50` / `--palette-sage-300` / `--palette-sage-700` / `--palette-sage-500` | `--palette-sage-950` / `--palette-sage-800` / `--palette-sage-200` / `--palette-sage-300` |
| Warning fill / border / title / icon | `--color-warning-bg` / `--color-warning-border` / `--color-warning-fg` / `--color-warning-icon` | `--palette-clay-100` / `--palette-clay-300` / `--palette-clay-700` / `--palette-clay-500` | `--palette-clay-900` / `--palette-clay-700` / `--palette-clay-300` / `--palette-clay-300` |
| Danger fill / border / title / icon | `--color-danger-bg` / `--color-danger-border` / `--color-danger-fg` / `--color-danger-icon` | `--palette-lingon-100` / `--palette-lingon-300` / `--palette-lingon-700` / `--palette-lingon-600` | `--palette-lingon-950` / `--palette-lingon-700` / `--palette-lingon-300` / `--palette-lingon-300` |
| Body and banner text | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Close icon | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Close hover fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-info-fg` | `--color-info-bg` | 4.5:1 | Info title |
| `--color-success-fg` | `--color-success-bg` | 4.5:1 | Success title |
| `--color-warning-fg` | `--color-warning-bg` | 4.5:1 | Warning title |
| `--color-danger-fg` | `--color-danger-bg` | 4.5:1 | Danger title |
| `--color-fg-default` | `--color-info-bg`, `--color-success-bg`, `--color-warning-bg`, `--color-danger-bg` | 4.5:1 | Body and banner text |
| `--color-info-icon` / `--color-success-icon` / `--color-warning-icon` / `--color-danger-icon` | the matching `-bg` | 3:1 | Status icon |
| `--color-fg-muted` | `--color-warning-bg` (and the other fills) | 3:1 | Close icon (non-text) |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring on actions and close |

The border is decorative (`--color-info-border` on the canvas is checked at 1:1 in
`contrast-pairs.json`): the icon and the words carry the meaning. In forced-colours mode the fill
disappears, the system border and text remain, and the icon keeps `currentColor`.

## Responsive behaviour

- `bn-alert` fills its container at every width. Title, body and actions wrap; actions wrap onto more
  lines rather than shrinking. Nothing truncates.
- `bn-banner` spans the viewport. Below about 36 rem of text width the action and the close button wrap
  onto a second line under the text (the `--size-banner-text-flex-25` basis); at 768 px and wider the
  icon, text, action and close sit on one line.
- Below about 22 rem of row width (320 and 360 px viewports) the text's flex basis no longer fits beside
  the icon, so the icon sits on its own line above the text, as the mocks render; this is intended and
  needs no extra rule.
- At 320 px nothing scrolls horizontally or clips (L2-049); at 200 % zoom every part stays available.
- Touch targets: the banner close button is `--target-comfortable` (44 px) square. Projected `sm`
  buttons reach 44 × 44 px below 576 px through the [button](button.md) rule.

## Accessibility

### Role and pattern

[WAI-ARIA alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) for danger (`role="alert"`);
info, success and warning use `role="status"` (polite). The live region is the container, so the title,
body and actions are read together. The status icon is decorative (`aria-hidden="true"`): the words
carry the status (L2-050).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Reach each projected action, then the dismiss control, in DOM order. The container is never a tab stop. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Native activation of the focused action or dismiss button. |
| <kbd>Escape</kbd> | No action; neither component is an overlay. |

### Focus

Neither component takes focus when it appears or changes. Focus stays where the person was (L2-050).
When a dismissed alert or banner is removed while its dismiss button has focus, the consumer moves
focus to the next logical target: for a banner, the skip link's target `#main`; for an alert, the
element that follows it, or its container. Focus rings are the shared 2 px `--color-focus-ring` ring
with `--focus-ring-offset`.

### Labelling

- The close button's accessible name is `dismissLabel` ("Dismiss banner"); the icon is hidden.
- The alert's "Dismiss" button is named by its visible text.
- A danger alert at the top of a form is not referenced by `aria-describedby` from fields; it is
  read once, when it appears.

### Announcements

- Danger: announced assertively the moment it is inserted, without moving focus.
- Info, success, warning: announced politely when inserted or when their text changes after
  insertion. An alert present in the server-rendered page is not announced on load (that is the page
  state, not a change).
- A banner whose variant changes (connection warning → info → success) is the same element with new
  content, so each change is announced once.

### Motion

No animation. The close button's colour transition is disabled under `prefers-reduced-motion: reduce`
by the global rule (L2-050).

## Content and internationalisation

- Title states what happened in a few words; the body says what is safe and what to do next: "We
  couldn't send your message" / "Your note is still here. Check your connection and try again."
- Banner text is one or two sentences and never names the page it is on (connection banners, L2-028).
- Dates and times follow L2-052: "Saturday 10 October, 2 to 3 am ET", "Monday 12 October", "9:30 pm".
- The 429 alert splits the required sentence across title and body: "Too many sign-in attempts." /
  "Try again in 15 minutes."; the minutes come from `Retry-After`, rounded up.
- Translatable inputs: `heading`, `text`, `dismissLabel`, body and action slot copy. Data values:
  names (Daniel, Harvest, Naomi Fraser's note), e-mail addresses, counts ("312 projects").
- Long copy wraps; French runs about 30 % longer and still wraps without truncation or overflow.

## Performance

- Change detection: `OnPush`, signal inputs; classes, role and icon are `computed`.
- Perf-test scenarios: `frontend/projects/perf-test/src/scenarios/Alert.ts` renders the contact success
  alert ("Message sent", amara@harvest.example, "Back to the home page"); `Banner.ts` renders the danger
  connection banner with "Try again". Iterations in `e2e/perf-test/config/scenario-iterations.mjs`
  keep each at roughly 100–300 ms.
- Composite scenarios: `DarkTheme` gains the `Banner` scenario when the dark wrapper is next extended.
- Layout stability: a banner that appears after first paint pushes the page down once; the shell
  reserves nothing. Banners from the server (site and account) are server-rendered so they are in
  place at first paint and cause no shift (L2-048).
- Weight: no dependencies beyond `@angular/core`. The banner timer uses `setTimeout`; no RxJS timers.

## Acceptance criteria

### Rendering

- **AC-1** Given the `ended` state of Fall Demo Night, when `<bn-alert heading="This event has ended">` renders with the body "The demos wrapped up at 9:30 pm. Here is how the evening went.", then it outputs `.alert` with no modifier, `role="status"`, the circle-and-"i" icon, `p.alert__title` "This event has ended" and `p.alert__body` holding the body. (L2-019)
- **AC-2** Given the `cancelled` state, when a warning alert renders "The host cancelled this event" with Naomi Fraser's quoted note, then it has `.alert.alert--warning`, `role="status"`, the triangle icon, and the full note wraps inside `.alert__body` without truncation. (L2-019)
- **AC-3** Given the contact form was sent, when the success alert "Message sent" renders with the action link "Back to the home page", then it has `.alert--success`, the check icon, `role="status"`, and the link sits inside `.alert__actions` as `.btn.btn--quiet.btn--sm`. (L2-040)
- **AC-4** Given the matching-setup form was saved, when the success alert "We have your search" renders without actions, then the DOM contains no `.alert__actions` element and no empty grid row below the body. (L2-021)
- **AC-5** Given the dashboard's events request failed, when the danger alert "We couldn't load your events" renders with "Try again" and "Open events", then both controls are inside `.alert__actions` in that order, and activating "Try again" reloads only the events section while the matches stay on screen. (L2-030)
- **AC-6** Given matching is paused, when the info alert "Paused since Friday 9 October" renders with a primary "Resume matching" button, then the button is in `.alert__actions` and is the first tab stop after the alert's text. (L2-025)

### States

- **AC-7** Given the `pass-suggestion` dialog's request failed, when the danger alert "We couldn't pass on this suggestion" is inserted, then it has `role="alert"`, is announced once by a screen reader, and focus stays on the dialog's "Pass" button. (L2-024)
- **AC-8** Given a wrong password on `/sign-in`, when the error state shows, then a danger alert reads "Those details don't match" / "Check your e-mail and password and try again, or reset your password." with a "Reset password" link action, and does not say which field was wrong. (L2-003)
- **AC-9** Given the sign-in endpoint answers 429 with `Retry-After: 840`, when the form shows it, then a danger alert at the top of the form reads, as one announcement, "Too many sign-in attempts. Try again in 14 minutes." (L2-003)
- **AC-10** Given the join endpoint answers 429 with `Retry-After: 150`, when the page shows it, then a danger alert reads "You're trying too fast. Wait 3 minutes, then try again." and the entered name Amara Osei stays in its field. (L2-001)
- **AC-11** Given an account banner for an unverified e-mail, when `<bn-banner kind="account" variant="warning" dismissible>` renders "Verify your e-mail to keep getting matches. We sent a link to amara@harvest.example." with "Resend e-mail", then it outputs `.banner.banner--warning[data-banner="account"]` with `role="status"`, the triangle icon, `.banner__text`, the action, and a close `.icon-btn` labelled "Dismiss banner". (L2-028)
- **AC-12** Given that account banner, when Amara activates "Dismiss banner", then `dismissed` emits `'user'` exactly once and the banner itself stays in the DOM until `BannerService` removes it. (L2-028)
- **AC-13** Given the site announcement "Planned maintenance on Saturday 10 October, 2 to 3 am ET. This notice stays until the work is done." is published as not dismissible, when the site banner renders, then it has no close button and no other way to dismiss it. (L2-028)
- **AC-14** Given the browser goes offline, when the connection banner shows "You are offline. What you write stays on this page until you reconnect.", then it is `.banner--warning` with `role="status"` and has no close button. (L2-028)
- **AC-15** Given six failed health probes, when the connection banner shows "We couldn't reconnect. Check your network, then try again." with "Try again", then it is `.banner--danger` with `role="alert"`, and activating "Try again" calls the consumer's handler once per press. (L2-028)
- **AC-16** Given the connection returns, when the success banner "Back online. Banaro is up to date." renders with `autoDismissMs` 6000 and nobody interacts with it, then `dismissed` emits `'timeout'` 6 seconds after it appeared. (L2-028)
- **AC-17** Given that success banner, when the pointer rests on it from second 4 to second 10 and then leaves, then `dismissed` has not emitted by second 10 and emits about 2 seconds later; the same holds when focus is inside the banner instead of the pointer. (L2-028)

### Keyboard and focus

- **AC-18** Given the danger connection banner, when the member presses Tab from the skip link, then focus reaches "Try again" and then "Dismiss banner", each with a visible 2 px focus ring of at least 3:1 against the danger fill. (L2-050)
- **AC-19** Given any page with a banner, when the page loads, then the skip link is still the first focusable element and the banner sits between it and the header. (L2-050)
- **AC-20** Given a design-system alert with `dismissible` and `dismissLabel="Dismiss"`, when the "Dismiss" button is activated with Enter, then `dismissed` emits once and focus is moved by the consumer to the element after the alert, never to the document body. (L2-050)

### Screen readers

- **AC-21** Given any variant of either component, when it renders, then the status is given by the words of the title or text and the icon has `aria-hidden="true"`, so no status depends on colour alone. (L2-050)
- **AC-22** Given the dashboard partial state, when the events alert is inserted after the page has loaded, then it is announced without focus moving from where the member was. (L2-050)

### Theming

- **AC-23** Given each variant in light and dark, when contrast is measured, then the title is at least 4.5:1 and the body text at least 4.5:1 against the fill, and the icon at least 3:1. (L2-050)
- **AC-24** Given a page showing a danger alert and a success banner, when the theme switches from light to dark, then their colours change through the status tokens alone, with no component input or code involved. (L2-051)

### Responsive

- **AC-25** Given a 320 px viewport, when the dashboard partial alert renders with its two actions, then the text wraps, the actions wrap onto the following line(s), and the page has no horizontal scroll. (L2-049)
- **AC-26** Given a 360 px viewport, when the account warning banner renders, then the action and the close button wrap below the text, the close button measures at least 44 × 44 px, and nothing is clipped. (L2-049)

### Content

- **AC-27** Given the `en-CA` catalogue, when any alert or banner renders, then its heading, text, action labels and dismiss label come from the catalogue and no English string is compiled into either component. (L2-052)

### Performance

- **AC-28** Given a change to either component, when the perf test runs `Alert` and `Banner` against the base branch with `--fail-on-regression`, then neither scenario is flagged as a possible regression. (L2-048)

## Implementation notes

Gaps between the built code and this CRD:

- `bn-alert` renders the danger "!" icon for info; info must use the circle-and-"i" icon and warning
  the triangle icon (mocks; AC-1, AC-2).
- `bn-alert` wraps the body in `div.alert__body`; the mocks use `p.alert__body`. Render a `<p>`
  (inline content only).
- `bn-alert` always renders `div.alert__actions`, leaving an empty grid row when no actions are
  projected. Render it only when actions are projected or `dismissible` is set (query the projected
  `[slot=actions]` nodes with `contentChildren`, or hide it with `:empty` in the component style; AC-4).
- `bn-alert` lacks `dismissible`, `dismissLabel` and `dismissed` (design-system "Dismissible" variant).
- `bn-banner` uses the danger "!" icon for warning; use the triangle (AC-11, AC-14).
- `bn-banner` defaults `dismissLabel` to the English "Dismiss banner"; make it required when
  `dismissible` (dev-mode assertion) and pass it from the catalogue (AC-27).
- `bn-banner` `dismissed` emits `void`; emit `'user' | 'timeout'` so `DismissalStore` records only a
  person's dismissal.
- `bn-banner` `kind` is a free `string`; narrow it to `'account' | 'site' | 'connection'`.
- `bn-banner` starts its timer in `ngOnInit` even during SSR; start it only in the browser
  (`afterNextRender`), so a server-rendered success banner never emits on the server.
- The detailed designs name `BannerStack`, `BannerService` and `DismissalStore` in `lib/banner/`; they
  compose `bn-banner` and are specified there, not here.
- Perf scenarios `Alert.ts` and `Banner.ts` exist; keep them as described in *Performance*.

## Decisions

- **D-1** *Which role does each variant carry?* Danger `alert`, the rest `status`, for both
  components. The mocks do this everywhere (including the warning "The host cancelled this event"), and
  L2-028 states it for toasts and connection banners; one rule keeps all status messages predictable.
- **D-2** *Which icon does each variant use?* Info the circle with "i", success the check, warning the
  triangle, danger the circle with "!", exactly as the mocks draw them. The design-system specimens use
  a placeholder plus icon, which the drift log treats as a stand-in.
- **D-3** *Does the alert render an empty actions row?* No. The mocks omit `.alert__actions` when there
  are no actions, and an empty grid item would add a `--space-3` gap under the body.
- **D-4** *Should `bn-alert` support dismissal although no mock dismisses one?* Yes, as the
  design-system page shows a "Dismissible" variant. It only emits; the consumer removes the alert and
  places focus, so the API never needs to change when a screen first uses it.
- **D-5** *Does the banner remove itself on dismiss or timeout?* No. It emits `dismissed` with the
  reason and `BannerService` removes it and decides whether to remember the dismissal (7 days for
  account banners, the device for site banners, never for a timeout), as the detailed design assigns.
- **D-6** *Is a banner action a link or a button?* A `<button type="button">` when it runs code
  (Resend e-mail, Send a new link, Try again) and an `<a>` when it navigates (Finish profile, Status
  updates). The mocks use `href="#"` placeholders, which are not valid controls for actions.
- **D-7** *How long does a success banner stay?* 6 seconds of visible, unpaused time for every success
  banner. L2-028 criterion 8 sets 6 seconds for the connection success banner; the account and site
  success mocks say 8 seconds, but one duration for every success message (toasts too, L2-028 criterion
  1) is easier to learn. The banner takes the time as `autoDismissMs`, so the shell can change it
  without touching the component. Listed for the lead to confirm.
- **D-8** *Is the connection info banner ("Reconnecting…") dismissible?* Yes, as the mock draws a close
  button and L2-028 criterion 8 only says it clears when the connection returns. Only the warning
  banner (L2-028) and the persistent site banner (mock) have no close button.
- **D-9** *Does the home page's partial state show a danger alert for the failed section?* The
  component supports it as drawn in `pages/home/partial`, but L2-039 criterion 3 says the failed
  section is hidden "without an error message block". The page follows L2-039 and does not render the
  alert; the CRD keeps the configuration because the dashboard partial (L2-030 criterion 3) needs the
  same one. Listed for the lead.
- **D-10** *Profile and settings success: alert or toast?* The mocks show a success alert on
  `profile-edit/success` and `settings/success`, while L2-007 criterion 4 asks for a confirmation toast
  on profile save. The alert supports the mock; which one the page shows is the page's decision and is
  listed for the lead. No criterion here depends on it.
- **D-11** *Where does a 429 message go?* A danger `bn-alert` at the top of the form, title and body
  together forming the required sentence, so it is announced once with `role="alert"` (L2-001, L2-003,
  L2-004, L2-005). No mock draws it; this matches the sign-in error alert's placement.
- **D-12** *Does the banner's auto-dismiss pause on hover and focus separately?* The timer is paused
  while either the pointer is over the banner or focus is inside it, and resumes with the remaining time
  only when both have left (L2-028 criterion 7).
- **D-13** *Where does the alert's "Dismiss" button sit?* Inside `.alert__actions`, after any
  actions. The design-system specimen places it as a direct grid child, which drops it into the icon
  column; inside the actions row it lines up with the text, as the actions do.
