# Legacy Layout Component Audit

Local branch: `fix/exam-badge-mobile-scaling`.

This audit covers layout components that predate or overlap with the current
`AppShell` page contract. These components should not be removed while Owlth and
other consumers still use them.

## Changed Locally

### PageShell

- Replaced custom-property string style with Svelte style directives.
- Kept existing height, overflow, gap, tag and animation contract.

### PageContainer

- Removed stale internal comments.
- Replaced custom-property string style with Svelte style directives.
- Kept existing max-width, padding and animation contract.

### AppViewport

- Replaced custom-property string style with Svelte style directives.
- Kept existing header/toolbar/content/footer regions and overflow-fade
  behavior.

### CenteredPanel

- Replaced padding string style with a Svelte style directive.
- Kept `Panel` composition and full-height behavior.

### ContentRegion

- Added reduced-motion handling for automatic overflow fade transitions.
- Kept scroll/fade/gap/padding behavior.

## Audited Without Code Changes

### RouteViewport

`RouteViewport` still wraps `PageContainer` and route transition behavior. It is
structurally redundant with the current `AppShell` direction, but it should not
be removed until consumers have migrated away from legacy layout wrappers.

## Current Consumer Notes

- `Owlth` still uses `PageShell`, `PageContainer` and `AppViewport`.
- `Koalify`, `Manki` and `Frequence` use `CenteredPanel` in landing/loading
  flows.
- `Koalify` uses `ContentRegion` in the landing simulator dialog/content flow.

## Pending

- Migrate Owlth off `PageShell`, `PageContainer` and `AppViewport` when the app
  is ready to adopt `AppShell`.
- Decide whether `CenteredPanel` remains as a useful focused-content primitive
  inside `AppShell`, or becomes a specialized surface pattern.
- Decide whether `ContentRegion` remains as an inner scroll primitive, or
  whether its behavior is fully absorbed by `AppShell` content.

## Validation

- `pnpm test` in `MonsanUI`: passed after the local legacy-layout changes with
  0 Svelte errors and 0 Svelte warnings.
