# MonsanUI Component Inventory

This inventory starts the component simplification plan. It records the current
public surface, real consumer usage and refactor order before any broad
component rewrite.

## Snapshot

- Date: 2026-06-21
- MonsanUI branch: `docs/component-inventory`
- Public component/icon exports in `src/lib/index.ts`: 130
- Svelte files under `src/lib/components`: 131
- Internal Svelte component not exported publicly: `StepPanel`
- Consumers scanned: `Examster`, `Manki`, `Frequence`, `Owlth`, `Shellfish`

## Phase 0 Result

The AppShell phase is merged locally into the main branches and consumers have
the latest `monsan-ui` lockfile pins where required.

Validation passed with:

- `MonsanUI`: `pnpm test`
- `Manki`: `pnpm test`
- `Examster`: `pnpm test`
- `Frequence`: `pnpm test`

Known non-blocking warnings observed:

- `PLUGIN_TIMINGS` during Vite builds.
- Directus SDK circular dependency warning in `Examster`.

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
| `Examster`  | `Stack`, `Text`, `Button`, `Inline`, `AppShell`, `Panel`, `Badge`, forms, question components |
| `Manki`     | `Button`, `Stack`, `Text`, `AppShell`, `Dialog`, `Inline`, `Panel`, `Deck`, `Calendar`        |
| `Frequence` | `AppShell`, `Button`, `LanguageSelector`, `Stack`, `Text`, `ThemeSelector`                    |
| `Owlth`     | `AppViewport`, `AppHeader`, `Button`, `Stack`, auth surfaces                                  |
| `Shellfish` | `PageShell`, `AppViewport`, `Panel`, `ResponsiveGrid`, selectors                              |

Risk implication:

- `Stack`, `Inline`, `Button`, `Text`, `Panel`, `AppShell`, `AppHeader`,
  selectors and form fields are high-blast-radius components.
- `Examster` is the broadest consumer and must be checked for most component
  families.
- `Manki` is the main consumer for deck, calendar and study interactions.
- `Owlth` and `Shellfish` still use legacy layout components and must be
  included when removing or deprecating `PageShell`, `PageContainer`,
  `AppViewport` or `RouteViewport`.

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
- Legacy page wrappers are still used by `Owlth` and `Shellfish`.
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
- `ConsolePanel` is important for Examster admin/debug flows.

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
- Tabs are used in Examster and Manki stats; spacing changes are visible.

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

- Examster admin uses forms heavily.
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

- Examster question components and Manki deck/study components should be treated
  as product-critical, not generic low-risk primitives.
- `Calendar` is complex enough to get its own audit.
- Icons are exported as components but should not be mixed into structural
  refactor work unless a component being audited directly depends on them.

Main risks:

- DnD and question components can regress answer capture and accessibility.
- Deck/card/editor components can regress Manki core workflows.
- Calendar changes can affect stats layouts and visual density.

## Legacy Candidates

Candidates to mark as legacy or migration-only after consumers move fully to
`AppShell`:

- `PageShell`
- `PageContainer`
- `AppViewport`
- `RouteViewport`
- `PageHeader`

Do not remove these until every current consumer usage is migrated or explicitly
accepted:

- `Owlth` still imports `PageContainer`, `PageShell` and `AppViewport`.
- `Shellfish` still imports `PageShell` and `AppViewport`.
- `MonsanUI` showcase may still need examples while migration is active.

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
   Examster question controls, Manki deck/study components and `Calendar`.
8. Legacy layout cleanup:
   migrate remaining consumers off legacy wrappers, then deprecate or remove.

## Next PR

Start with layout primitives only:

- Audit `Stack`, `Inline`, `Grid`, `ResponsiveGrid`, `ResponsiveSplit`.
- Preserve current public API unless a prop is clearly redundant and unused.
- Keep visual output stable.
- Run `pnpm test` in `MonsanUI`.
- Update consumers only if the public package output changes after merge.
