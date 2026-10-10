# Auth card

| Field | Value |
|---|---|
| Selector | `bn-auth-card` |
| Library path | `frontend/projects/components/src/lib/auth-card/` |
| Status | built |
| Traces to | L2-001, L2-002, L2-003, L2-004, L2-006, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`patterns/forms.html`](../../design-system/patterns/forms.html) (no component page) |
| Source mocks | [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/sign-in/invalid`](../../mocks/pages/sign-in/invalid.html), [`pages/sign-in/submitting`](../../mocks/pages/sign-in/submitting.html), [`pages/sign-in/error`](../../mocks/pages/sign-in/error.html), [`pages/sign-in/signed-out`](../../mocks/pages/sign-in/signed-out.html), [`pages/join/default`](../../mocks/pages/join/default.html), [`pages/join/invalid`](../../mocks/pages/join/invalid.html), [`pages/join/submitting`](../../mocks/pages/join/submitting.html), [`pages/join/success`](../../mocks/pages/join/success.html), [`pages/forgot-password/default`](../../mocks/pages/forgot-password/default.html), [`pages/forgot-password/success`](../../mocks/pages/forgot-password/success.html), [`pages/reset-password/default`](../../mocks/pages/reset-password/default.html), [`pages/reset-password/error`](../../mocks/pages/reset-password/error.html), [`pages/reset-password/success`](../../mocks/pages/reset-password/success.html), [`pages/verify-email/default`](../../mocks/pages/verify-email/default.html), [`pages/verify-email/success`](../../mocks/pages/verify-email/success.html), [`pages/verify-email/error`](../../mocks/pages/verify-email/error.html), [`pages/onboarding/default`](../../mocks/pages/onboarding/default.html), [`pages/onboarding/skills`](../../mocks/pages/onboarding/skills.html), [`pages/onboarding/goals`](../../mocks/pages/onboarding/goals.html), [`pages/onboarding/success`](../../mocks/pages/onboarding/success.html) |
| Rendering | [`auth-card.html`](auth-card.html) |

## Purpose and scope

The auth card is the calm, centred card every identity screen sits in: "Sign in — Welcome back.
Pick up where you left off.", "Join Banaro", "Check your e-mail", "Choose a new password", and the
wider onboarding card "Welcome, let's set up your profile". It holds the page's only `h1`, an
optional icon tile for result states, the projected form or actions, and an optional line below
("New to Banaro? Join Banaro").

The form inside is built with [form layout](form-layout.md), [form field](form-field.md) and
[button](button.md); the onboarding progress is the [stepper](stepper.md). Full-page errors that are
not identity states use the [error page](error-page.md).

Out of scope:

- Validation, submission, throttling messages and what each state says (the identity pages,
  L2-001 to L2-004).
- The page's `h1` focus on route change, which the page triggers through `focusHeading()`.
- The alerts inside the card ([alert](alert.md)).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/sign-in/default`, `invalid`, `submitting`, `error` | default width, no icon | "Sign in" / "Welcome back. Pick up where you left off."; form; alt "New to Banaro? Join Banaro" | form default, invalid, submitting, error alert | surface card on canvas |
| `pages/sign-in/signed-out` | icon `check` | "You're signed out"; actions "Sign in again", "Back to the home page" | heading focused on arrival | surface |
| `pages/join/default`, `invalid`, `submitting` | no icon | "Join Banaro" / "Free for Christian builders in Toronto and the GTA. It takes about two minutes."; alt "Already a member? Sign in" | form states | surface |
| `pages/join/success`, `pages/forgot-password/success` | icon `mail`, no alt | "Check your e-mail" / "We sent a confirmation link to amara@harvest.example…" | result | surface |
| `pages/forgot-password/default`, `invalid`, `submitting` | no icon | "Forgot your password?"; alt "Back to sign in" | form states | surface |
| `pages/reset-password/default`, `invalid`, `submitting` | no icon, no alt | "Choose a new password" / "Choose a new password for amara@harvest.example." | form states | surface |
| `pages/reset-password/error` | icon `clock` | "This link has expired" | result | surface |
| `pages/reset-password/success` | icon `check` | "Password updated" | result | surface |
| `pages/verify-email/default` | icon `mail` | "Confirm your e-mail"; "Send the link again", "Need help?" | default | surface |
| `pages/verify-email/success` | icon `check` | "E-mail confirmed" / "Thank you, Amara…" | result | surface |
| `pages/verify-email/error` | icon `alert` | "We couldn't confirm that link" | result | surface |
| `pages/onboarding/default`, `invalid`, `skills`, `goals`, `submitting` | width `wide`, stepper in `[slot=lead]` | "Welcome, let's set up your profile", "What do you bring?", "What are you hoping for?" | form states | surface |
| `pages/onboarding/success` | width `wide`, icon `check` | "Welcome to Banaro, Amara" | result | surface |

## Anatomy

1. **Frame** — `div.auth`. Centres the card with block padding `--space-16` / `--space-24`.
2. **Card** — `section.auth__card`, `aria-labelledby` the title. Grid, gap `--space-8`, radius
   `--radius-xl`, hairline `--color-border-default`, `--color-bg-surface`.
3. **Lead (optional)** — content projected before the header, the stepper.
4. **Header** — `div` grouping icon, title and sub.
5. **Icon tile (optional)** — `span.empty__icon` with one `svg.icon`, `aria-hidden="true"`.
6. **Title** — `h1.auth__title#auth-title`, `tabindex="-1"` so the page can focus it.
7. **Sub (optional)** — `p.auth__sub`, `--color-fg-muted`.
8. **Body** — the projected form or actions.
9. **Alt line (optional)** — `p.auth__alt`, centred, `--text-body-sm`; hidden when empty.

Host: `bn-auth-card` is `display: block`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | The `h1` text. |
| `sub` | `string \| undefined` | `undefined` | no | Renders `p.auth__sub` when set. |
| `icon` | `'mail' \| 'check' \| 'alert' \| 'clock' \| undefined` | `undefined` | no | Renders the icon tile for result states. |
| `width` | `'default' \| 'wide'` | `'default'` | no | `wide` caps the card at `--size-dialog--lg-max-width-28` (40 rem) for onboarding; default caps it at `--size-auth-card-max-width-33` (30 rem). |

### Methods

| Method | Rule |
|---|---|
| `focusHeading()` | Moves focus to the `h1` (it has `tabindex="-1"`), for result states that replace a form. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — the card is a container; its content owns the actions. | | |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=lead]` | one element, the `bn-stepper` | Rendered first in the card, before the header. |
| default | the form, a `div.form-actions` of actions, alerts | Rendered after the header. |
| `[slot=alt]` | inline text and one link | Rendered inside `p.auth__alt`; the paragraph is hidden when nothing is projected. |

Each slot is declared once.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Form | no icon | Sign in, join, forgot and reset password forms. |
| Result | `icon` set | Success, error and signed-out states. |
| Wide | `width="wide"` → `.auth__card--wide` | Onboarding steps and onboarding success. |

| Size | Max width | Padding | Title |
|---|---|---|---|
| Default | `--size-auth-card-max-width-33` | `--space-8` / `--space-6` below 40 rem, `--space-12` from 40 rem | `--text-h1` at `--font-size-3xl` |
| Wide | `--size-dialog--lg-max-width-28` | same | same |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Form default | page state | Header, form, alt line | Region named by the `h1` |
| Form invalid, submitting, error | page state | Unchanged card; the form shows its states | — |
| Result: mail, check, alert, clock | `icon` | Icon tile above the title in `--color-accent-subtle` / `--color-fg-accent` | Icon hidden; title and sub read |
| Heading focused | `focusHeading()` | Focus ring on the `h1` only while focus came from the keyboard path (`:focus-visible`) | Title announced |
| Without alt | nothing in `[slot=alt]` | No alt line, no gap | Nothing read |
| Hover, active, disabled | — | None: the card is not interactive | — |

## Markup

```html
<!-- rendered: form -->
<div class="auth">
  <section class="auth__card" aria-labelledby="auth-title">
    <div><h1 class="auth__title" id="auth-title" tabindex="-1">Sign in</h1><p class="auth__sub">Welcome back. Pick up where you left off.</p></div>
    <form class="form" novalidate aria-label="Sign in">…</form>
    <p class="auth__alt">New to Banaro? <a href="/join">Join Banaro</a></p>
  </section>
