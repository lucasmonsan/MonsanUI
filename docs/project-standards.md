# Monsan Suite Standards

MonsanUI is the only source of visual language for the Monsan suite.

Consumer apps may compose exported MonsanUI components and use documented props, snippets and options. They must not restyle MonsanUI components with local CSS, `:global`, inline styles or consumer-owned classes.

The package owns the executable checker for this rule. Consumers should call:

```bash
monsan-ui-check-consumer
```

The checker blocks:

- Local `<style>` blocks in `.svelte` files.
- `:global(...)` selectors.
- Inline `style=` attributes.
- Svelte `style:*=` directives.
- Consumer-owned `class=` and `class:*=` attributes.
- CSS files that contain anything beyond `@import 'monsan-ui/monsan-ui.css';`.

Consumers may create `monsan-ui.consumer-standards.mjs` only for approved temporary migrations:

```js
export default {
	allowlist: []
};
```

The expected suite state is an empty allowlist.

## Tooling Contract

MonsanUI also owns the suite tooling checker. Consumers should call:

```bash
monsan-ui-check-tooling
```

The checker verifies:

- `packageManager` is `pnpm@11.5.0`.
- `type` is `module`.
- `lint` is `prettier --check . && eslint .`.
- `.prettierrc` matches the suite Prettier config.
- `.prettierignore` contains required generated-output ignores and does not contain broad source ignores.
- `eslint.config.js` uses the shared recommended configs, TypeScript/Svelte parser settings, `no-undef` handling and `svelte/no-navigation-without-resolve`.

## Component Ownership

New visual or layout needs should be added to MonsanUI first. Consumer apps should keep domain logic, data loading and app-specific text, but reusable layout and aesthetic behavior belongs here.

Use existing primitives before adding new ones:

- `AppShell` for every app page, with fixed suite padding, max-width, optional header/top/bottom/footer regions and internally scrolling content.
- `AppHeader` and `ContentRegion` for page structure inside the shell.
- `Stack`, `Inline`, `Grid` and `ResponsiveGrid` for composition.
- `ActionFooter`, `ActionBar`, `ButtonGroup`, `QuickActions` and `Tabs` for actions and navigation.
- `CenteredPanel`, `Panel`, `DataCard`, `ExpandableCard`, `ConsolePanel` and `EmptyState` for surfaces.
- `Alert`, `InlineNotice`, `Toast`, `ToastViewport`, `FlashOverlay` and `SkipLink` for feedback and accessibility.
- `QuestionPanel`, `MediaPreview`, `MediaDialog` and question controls for Koalify question surfaces.
- Shared icons from `src/lib/components/icons/*`, exported through `src/lib/index.ts`.

Only add new primitives when the existing API cannot express the required layout or behavior cleanly.

## Shared CSS

MonsanUI owns `modern-normalize`, global tokens and base CSS. Consumer apps import `monsan-ui/monsan-ui.css` once and do not import another normalize file.

## Git Flow

Use a new branch for each stage. Before committing, run the project gate and inspect `git status` so generated files, secrets and unrelated local changes are not included accidentally.

Use `git add .` after confirming the worktree contains only changes intended for the commit.

Commit format:

```text
prefix: short English sentence
```

Push the branch, wait for PR review and merge, then pull `main`.

## Dependency Updates

Dependency updates should be explicit work. Update MonsanUI in consumers after MonsanUI changes are merged, then run the full gate. General dependency updates should happen in their own branch so product changes and package changes are easy to trace.
