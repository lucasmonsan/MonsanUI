# MonsanUI Component Inventory

This inventory starts the component simplification plan. It records the current
public surface, real consumer usage and refactor order before any broad
component rewrite.

## Snapshot

- Date: 2026-06-22
- MonsanUI branch: `fix/exam-badge-mobile-scaling`
- Public component/icon exports in `src/lib/index.ts`: 130
- Svelte files under `src/lib/components`: 131
- Internal Svelte component not exported publicly: `StepPanel`
- Consumers scanned: `Koalify`, `Manki`, `Frequence`, `Owlth`.
- `Shellfish` exists in the workspace, but no `Shellfish/package.json` was
  present during this pass, so it was not testable as a pnpm consumer.

## Phase 0 Result

The AppShell phase is merged locally into the main branches and consumers have
the latest `monsan-ui` lockfile pins where required.

Validation passed with:

- `MonsanUI`: `pnpm test`
- `Manki`: `pnpm test`
- `Koalify`: `pnpm test`
- `Frequence`: `pnpm test`

Known non-blocking warnings observed:

- `PLUGIN_TIMINGS` during Vite builds.
- Directus SDK circular dependency warning in `Koalify`.

## Local Refactor Progress

Current local branch: `fix/exam-badge-mobile-scaling`.

Detailed local audits:

- `docs/component-audits/surfaces.md`
- `docs/component-audits/actions.md`
- `docs/component-audits/layout-legacy.md`
- `docs/component-audits/navigation-menus.md`
- `docs/component-audits/forms.md`
- `docs/component-audits/domain-foundations.md`
- `docs/component-audits/product-critical.md`
- `docs/component-audits/shell-global.md`

Completed and validated locally:

- `Panel`: replaced manual class/style string assembly with Svelte class/style
  directives and moved `width: 100%` into CSS.
- `DataCard`: collapsed duplicated header branches into one header path while
  preserving `top`, `actions`, `title`, `subtitle`, `eyebrow`, `body` and
  `bottom` behavior.
- `StatusBanner`: added `prefers-reduced-motion` handling for pulse animation.
- `ExpandableCard`: removed manual `addEventListener` lifecycle wiring, moved
  the card-click behavior to declarative handlers, added keyboard support for
  `expandOn="card"` and added reduced-motion handling.
- `FlipCard`: replaced custom-property string style with a Svelte style
  directive, exposed flipped state through `aria-pressed`, and added
  reduced-motion handling for CSS transitions.
- `Dialog`: replaced content padding string style with a Svelte style
  directive.
- `Toast`: simplified toast color typing, moved the custom property to a Svelte
  style directive and added runtime reduced-motion handling for Svelte `fly`
  transitions.
- `Loading`: added reduced-motion handling for overlay/card/spinner animation.
- `QuickActions`: replaced panel custom-property string assembly with Svelte
  style directives and replaced the manual panel click listener lifecycle with
  a declarative panel click handler.
- `Tabs`: replaced inline nav SVGs with the shared `ChevronLeft` icon, added
  i18n-backed scroll labels and override props, moved mask custom properties to
  Svelte style directives, and added reduced-motion handling.
- `Input`: moved password toggle default labels to MonsanUI i18n and added
  reduced-motion handling.
- `Textarea`: moved row custom properties to Svelte style directives and added
  reduced-motion handling.
- `Select`: moved default placeholder to MonsanUI i18n and added
  reduced-motion handling.
- `MultiSelect`: moved default placeholder to MonsanUI i18n and added
  reduced-motion handling.
- `FilterDialog`: groups composable filters behind one compact trigger, reports
  the active-filter count and provides explicit apply, clear and cancel actions.
- `Button`: replaced manual conditional class string assembly with Svelte class
  directives, replaced `transition: all`, and added reduced-motion handling.
- `IconButton`: added explicit cursor/transition behavior and reduced-motion
  handling.
- `ButtonGroup`: replaced direction string class assembly with Svelte class
  directives.
- `ActionBar`: added reduced-motion handling.
- `Checkbox`: replaced manual wrapper classes with Svelte class directives,
  replaced inline check SVG with the shared icon, and added reduced-motion
  handling.
- `Radio`: replaced manual wrapper classes with Svelte class directives and
  added reduced-motion handling.
- `Range`: moved fill percentage to a Svelte style directive, clamped the
  percentage and guarded `max === min`, and added reduced-motion handling.
- `SearchBar`: moved default labels to MonsanUI i18n, replaced inline SVGs with
  shared icons, and added reduced-motion handling for CSS/dropdown transitions.
