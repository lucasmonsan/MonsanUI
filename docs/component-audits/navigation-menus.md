# Navigation And Menu Component Audit

Local branch: `refactor/surface-components-local`.

This audit covers the navigation/menu pass from the MonsanUI component
simplification plan. These components are visually sensitive because they sit in
headers, top regions and item cards across the suite.

## Changed Locally

### QuickActions

- Replaced custom-property string assembly with Svelte style directives.
- Replaced the manual panel click listener lifecycle with a declarative panel
  click handler.
- Preserved the existing `variant`, `placement`, `align`, `panelPadding`,
  `panelGap`, `triggerBehavior`, `surface` and `containedReveal` contract.

### Tabs

- Replaced inline nav SVGs with the shared `ChevronLeft` icon component.
- Added i18n-backed labels for scroll nav buttons.
- Added `scrollLeftLabel` and `scrollRightLabel` props for explicit overrides.
- Replaced mask custom-property string style with Svelte style directives.
- Added reduced-motion handling for smooth scroll and tab/nav transitions.

## Audited Without Code Changes

### MenuControl, MenuItem, AvatarMenu

Current structure is already small. `AvatarMenu` remains a thin wrapper around
`QuickActions`; menu panel behavior belongs to `QuickActions`.

## Pending Visual Pass

### Tabs Structural Spacing

`Tabs` still has legacy structural spacing in its default variant:

- `padding: 16px 16px var(--space-sm) 16px`
- `margin: -12px -12px 0 -12px`
- `width: calc(100% + 24px)`
- `border-bottom: var(--border-width) solid var(--border-color)`

All current suite app usages found in this pass use `embedded`, which disables
that structural border and large spacing. Because `Tabs` appears in Koalify
dashboard/admin, Manki stats and Owlth portal, changing the default structural
contract should be a separate visual pass with screenshots/checks, not bundled
into the low-risk internal cleanup.

## Validation

- `pnpm test` in `MonsanUI`: passed with 0 Svelte warnings after the local
  navigation/menu changes.
