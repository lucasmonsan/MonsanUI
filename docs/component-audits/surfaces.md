# Surface And Overlay Component Audit

Local branch: `fix/exam-badge-mobile-scaling`.

This audit covers the surface/container pass from the MonsanUI component
simplification plan. The goal is to simplify internals while preserving public
API, visual behavior, accessibility and consumer contracts.

## Changed Locally

### Panel

- Replaced manual class/style string assembly with Svelte class and style
  directives.
- Moved `width: 100%` into the component CSS.
- Kept API and visual behavior unchanged.

### DataCard

- Collapsed duplicated header branches into one header path.
- Preserved `top`, `actions`, `title`, `subtitle`, `eyebrow`, `body` and
  `bottom` behavior.
- Kept `Panel` as the base surface.

### StatusBanner

- Added `prefers-reduced-motion` handling for pulse animation.

### ExpandableCard

- Removed manual `addEventListener` lifecycle wiring for card clicks.
- Moved card-click behavior to declarative event handlers.
- Added keyboard support for `expandOn="card"`.
- Added reduced-motion handling for transitions.
- Preserved `expandOn`, indicator and compact behavior.

### FlipCard

- Replaced custom-property string style with a Svelte style directive.
- Exposed flipped state through `aria-pressed`.
- Added reduced-motion handling for CSS transitions.
- Kept the existing perspective/wrapper/face structure because it is required
  for 3D flip, drag/tilt and front/back rendering.

### Dialog

- Replaced content padding string style with a Svelte style directive.
- Kept the current `<dialog>`, visual container, header, scrollable content and
  footer structure because those wrappers have distinct behavior.

### Toast

- Simplified toast color typing.
- Moved the custom property to a Svelte style directive.
- Added runtime reduced-motion handling for Svelte `fly` transitions.

### Loading

- Added reduced-motion handling for overlay, card and spinner animation.

## Audited Without Code Changes

### AppCard

The current wrappers map to logo, status, meta and action regions. No safe
wrapper removal was identified in this pass.

### ConsolePanel

The current wrappers separate the base `Panel`, console header and scrollable
body. No safe wrapper removal was identified in this pass.

### Alert

The inline info icon is inconsistent with the other icon components. No code
change was made because adding a new public icon just for this pass would
increase API surface. This can be revisited in a dedicated icon cleanup.

### InlineNotice, EmptyState, StatusPill

These components are already small and structurally direct.

### ConfirmDialog, MediaDialog

Both remain thin compositions over `Dialog`. No wrapper removal was justified.

## Validation

- `pnpm test` in `MonsanUI`: passed with 0 Svelte warnings after this local
  surface/overlay pass.
