# Banaro design system

Extracted from [docs/mocks](../mocks/README.md) on 9 October 2026. Open [index.html](index.html) from disk. The current evidence includes 49 screens and 196 mock states.

## Foundations

| Page | Covers |
|---|---|
| [Color](foundations/color.html) | Oat, birch, sage and winter charcoal |
| [Typography](foundations/typography.html) | Manrope for a calm local community |
| [Spacing](foundations/spacing.html) | A 4px rhythm with generous room |
| [Layout](foundations/layout.html) | A grid that follows the mocks |
| [Elevation](foundations/elevation.html) | Hairlines before boxes |
| [Shape](foundations/shape.html) | Soft corners, small square portraits |
| [Motion](foundations/motion.html) | Slow and quiet, only when welcome |
| [Iconography](foundations/iconography.html) | A restrained 24-unit line set |
| [Theming](foundations/theming.html) | Roles carry light and dark |
| [Responsive](foundations/responsive.html) | Mobile-first without losing context |
| [Accessibility](foundations/accessibility.html) | Accessibility is part of each component |
| [Content](foundations/content.html) | Warm, plain and neighbourly |

## Components

| Component | Variants | Additional states | Source evidence |
|---|---|---|---|
| [Button](components/button.html) | primary, secondary, ghost, link, danger, leading icon, trailing icon, icon only, block | loading, pressed, expanded | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Button group](components/button-group.html) | actions, segmented, toolbar | pressed | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Link](components/link.html) | inline, standalone, external | visited | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Menu](components/menu.html) | plain, icons, sections, shortcuts, danger, checkable | open, checked | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Text field](components/text-field.html) | text, email, password, number, search, prefix, suffix, counter | invalid, read-only, required | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Textarea](components/textarea.html) | plain, counter, auto grow | invalid, read-only, required | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Select](components/select.html) | native, placeholder | invalid, required | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Checkbox](components/checkbox.html) | single, group, description | checked, indeterminate, invalid | [dialogs/delete-project/default.html](../mocks/dialogs/delete-project/default.html) |
| [Radio group](components/radio-group.html) | vertical, horizontal, card | checked, invalid | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Switch](components/switch.html) | label left, label right, description | checked | [pages/matching-setup/default.html](../mocks/pages/matching-setup/default.html) |
| [Slider](components/slider.html) | single, label and ticks | Passive content / native states | [dialogs/say-hello/default.html](../mocks/dialogs/say-hello/default.html) |
| [File upload](components/file-upload.html) | drop zone, button, file list | dragging, loading, invalid, failed | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Form field](components/form-field.html) | label help, required, error, counter | invalid, required | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Form layout](components/form-layout.html) | single column, two column, inline, actions, error summary | loading, invalid | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Top bar](components/top-bar.html) | signed out, signed in, with search, compact | open | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Sidebar navigation](components/sidebar-navigation.html) | grouped, collapsible, badges, icons | current, expanded | [dialogs/delete-account/default.html](../mocks/dialogs/delete-account/default.html) |
| [Tabs](components/tabs.html) | underline, pill, counts, scrollable | selected | [pages/events/default.html](../mocks/pages/events/default.html) |
| [Breadcrumb](components/breadcrumb.html) | full, collapsed | current | [dialogs/block-builder/default.html](../mocks/dialogs/block-builder/default.html) |
| [Pagination](components/pagination.html) | load more, numbered, previous next, page size | current, loading | [dialogs/say-hello/default.html](../mocks/dialogs/say-hello/default.html) |
| [Stepper](components/stepper.html) | horizontal, vertical, descriptions | current, complete, invalid | [pages/onboarding/default.html](../mocks/pages/onboarding/default.html) |
| [Footer](components/footer.html) | simple, multi column | Passive content / native states | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Skip link](components/skip-link.html) | default, focused | Passive content / native states | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Card](components/card.html) | builder, interactive, header footer, media, selected | selected | [dialogs/say-hello/default.html](../mocks/dialogs/say-hello/default.html) |
| [Accordion](components/accordion.html) | single open, multiple open, icon | expanded | [dialogs/block-builder/default.html](../mocks/dialogs/block-builder/default.html) |
| [Dialog](components/dialog.html) | default, destructive, form, scrollable, mobile sheet | loading, invalid, failed, open | [dialogs/block-builder/default.html](../mocks/dialogs/block-builder/default.html) |
| [Drawer and sheet](components/drawer.html) | bottom, left, right | open, loading | [dialogs/say-hello/default.html](../mocks/dialogs/say-hello/default.html) |
| [Popover](components/popover.html) | title, actions, form | open | [dialogs/block-builder/default.html](../mocks/dialogs/block-builder/default.html) |
| [Tooltip](components/tooltip.html) | text, shortcut | open | Core extension from shared tokens; no mock use yet. |
| [Divider](components/divider.html) | horizontal, vertical, labelled | Passive content / native states | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Container, grid and stack](components/container-grid-stack.html) | container, grid, stack, cluster | Passive content / native states | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Table](components/table.html) | default, dense, sortable, selectable, row actions, sticky, expandable | loading, selected, empty, error | Core extension from shared tokens; no mock use yet. |
| [List](components/list.html) | simple, two line, avatar, interactive, dividers | selected | [dialogs/cancel-rsvp/default.html](../mocks/dialogs/cancel-rsvp/default.html) |
| [Description list](components/description-list.html) | horizontal, vertical | Passive content / native states | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Avatar](components/avatar.html) | image, initials, icon, group, status | Passive content / native states | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Badge and status](components/badge.html) | neutral, info, success, warning, danger, solid, count | Passive content / native states | [dialogs/cancel-rsvp/default.html](../mocks/dialogs/cancel-rsvp/default.html) |
| [Chip and tag](components/chip.html) | filter, removable, static | selected | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Stat and KPI](components/stat.html) | value, delta, loading | loading | [pages/home/default.html](../mocks/pages/home/default.html) |
| [Code block](components/code-block.html) | inline, block, copy | copied | Core extension from shared tokens; no mock use yet. |
| [Timeline and activity](components/timeline.html) | activity, notifications | Passive content / native states | [pages/notifications/default.html](../mocks/pages/notifications/default.html) |
| [Toast](components/toast.html) | info, success, warning, danger, action, stacked | leaving | [notifications/rsvp-toast/danger.html](../mocks/notifications/rsvp-toast/danger.html) |
| [Alert and banner](components/alert.html) | inline info, inline success, inline warning, inline danger, page banner, actions, dismissible | Passive content / native states | [dialogs/block-builder/failed.html](../mocks/dialogs/block-builder/failed.html) |
| [Inline message](components/inline-message.html) | hint, error, success | Passive content / native states | [dialogs/change-photo/default.html](../mocks/dialogs/change-photo/default.html) |
| [Progress bar](components/progress-bar.html) | determinate, indeterminate, label value, success, danger | loading | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Spinner](components/spinner.html) | small, medium, large, inline | Passive content / native states | [dialogs/block-builder/busy.html](../mocks/dialogs/block-builder/busy.html) |
| [Skeleton](components/skeleton.html) | text, title, circle, rectangle, card, row | Passive content / native states | [pages/builder-profile/loading.html](../mocks/pages/builder-profile/loading.html) |
| [Empty state](components/empty-state.html) | first run, no results, permission, error | Passive content / native states | [pages/builder-profile/error.html](../mocks/pages/builder-profile/error.html) |
| [Error page](components/error-page.html) | 404, 403, 500, offline, maintenance | Passive content / native states | [pages/forbidden/default.html](../mocks/pages/forbidden/default.html) |
| [Brand](components/brand.html) | wordmark, mark | Passive content / native states | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Page header](components/page-header.html) | default, actions, breadcrumb | Passive content / native states | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Hero](components/hero.html) | promise, photo, testimonial | Passive content / native states | [pages/home/default.html](../mocks/pages/home/default.html) |
| [Feature area](components/feature-area.html) | directory, projects, events, matching | Passive content / native states | [pages/home/default.html](../mocks/pages/home/default.html) |
| [Featured builder](components/person.html) | portrait, initials, status | Passive content / native states | [pages/home/default.html](../mocks/pages/home/default.html) |
| [Project card](components/project-card.html) | compact, list, stage | Passive content / native states | [pages/home/default.html](../mocks/pages/home/default.html) |
| [Event row](components/event-row.html) | date row, capacity, cancelled | Passive content / native states | [dialogs/account-menu/default.html](../mocks/dialogs/account-menu/default.html) |
| [Testimonial and verse](components/testimonial.html) | testimonial, verse | Passive content / native states | [pages/home/default.html](../mocks/pages/home/default.html) |
| [Matching invitation](components/matching-panel.html) | invitation, suggestion, paused | Passive content / native states | [pages/home/default.html](../mocks/pages/home/default.html) |
| [Search and filter toolbar](components/search-filter-toolbar.html) | search, sort, active filters | loading, selected | [dialogs/say-hello/default.html](../mocks/dialogs/say-hello/default.html) |
| [Profile header](components/profile-header.html) | portrait, initials, owner actions | Passive content / native states | [dialogs/block-builder/default.html](../mocks/dialogs/block-builder/default.html) |
| [Message thread](components/message-thread.html) | received, sent, failed | failed | [pages/messages/default.html](../mocks/pages/messages/default.html) |
| [Inbox](components/inbox.html) | default, current, unread | selected | [pages/messages/default.html](../mocks/pages/messages/default.html) |
| [Notification item](components/notification-item.html) | read, unread, action | selected | [pages/notifications/default.html](../mocks/pages/notifications/default.html) |
| [Feedback comment](components/comment.html) | default, new, owner | Passive content / native states | [dialogs/give-feedback/default.html](../mocks/dialogs/give-feedback/default.html) |
| [Project screenshot](components/screenshot-tile.html) | image, illustrated, caption | Passive content / native states | [dialogs/give-feedback/default.html](../mocks/dialogs/give-feedback/default.html) |
| [RSVP panel](components/rsvp-panel.html) | available, going, full, cancelled | loading, selected | [dialogs/cancel-rsvp/default.html](../mocks/dialogs/cancel-rsvp/default.html) |
| [Danger zone](components/danger-zone.html) | account, project, typed confirmation | invalid, loading | [dialogs/delete-project/default.html](../mocks/dialogs/delete-project/default.html) |
| [Prose and legal content](components/prose.html) | body, legal, contact | Passive content / native states | [dialogs/block-builder/default.html](../mocks/dialogs/block-builder/default.html) |