- `Search`: moved default copy to MonsanUI i18n and replaced inline folder SVG
  with the shared icon.
- `DatePicker`: replaced inline calendar SVG with the shared icon and added
  reduced-motion handling for trigger/dropdown transitions.
- `TimePicker`: removed non-essential comments and added reduced-motion
  handling for trigger/dropdown transitions.
- `ColorPicker`: moved hardcoded labels to MonsanUI i18n, replaced background
  color string styles with Svelte style directives, and added reduced-motion
  handling for CSS/dropdown transitions.
- `Chips`: moved default labels to MonsanUI i18n, replaced inline remove SVG
  with the shared icon, and added reduced-motion handling.
- `FileUpload`: replaced repeated inline upload/remove SVGs with shared icons
  and added reduced-motion handling.
- `PageShell`: moved custom properties to Svelte style directives.
- `PageContainer`: removed stale internal comments and moved custom properties
  to Svelte style directives.
- `AppViewport`: moved custom properties to Svelte style directives.
- `CenteredPanel`: moved padding to a Svelte style directive.
- `ContentRegion`: added reduced-motion handling for overflow fade transitions.
- `ProgressBar`: moved custom properties and width to Svelte style directives
  and added reduced-motion handling for transitions/stripe animation.
- `MetricButton`: added explicit cursor/transition behavior, `type="button"`
  and reduced-motion handling.
- `CountdownBadge`: added reduced-motion handling for the warning pulse.
- `PromptPanel`: added reduced-motion handling for condensed transitions.
- `SplashScreen`: moved z-index to a Svelte style directive and added
  reduced-motion handling for exit/content/loader animations.
- `ThemeSelector`: added reduced-motion handling for dropdown item transitions.
- `LanguageSelector`: added reduced-motion handling for dropdown item
  transitions.
- `StepPanel`: added runtime reduced-motion handling for Svelte `fly`
  transitions and delayed child rendering.
- `Avatar`: moved size styles to Svelte style directives and added
  reduced-motion handling for interactive transitions.
- `LegalLinks`: added reduced-motion handling for link transitions.
- `BrandHeader`: moved logo mask style strings to a Svelte custom-property
  style directive and added reduced-motion handling for logo transitions.
- `ChoiceCard`: added reduced-motion handling for card transitions.
- `questions/SingleChoice`: added button type, radio semantics, Svelte class
  and style directives, explicit transitions and reduced-motion handling.
- `questions/MultipleChoice`: added button type, checkbox semantics, Svelte
  class and style directives, shared `Check` icon, explicit transitions and
  reduced-motion handling.
- `Deck`: moved class/style assembly to Svelte directives, added button/menu
  accessibility details and reduced-motion handling.
- `CardEditor`: added reduced-motion handling; kept manual header pointer
  listeners because declarative handlers create Svelte a11y warnings for this
  mixed drag/action header.
- `Folders`: added explicit button types, shared edit/delete icons, Svelte
  class directives for color swatches, menu trigger semantics and
  reduced-motion handling.
- `DndOrder`: supports consumer-rendered items, optional contextual content
  before an item, per-item surface colour, selection callbacks and final-order
  callbacks while preserving desktop drag, touch, keyboard and reduced-motion
  handling.
- `DndMatch`: added reduced-motion handling for Svelte scale transitions and
  area/chip transitions without changing drag logic.
- `Terminal`: moved tree indentation to a Svelte style directive and added
  button types to mobile tabs.
- `Calendar`: added reduced-motion handling for scale/transitions, explicit
  button types and explicit transition properties without changing
  calendar/heatmap/week/list structure.
- `RouteViewport`: added runtime reduced-motion handling for legacy route fade
  transitions.

Audited without code changes in this pass:

- `AppCard`: current wrappers map to logo/status/meta/actions structure.
- `ConsolePanel`: current wrappers separate the base `Panel`, console header
  and scrollable body.
- `Alert`: inline info icon is inconsistent, but adding a public icon component
  just for this pass would increase API surface; no safe simplification was
  applied.
- `InlineNotice`, `EmptyState`, `StatusPill`: already small and structurally
  direct.
- `ConfirmDialog`, `MediaDialog`: composition over `Dialog` is clear; no
  wrapper removal was justified.
- `MenuControl`, `MenuItem`, `AvatarMenu`: current structure is already small;
  `AvatarMenu` remains a thin wrapper around `QuickActions`.
- `Tabs` structural spacing: still needs a separate visual pass because the
  default variant mixes tab behavior with structural padding/margin/border and
  affects Koalify dashboard/admin, Manki stats and Owlth portal.