</div>
```

```html
<!-- rendered: result with icon -->
<div class="auth">
  <section class="auth__card" aria-labelledby="auth-title">
    <div><span class="empty__icon"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg></span><h1 class="auth__title" id="auth-title" tabindex="-1">Check your e-mail</h1><p class="auth__sub">We sent a confirmation link to amara@harvest.example. Open it on this device to finish joining.</p></div>
    <div class="form-actions">…</div>
  </section>
</div>
```

```html
<!-- rendered: wide with stepper -->
<div class="auth">
  <section class="auth__card auth__card--wide" aria-labelledby="auth-title">
    <bn-stepper>…</bn-stepper>
    <div><h1 class="auth__title" id="auth-title" tabindex="-1">What do you bring?</h1><p class="auth__sub">Pick the skills you would offer a teammate, or want to learn alongside one.</p></div>
    <form class="form" novalidate aria-label="Profile step 2 of 3">…</form>
  </section>
</div>
```

Icon paths: `mail` — envelope (`rect` + `m4 7 8 6 8-6`); `check` — `m5 12.5 4.5 4.5L19 7.5`; `alert`
— circle + `M12 7.5v5M12 15.5h.01`; `clock` — circle + `M12 7.5V12l3 2`.

```html
<!-- consumer -->
<bn-auth-card [heading]="'identity.signIn.title' | t" [sub]="'identity.signIn.sub' | t">
  <form bn-form …>…</form>
  <span slot="alt">{{ 'identity.signIn.alt' | t }} <a routerLink="/join">{{ 'identity.signIn.join' | t }}</a></span>