## Patterns

| Pattern | Covers |
|---|---|
| [Forms](patterns/forms.html) | Collect a clear answer, preserve it, and explain the next step. |
| [Feedback and loading](patterns/feedback.html) | Choose feedback by what changed and how long it matters. |
| [Empty and error states](patterns/empty-states.html) | Keep the task understandable when content is absent. |
| [Navigation and page structure](patterns/navigation.html) | Keep destinations, hierarchy and reading order predictable. |
| [Dialogs and overlays](patterns/dialogs.html) | Ask for a focused decision without losing the page context. |
| [Data tables and lists](patterns/tables.html) | Make comparison and browsing readable at every width. |
| [Notifications](patterns/notifications.html) | Choose a channel by urgency and how long the information matters. |
| [Content and tone](patterns/content.html) | Use concrete, welcoming copy for builders nearby. |

## Tokens

- [tokens.css](tokens/tokens.css): source of truth for primitives, semantic roles, light/dark, responsive and user-preference overrides.
- [tokens.json](tokens/tokens.json): DTCG 2025.10 export with typed values, aliases and theme extensions under com.banaro.css. CSS-only relative and fluid geometry is preserved exactly in extension metadata; portable dimensions use a 16px reference and the narrow endpoint. CSS remains authoritative for breakpoint and preference overrides.
- [contrast-pairs.json](tokens/contrast-pairs.json): all declared foreground/background combinations.
- [components.css](assets/components.css): extracted BEM classes, semantic component aliases and static interaction hooks.

