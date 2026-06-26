# Action Component Audit

Local branch: `refactor/surface-components-local`.

This audit covers the action primitives from the MonsanUI component
simplification plan. These components have high blast radius because they are
used across public pages, app headers, admin flows and card actions.

## Changed Locally

### Button

- Replaced manual conditional class string assembly with Svelte class
  directives for `block` and `square`.
- Replaced broad `transition: all` with explicit transition properties.
- Added reduced-motion handling.
- Preserved public API, variants, sizes, shape, ARIA props and `deckTheme`.

### IconButton

- Added explicit cursor and transition properties so hover/active feedback is
  consistent with `Button`.
- Added reduced-motion handling.
- Preserved public API, variants, selected state, menu role support and label
  behavior.

### ButtonGroup

- Replaced direction string class assembly with Svelte class directives.
- Kept the same row/column layout contract and child button stretching.

### ActionBar

- Added reduced-motion handling for action item transitions.
- Removed vertical structural padding from the toolbar wrapper so spacing below
  `AppHeader` is owned by `AppShell`, matching `Tabs embedded` and other top
  region content.
- Kept toolbar semantics and current roving-focus behavior unchanged.

## Pending

- `ActionBar` currently initializes only the first item with `tabindex="0"` and
  moves focus with arrow keys. A future accessibility pass should decide whether
  to make roving tabindex stateful so the last focused action remains the tab
  stop.
- `Button` and `IconButton` still duplicate some visual CSS. Consolidating
  shared button interaction tokens should be a dedicated styling pass, not mixed
  with this structural cleanup.

## Validation

- `pnpm test` in `MonsanUI`: passed with 0 Svelte warnings after the local
  action changes.
