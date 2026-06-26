# Shell And Global Component Audit

Local branch: `fix/exam-badge-mobile-scaling`.

This audit covers shell/global components that are used around routes or app
layouts rather than inside a single product workflow.

## Changed Locally

### RouteViewport

- Added runtime `prefers-reduced-motion` handling for Svelte `fade`
  transitions.
- Kept the current legacy `PageContainer` composition because Owlth/Shellfish
  migration is still pending.

### Toast

- Added runtime `prefers-reduced-motion` handling for Svelte `fly` transitions.
- Kept icon/message/action structure intact.

### ToastViewport

- Audited with no code change. The viewport is already a direct fixed-position
  live region around `Toast` items.

## Audited Without Code Changes

### AppShell

Current structure matches the suite page contract: optional header, top, scroll
content, bottom and footer regions. The scroll fade/overflow logic is necessary
for the current page behavior.

### AppHeader

Current wrappers map to brand, actions and optional secondary content. It is the
canonical app header and should remain the page-header standard.

### Background

Current single element owns fixed/local background patterns and animation. It
already has reduced-motion handling.

### FlashOverlay

Current single element owns transient success/error screen feedback and already
has reduced-motion handling.

### SkipLink

Current component is a direct anchor. Visual behavior is owned by global CSS.

### PreferenceBar

Current component is a direct footer wrapper. Its larger top padding is used in
landing/auth footer layouts, so it was not changed in this structural pass.

## Pending

- `RouteViewport` remains legacy and should be retired only after remaining
  consumers move fully to `AppShell`.
- `Toast` still has an inline info SVG; replacing it should happen in a
  dedicated icon API pass.

## Validation

- `pnpm test` in `MonsanUI`: passed after this local block with 0 Svelte errors
  and 0 Svelte warnings.