- `FormField`, `FieldGroup`, `FormStack`: current structures are semantic and
  small; helper/error support for `FormField` should be a separate API step.
- `ActionBar` roving tabindex state: should be revisited in a dedicated
  accessibility pass.
- `FileUpload` repeated file-list markup: can be simplified in a dedicated
  snippet/variant pass after drag/drop behavior is visually checked.
- Legacy layout wrappers: `PageShell`, `PageContainer`, `AppViewport` and
  `RouteViewport` should not be removed until Owlth and remaining consumers are
  migrated to the `AppShell` contract.
- `Badge`, `ProgressSummary`, `ProfileSummary`, `MetaDisclosure`,
  `SuiteUserMenu`, `Stack`, `Inline`, `Grid`, `ResponsiveGrid`,
  `ResponsiveSplit`, `ActionFooter`, `SectionHeading`, `Divider`, `Separator`
  and `Text`: structurally direct in this pass.
- `Credits`: structurally direct, but default product/author copy should be a
  separate API decision.
- `PageHeader`: overlaps with `AppHeader` and should be handled as page
  migration risk, not as an isolated component rewrite.
- `AppShell`, `AppHeader`, `Background`, `FlashOverlay`, `SkipLink`,
  `ToastViewport` and `PreferenceBar`: audited as structurally direct in this
  pass.

Validation:

- `pnpm test` in `MonsanUI`: passed after the latest local legacy-layout
  changes with 0 Svelte errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the latest local domain/foundation
  changes with 0 Svelte errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the latest local question component
  changes with 0 Svelte errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the latest local Manki deck/editor
  changes with 0 Svelte errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the latest local Manki folders
  changes with 0 Svelte errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the latest local DnD/Terminal changes
  with 0 Svelte errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the latest local Calendar changes
  with 0 Svelte errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the latest local shell/global and
  runtime reduced-motion changes with 0 Svelte errors and 0 Svelte warnings.
- Final local `pnpm test` in `MonsanUI`: passed after the full component audit
  batch and documentation updates with 0 Svelte errors and 0 Svelte warnings.
- `Manki`: `pnpm run monsan-ui:link` followed by `pnpm test` passed with 0
  Svelte errors and 0 Svelte warnings.
- `Koalify`: `pnpm run monsan-ui:link` followed by `pnpm test` passed with 0
  Svelte errors and 0 Svelte warnings. Known non-blocking build warnings still
  appeared: `PLUGIN_TIMINGS` and the Directus SDK circular dependency warning.
- `Frequence`: `pnpm run monsan-ui:link` followed by `pnpm test` passed with 0
  Svelte errors and 0 Svelte warnings.
- `Owlth`: `pnpm run monsan-ui:link` followed by `pnpm test` passed with 0
  Svelte errors and 0 Svelte warnings. A Rollup warning appeared for a comment
  annotation inside generated `.svelte-kit/adapter-node/chunks/auth.js` output.

## Consumer Usage Summary

Top suite-wide imports from `monsan-ui`:

| Component          | Uses |
| :----------------- | ---: |
| `Stack`            |   35 |
| `Button`           |   33 |
| `Text`             |   32 |
| `Inline`           |   29 |
| `Panel`            |   22 |
| `AppShell`         |   21 |
| `AppHeader`        |   16 |
| `ThemeSelector`    |   16 |
| `ChevronLeftIcon`  |   15 |
| `Badge`            |   14 |
| `LanguageSelector` |   13 |
| `ResponsiveGrid`   |   12 |
| `Input`            |   11 |
| `Loading`          |   11 |
| `Alert`            |    9 |
| `Dialog`           |    9 |
| `FormField`        |    9 |

Project concentration:

| Project     | Highest-use components                                                                        |
| :---------- | :-------------------------------------------------------------------------------------------- |
| `Koalify`   | `Stack`, `Text`, `Button`, `Inline`, `AppShell`, `Panel`, `Badge`, forms, question components |
| `Manki`     | `Button`, `Stack`, `Text`, `AppShell`, `Dialog`, `Inline`, `Panel`, `Deck`, `Calendar`        |
| `Frequence` | `AppShell`, `Button`, `LanguageSelector`, `Stack`, `Text`, `ThemeSelector`                    |
| `Owlth`     | `AppViewport`, `AppHeader`, `Button`, `Stack`, auth surfaces                                  |
| `Shellfish` | Not testable in this pass because the workspace copy has no `package.json`.                   |

Risk implication:

- `Stack`, `Inline`, `Button`, `Text`, `Panel`, `AppShell`, `AppHeader`,
  selectors and form fields are high-blast-radius components.
