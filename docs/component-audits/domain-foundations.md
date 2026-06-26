# Domain And Foundation Component Audit

Local branch: `fix/exam-badge-mobile-scaling`.

This audit covers small domain, header, selector and layout primitive components
that sit between generic UI primitives and product-specific workflows. Complex
product components such as `Calendar`, `Deck`, `CardEditor`, DnD and question
controls remain separate because they require visual and interaction checks.

## Changed Locally

### ProgressBar

- Replaced dynamic style strings with Svelte style directives.
- Kept the existing value clamp, text overlay and stripe behavior.
- Added reduced-motion handling for width transitions and stripe animation.

### MetricButton

- Added explicit pointer cursor and transition behavior to match interactive
  button expectations.
- Replaced implicit transition behavior with explicit transform/shadow
  transitions.
- Added explicit `type="button"`.
- Added reduced-motion handling.

### CountdownBadge

- Added reduced-motion handling for the warning pulse animation.

### PromptPanel

- Added reduced-motion handling for condensed transform/opacity transitions.
- Kept the existing `Panel` composition.

### SplashScreen

- Replaced z-index string style with a Svelte style directive.
- Added reduced-motion handling for splash exit, content/footer fade and cube
  loader animation.

### ThemeSelector

- Added reduced-motion handling for dropdown item transitions.
- Kept current inline theme icon snippets because extracting an icon API would
  be broader than this pass.

### LanguageSelector

- Added reduced-motion handling for dropdown item transitions.

### StepPanel

- Added runtime `prefers-reduced-motion` detection for the Svelte `fly`
  transition.
- Reduced-motion now removes transition duration, movement and delayed child
  rendering.

### Avatar

- Replaced size style strings with Svelte style directives.
- Added reduced-motion handling for interactive hover/active transitions.

### LegalLinks

- Added reduced-motion handling for link color transitions.

### BrandHeader

- Replaced logo mask style strings with a Svelte custom-property style
  directive.
- Added reduced-motion handling for logo opacity transitions.

## Audited Without Code Changes

### Badge

The component is small and direct. Variant/size/no-wrap classes are intentional
API, and there is no extra wrapper.

### ProgressSummary

The wrapper exists to pair `ProgressBar` with the count text and assign flex
behavior. No safe simplification was justified.

### ProfileSummary

The wrapper maps directly to avatar plus identity text. The optional frame is
part of its public behavior.

### MetaDisclosure

Current wrapper/content structure is required for the grid-row disclosure
animation and semantic trigger/content split.

### Credits

The structure is direct, but the component still owns default author/product
copy. Changing that contract should be a separate API decision.

### SuiteHeaderActions

The component duplicates the `SuiteUserMenu` branch only to support optional
extra menu content. It can be simplified later with a menu-composition pass, but
that should be checked across all apps.

### SuiteUserMenu

The component is a thin composition around `AvatarMenu` and `MenuItem`. No
structural wrapper removal was justified.

### Stack, Inline, Grid, ResponsiveGrid, ResponsiveSplit

These layout primitives are already small and direct. `Inline` has specific
collapse behavior that should not be simplified without consumer screenshots.

### ActionFooter, PageHeader, SectionHeading

`ActionFooter` and `SectionHeading` are direct. `PageHeader` overlaps with
`AppHeader` and should be treated as migration/legacy risk in page work, not
rewritten inside this pass.

### Divider, Separator, Text

These are structurally minimal. `Text` still contains older inline comments, but
there is no redundant DOM to remove.

## Pending

- Decide whether `Credits` should continue providing default product/author copy
  or require explicit app-provided text.
- Revisit `ThemeSelector` icons in a dedicated icon/API pass if the suite needs
  exported moon/palette icons.
- Revisit `SuiteHeaderActions`, `SuiteUserMenu`, `AvatarMenu` and
  `QuickActions` together in a menu contract pass.
- Migrate app page usage away from `PageHeader` where it conflicts with
  `AppHeader`/`AppShell`.

## Validation

- `pnpm test` in `MonsanUI`: passed after this local block with 0 Svelte errors
  and 0 Svelte warnings.