</bn-auth-card>
<bn-auth-card width="wide" [heading]="'onboarding.skills.title' | t" [sub]="'onboarding.skills.sub' | t">
  <bn-stepper slot="lead" … />
  <form bn-form …>…</form>
</bn-auth-card>
```

## Design

- Frame: grid, `justify-items: center`, block padding `--space-16` top, `--space-24` bottom.
- Card: width 100 %, gap `--space-8`, padding `--space-8` / `--space-6`, from 40 rem
  `--space-12`; radius `--radius-xl`; rule `--border-width-hairline`.
- Title `--text-h1` at `--font-size-3xl`, letter spacing `--letter-spacing-tight`; sub margin-top
  `--space-3`.
- Icon tile `--size-quote-photo-width-9` × `--size-quote-photo-height-10`, radius `--radius-md`;
  icon `--size-empty-icon-icon-width-32` wide.
- Alt line `--text-body-sm`, centred.

The wide modifier is component-scoped (`.auth__card--wide`); there are no `--bn-` tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Page | `--color-bg-canvas` | `--palette-oat-100` | `--palette-night-950` |
| Card | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Card rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Sub, alt line | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Icon tile | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Icon | `--color-fg-accent` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Title |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Sub and alt line |
| `--color-fg-accent` | `--color-accent-subtle` | 3:1 | Icon (graphic) |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Heading and link focus |

## Responsive behaviour

- Below 40 rem the card padding is `--space-8` / `--space-6`; from 40 rem it is `--space-12`.
- The card is full width up to its cap, so at 320 px it fills the column with the page gutter.
- At 320 px nothing scrolls horizontally or clips (long e-mail addresses in the sub wrap with
  `overflow-wrap: anywhere`); at 200 % zoom everything stays available; links in the alt line are
  at least 44 px tall including line height and padding from the paragraph.

## Accessibility

### Role and pattern

A `section` named by its `h1`. The card provides the page's only `h1` (L2-050).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Moves through the projected content in DOM order: lead, form, alt link. The card adds no tab stops. |

### Focus

`focusHeading()` focuses the `h1`. Pages call it when a result replaces a form (join success,
forgot-password success, reset success, verify-email result, signed-out), so the new title is
announced. On a failed submit focus goes to the first invalid field, not the heading (L2-001).

### Labelling

The section is labelled by the title id. Icons are `aria-hidden="true"`; the title carries the
meaning, so the icon's colour is never the only signal.

### Announcements

None from the card. Alerts inside it announce themselves.

### Motion

None.

## Content and internationalisation

- Titles are short and say what happened or what to do: "Sign in", "Check your e-mail", "This
  link has expired", "Password updated".
- The sub explains the next step and may name the e-mail address: "We sent a link to
  amara@harvest.example. Open it to finish joining Banaro."
- The alt line is a question and a link: "New to Banaro? Join Banaro", "Already a member? Sign
  in", or just "Back to sign in".
- Translatable inputs and slots: `heading`, `sub`, the alt content. Data values: the e-mail
  address and member's first name, interpolated by the catalogue.

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/AuthCard.ts` renders the sign-in
  card ("Sign in", "Welcome back. Pick up where you left off.", e-mail and password fields, the
  alt line); iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme` gains the card.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf
  test against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: the card is server-rendered with its title; switching from form to result is
  a user-initiated change.

## Acceptance criteria

### Rendering

- **AC-1** Given `/sign-in`, when it renders, then the auth card is a `section.auth__card` labelled by `h1#auth-title` "Sign in", with the sub "Welcome back. Pick up where you left off." and the alt line "New to Banaro? Join Banaro". (L2-003)
- **AC-2** Given `/join` succeeds, when the success state renders, then the card shows the `mail` icon tile, the title "Check your e-mail" and no alt line. (L2-001)
- **AC-3** Given `/reset-password` with an expired link, when the error state renders, then the card shows the `clock` icon tile and the title "This link has expired". (L2-004)
- **AC-4** Given `/verify-email` with a used link, when the error state renders, then the card shows the `alert` icon tile and "We couldn't confirm that link"; on success it shows the `check` tile and "E-mail confirmed". (L2-002)
- **AC-5** Given onboarding on the skills step, when it renders, then the card has `.auth__card--wide`, is at most 40 rem wide, and shows the stepper before the title "What do you bring?". (L2-006)
- **AC-6** Given any identity page, when it renders, then the card's title is the page's only `h1`. (L2-050)