252 distinct token names. Every token has one owning foundation page; component token tables reference those roles. The type family is Manrope, with JetBrains Mono for code. Offline fonts and selected source photography are bundled with their licence notes.

## Drift found in the mocks

| Mock / selector | Issue | Resolution |
|---|---|---|
| `All mocks` | Medium corners were 14px, off the 4px grid. | Use --radius-md at 16px; other radii and four elevations retained. |
| `Fields and metadata` | Subtle text on linen wells and control borders needed more contrast margin. | Deepen stone-600 to #625d53 and stone-500 to #81796b; verify every pairing. |
| `.nav__link[aria-current="page"]::after` | width: 0.3rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.nav__link[aria-current="page"]::after` | height: 0.3rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `/* ---------- Pill tags and status ------------------------------------------ */ .pill` | min-height: 1.625rem | Normalise to 1.75rem; alias a spacing or component geometry role. |
| `.icon-btn__count` | min-width: 1.125rem | Normalise to 1.25rem; alias a spacing or component geometry role. |
| `.icon-btn__count` | height: 1.125rem | Normalise to 1.25rem; alias a spacing or component geometry role. |
| `.icon-btn__count` | font: 0.6875rem | Normalise to 0.75rem; alias a spacing or component geometry role. |
| `.check__box` | width: 1.125rem | Normalise to 1.25rem; alias a spacing or component geometry role. |
| `.check__box` | height: 1.125rem | Normalise to 1.25rem; alias a spacing or component geometry role. |
| `.check__box::after` | height: 0.3rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.check__box[type="radio"]::after` | width: 0.375rem | Normalise to 0.5rem; alias a spacing or component geometry role. |
| `.check__box[type="radio"]::after` | height: 0.375rem | Normalise to 0.5rem; alias a spacing or component geometry role. |
| `.pager__meter span` | min-width: 0.375rem | Normalise to 0.5rem; alias a spacing or component geometry role. |
| `50%` | box-shadow: 0.3rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.field__error .icon` | margin-top: 0.15rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.choice input` | margin-top: 0.2rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.choice input` | width: 1.125rem | Normalise to 1.25rem; alias a spacing or component geometry role. |
| `.choice input` | height: 1.125rem | Normalise to 1.25rem; alias a spacing or component geometry role. |
| `.switch__control` | height: 1.625rem | Normalise to 1.75rem; alias a spacing or component geometry role. |
| `.switch__control::after` | top: 0.1875rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.switch__control::after` | left: 0.1875rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.switch__control:checked::after` | right: 0.1875rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.badge::before` | width: 0.4rem | Normalise to 0.5rem; alias a spacing or component geometry role. |
| `.badge::before` | height: 0.4rem | Normalise to 0.5rem; alias a spacing or component geometry role. |
| `.alert .icon` | margin-top: 0.1rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.toast > .icon` | margin-top: 0.1rem | Normalise to 0.25rem; alias a spacing or component geometry role. |
| `.skeleton--pill` | height: 1.625rem | Normalise to 1.75rem; alias a spacing or component geometry role. |
| `.progress` | height: 0.375rem | Normalise to 0.5rem; alias a spacing or component geometry role. |
| `Upload, notification rows and filter toolbar` | Small specimen widths revealed native file-input and toolbar overflow. | Constrain file inputs; wrap toolbar controls; allow notification text to shrink and wrap. |
| `State matrix documentation` | Focus paint inside wide tables escaped the horizontal scroll boundary. | Contain state-table layout and paint; keep scrolling inside the matrix. |
| `Token export` | The skill exporter used legacy string values for colours/dimensions and mixed token/group paths. | Export DTCG 2025.10 typed objects with conflict-free paths; retain exact CSS-only expressions in metadata. |
| Theme specimens | A light wrapper under a dark root inherited dark role values. | Explicit light roles reset colour and elevation in nested light examples. |
| Interaction specimens | Forced states were incomplete outside primary buttons and inputs. | Add hover/focus/active hooks, native states and documented keyboard contracts. |
| Core set | Table, tooltip and code-copy components were not used by the source mocks. | Document as core extensions; do not claim mock provenance. |

## Changelog

### v1.0 — 9 October 2026

Initial extraction. Stable mock token names and BEM class names are preserved. Changed values: radius-md 14→16px; stone-600 #686358→#625d53; stone-500 #8a8273→#81796b; individual micro-dimensions follow the drift table. New named geometry roles replace CSS literals. Mocks consume the design system through compatibility entry points.

## Verification

Verified on 9 October 2026:

- Mock checker: 49 screens and 196 states; zero errors or warnings.
- Design-system checker: 87 HTML pages, including 12 foundations, 66 components and 8 patterns; zero errors or warnings.
- Contrast checker: 142 declared light/dark pairings passed; zero failures or unresolved colours.
- Token audit: all 252 CSS token names have exactly one owning foundation page. The 252 DTCG entries have no missing alias references.
- Chromium documentation review: all 87 pages at 360px and 1280px in light and dark. No page overflow, duplicate IDs, script errors or detected live-text contrast failures. Native dialog initial focus, Escape dismissal and focus restoration, manual tab activation and nested theme switching were exercised.
- Visual review: 20 full-page documentation screenshots, with detailed inspection of the index, colour, button, text-field and dialog pages. All 196 mock states were rendered at 360px, 768px and 1280px in both themes (1,176 screenshots), with no overflow or broken images detected. Contact sheets for all 49 screens were visually reviewed at each width and theme.
- Reduced motion and forced-colour overrides were inspected, including independent light and dark specimen focus colours. The scope limits below still apply.

Browser review reports and screenshots are local, ignored artifacts under `.cache/`. The drift corrections above are reflected in the shared styles consumed by both the mocks and these documentation pages.

## Scope and implementation notes

This is a static design artifact, not an Angular component library. Documentation event handlers demonstrate native dialogs, tabs and copy feedback; production behavior must follow the repository requirements/design/mock/ATDD workflow. APG menus, routing focus, timer pauses and background inertness still need the documented runtime implementation. Contrast and HTML checks do not replace a full screen-reader or WCAG conformance audit.

## Re-run

```sh
python .agents/skills/writing-html-mocks/scripts/check_mocks.py docs/mocks
python .agents/skills/extracting-design-systems/scripts/check_design_system.py docs/design-system
python .agents/skills/extracting-design-systems/scripts/check_contrast.py docs/design-system/tokens/tokens.css
python docs/design-system/tokens/export_tokens.py
```