- `Koalify` is the broadest consumer and must be checked for most component
  families.
- `Manki` is the main consumer for deck, calendar and study interactions.
- `Owlth` still uses legacy layout components and must be included when
  removing or deprecating `PageShell`, `PageContainer`, `AppViewport` or
  `RouteViewport`.
- `Shellfish` needs a separate package restoration/audit before it can be
  counted in consumer validation.

## Families

### Structure And Layout

Components:

- `AppShell`
- `AppHeader`
- `ContentRegion`
- `CenteredPanel`
- `ActionFooter`
- `Stack`
- `Inline`
- `Grid`
- `ResponsiveGrid`
- `ResponsiveSplit`
- `PageShell`
- `PageContainer`
- `AppViewport`
- `RouteViewport`
- `PageHeader`
- `SectionHeading`
- `Divider`
- `Separator`
- `StepTransition`

Current read:

- `AppShell` is the intended page contract.
- `PageShell`, `PageContainer`, `AppViewport` and `RouteViewport` are legacy or
  transition-era layout wrappers until proven otherwise.
- `Stack`, `Inline`, `Grid`, `ResponsiveGrid` and `ResponsiveSplit` are the
  safest first implementation target because they should remain small
  composition primitives.

Main risks:

- `Stack` and `Inline` are used everywhere; defaults cannot change visually.
- Legacy page wrappers are still used by `Owlth`; `Shellfish` cannot be
  validated until its package metadata is restored.
- Removing wrappers can affect scroll, focus outlines, fixed regions and
  generated CSS selectors.

### Surfaces And Containers

Components:

- `Panel`
- `DataCard`
- `AppCard`
- `ConsolePanel`
- `Dialog`
- `ConfirmDialog`
- `MediaDialog`
- `Alert`
- `InlineNotice`
- `EmptyState`
- `ExpandableCard`
- `FlipCard`
- `CenteredPanel`
- `Loading`
- `Toast`
- `ToastViewport`
- `FlashOverlay`

Current read:

- `Panel` is the base reusable surface.
- `DataCard` should keep the structural top/body/bottom direction established
  in the plan.
- Dialog/overlay components need their own phase because focus, backdrop,
  scroll and background layout behavior are high risk.

Main risks:

- `Panel`, `Dialog`, `Alert`, `EmptyState` and `CenteredPanel` have broad usage.
- `Dialog` regressions can affect landing pages, admin flows and Manki deck
  flows.
- `ConsolePanel` is important for Koalify admin/debug flows.

### Actions, Menus And Navigation

Components:

- `Button`
- `IconButton`
- `ButtonGroup`
- `ActionBar`
- `QuickActions`
- `MenuItem`
- `MenuControl`
- `Tabs`
- `PreferenceBar`
- `ThemeSelector`
- `LanguageSelector`
- `LegalLinks`
- `Avatar`
- `AvatarMenu`
- `SuiteHeaderActions`
- `SuiteUserMenu`
- `MetricButton`

Current read:

- `Button` is too central to refactor casually.
- `QuickActions`, `MenuItem`, `MenuControl`, `AvatarMenu` and suite user menus
  need one shared menu contract instead of parallel behavior.
- `Tabs embedded` spacing must not compete with `AppShell`.

Main risks:

- Header actions are visually sensitive across all apps.
- Menus require keyboard, focus, escape and outside-click validation.
- Tabs are used in Koalify and Manki stats; spacing changes are visible.

### Forms And Inputs

Components:

- `Input`
- `Textarea`
- `Select`
- `MultiSelect`
- `Checkbox`
- `Radio`
- `Range`
- `Search`
- `SearchBar`
- `FormField`
- `FieldGroup`
- `FormStack`
- `DatePicker`
- `TimePicker`
- `ColorPicker`
- `FileUpload`
- `Chips`

Current read:

- `FormField`, `FieldGroup` and `FormStack` should own shared form structure.
- Field controls should not duplicate label/helper/error structure when the
  wrapper already owns it.
- `Select` and `MultiSelect` were recently aligned visually; preserve that
  behavior.

Main risks:

- Koalify admin uses forms heavily.
- Select-like components require keyboard and aria validation.
- File/date/time/color controls need separate audits because they have more
  interaction state than simple inputs.

### Domain Components

Components:

- `Calendar`
- `Folders`
- `Deck`
- `CardEditor`
- `DndOrder`
- `DndMatch`
- `SingleChoice`
- `MultipleChoice`
- `Terminal`
- `ProgressSummary`
- `ProfileSummary`
- `StatusPill`
- `StatusBanner`
- `PromptPanel`
- `CountdownBadge`
- `Credits`
- `ChoiceCard`
- `MetaDisclosure`
- `SplashScreen`
- Icons under `src/lib/components/icons`

Current read:

- Koalify question components and Manki deck/study components should be treated
  as product-critical, not generic low-risk primitives.
- `Calendar` is complex enough to get its own audit.
- Icons are exported as components but should not be mixed into structural
  refactor work unless a component being audited directly depends on them.

Main risks:

- DnD and question components can regress answer capture and accessibility.
- Deck/card/editor components can regress Manki core workflows.
- Calendar changes can affect stats layouts and visual density.

## Component Categorization and Refactoring Strategy

To guide the simplification of MonsanUI without risking breaking changes across consumers, components must be classified and refactored according to these rules:

### 1. Structural Standards

- **AppShell + AppHeader**: Mandatory structural pattern for all route layouts across suite applications.
- **PageShell, PageContainer, AppViewport, RouteViewport**: Confirmed legacy layout wrappers. They must be deprecated and cannot be removed until `Owlth` and remaining consumers are fully migrated to the `AppShell` contract.
- **PageHeader**: Rotated page-header usage is frozen. It must not be used as a route header; future passes will decide if it is repurposed as a section header or deprecated in favor of `SectionHeading`.

### 2. Search Strategy

- **Search and SearchBar**: Must remain separate.
  - `Search` represents a global/modal command palette interface (used in `Manki`).
  - `SearchBar` represents an inline/contextual search bar (used in `Koalify`).

### 3. Card Strategy

- **Cards**: Do not force a unified behavioral abstraction. Avoid forcing `FlipCard` (which has 3D rotation), `CardEditor`, and other specialized cards into a single rigid wrapper. If useful, a lightweight visual primitive (`Card.svelte`) can be extracted to share CSS border/shadow tokens, but without dictating slot structures or inner behaviors.

### 4. Components Without Direct External Usage

- Do not automatically flag components as "dead code" or delete them solely for lacking direct imports in scanned applications. They must be categorized:
  - **Internal-only/Supported**: Component is an atomic dependency of a larger public component (e.g., `SuiteUserMenu` is used by `SuiteHeaderActions`, `StepPanel` by `StepTransition`, `Credits` by `SplashScreen`, `StatusPill` by `ConsolePanel`).
  - **Experimental/Design System**: Component is a standard design system element waiting for adoption (e.g., `Chips`, `ColorPicker`, `DatePicker`, `TimePicker`, `Radio`).

## Audit Checklist

Use this checklist before editing any component:

- Public API: props, snippets, events, bindable values and exports.
- DOM: generated elements, semantic tags and wrapper purpose.
- CSS: structural rules, visual rules, responsive rules and tokens.
- Accessibility: roles, labels, aria relationships, keyboard behavior and focus.
- Consumers: exact apps/routes/components importing it.
- Redundancy: responsibilities duplicated by another component.
- Migration: whether an API change requires consumer edits.
- Verification: MonsanUI gate plus affected consumer gates.

## Implementation Order

1. Layout primitives:
   `Stack`, `Inline`, `Grid`, `ResponsiveGrid`, `ResponsiveSplit`.
2. Base surfaces:
   `Panel`, `DataCard`, `AppCard`, `ConsolePanel`.
3. Low-risk feedback surfaces:
   `Alert`, `InlineNotice`, `EmptyState`, `StatusPill`, `StatusBanner`.
4. Actions and navigation:
   `ButtonGroup`, `ActionBar`, `Tabs`, then menu components.
5. Forms:
   `FormField`, `FieldGroup`, simple inputs, then complex inputs.
6. Overlays:
   `Dialog`, `ConfirmDialog`, `MediaDialog`, `Loading`, toasts.
7. Domain components:
   Koalify question controls, Manki deck/study components and `Calendar`.
8. Legacy layout cleanup:
   migrate remaining consumers off legacy wrappers, then deprecate or remove.

## Next Local Step

Move from automated validation to manual visual validation and final commit
preparation:

- Visually validate Manki deck/folder/card editor/calendar flows.
- Visually validate Koalify question controls, DnD and terminal flows.
- Validate landing/auth footer areas that use `PreferenceBar`.
- Re-audit or restore `Shellfish` package metadata before claiming Shellfish
  compatibility.
- Decide whether to keep the whole local batch as one refactor commit or split
  docs and component code into focused commits.
- Do not commit or push until the broader analysis/refactor is ready.