### States

- **AC-7** Given `/reset-password` with no alt content, when it renders, then no visible alt line or extra gap appears below the form. (L2-004)

### Keyboard and focus

- **AC-8** Given a member who signs out, when the signed-out state renders and the page calls `focusHeading()`, then focus is on "You're signed out" and a screen reader announces it. (L2-003)
- **AC-9** Given the join form, when Amara tabs from the last field, then focus moves through the submit button to the "Sign in" link in the alt line with no stop on the card itself. (L2-050)

### Screen readers

- **AC-10** Given any result state with an icon, when a screen reader reads the card, then the icon is not announced and the title and sub are. (L2-050)
- **AC-11** Given the en-CA catalogue, when the card renders, then its title, sub and alt line come from the catalogue with the e-mail address interpolated. (L2-052)

### Theming

- **AC-12** Given the dark theme, when the sign-in card renders, then the card, title and sub change through tokens only, with title and sub at least 4.5:1 against the card. (L2-051)

### Responsive

- **AC-13** Given a 320 px viewport, when "Check your e-mail" renders with "amara@harvest.example", then the card fills the column, the address wraps if needed, and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-14** Given the `AuthCard` perf-test scenario, when the perf test runs against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

The current code renders `heading`, `sub`, `icon` (`mail`, `check`, `alert`), the default slot and
`[slot=alt]`. Gaps:

- Add `'clock'` to `AuthCardIcon` with the reset-password error path.
- Add the `width` input and the component-scoped `.auth__card--wide` rule using
  `--size-dialog--lg-max-width-28`.
- Add the `[slot=lead]` slot before the header for the stepper.
- Add `tabindex="-1"` to the `h1` and a public `focusHeading()` method.
- Add `overflow-wrap: anywhere` to `.auth__sub` so long addresses wrap at 320 px.
- Add the missing `AuthCard.ts` perf-test scenario and export it from `src/scenarios/index.ts`.
- The `.empty__icon` rules are copied into `auth-card.css`; keep them in step with the empty-state
  component if it changes.

## Decisions

- **D-1** *There is no design-system page for the auth card. What is its source of truth?* The
  `.auth` rules in `components.css`, the forms pattern page and the identity and onboarding mocks.
  The design system should add a page; raised to the lead.
- **D-2** *Onboarding widens the card with an inline `style="max-width: 40rem"`. How does the
  component express it?* A `width="wide"` input and a component-scoped `.auth__card--wide`
  modifier using `--size-dialog--lg-max-width-28`, the only 40 rem size token. The design system
  should add an auth-card width token.
- **D-3** *The onboarding mock uses `id="ob-title"`; the others use `auth-title`. Configurable?*
  No. There is one card per page, so the fixed `auth-title` never clashes.
- **D-4** *How does an empty alt line behave?* The paragraph stays in the DOM and is hidden by
  `.auth__alt:empty`, which takes it out of the grid's gaps and the accessibility tree, matching
  the mocks that omit it.
- **D-5** *The reset-password error mock uses a clock icon the code lacks.* Added as `clock`.
