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

Recommended additions to reduce consumer style debt:

- `AppShell` for app-level header, content and footer structure.
- `PageShell` for page height, padding, overflow and entry motion.
- `PageHeader` for title, subtitle, actions and metrics.
- `ContentRegion` for scrollable content with optional edge fades.
- `ResponsiveGrid` for repeated cards and lists.
- `ActionFooter` for sticky or fixed action bars.
- `DataCard` for admin records with header, fields and footer actions.
- `StatusDot` and `StatusPill` for health, review and engine states.
- `ConsolePanel` for logs, benchmark output and AI engine output.
- `QuestionPanel` and `MediaPreview` for Examster question surfaces.
- `SkipLink`, `ToastHost` and `FlashMessage` for shared accessibility and feedback.
- Motion presets for enter, pulse, shake and fade transitions.

## Shared CSS

MonsanUI owns `modern-normalize`, global tokens and base CSS. Consumer apps import `monsan-ui/monsan-ui.css` once and do not import another normalize file.

## Git Flow

Use a new branch for each stage. Before committing, run the project gate and inspect `git status` so generated files, secrets and unrelated local changes are not included accidentally.

Prefer explicit staging after review over `git add .` as an automatic rule.

Commit format:

```text
prefix: short English sentence
```

Push the branch, wait for PR review and merge, then pull `main`.

## Dependency Updates

Dependency updates should be explicit work. Update MonsanUI in consumers after MonsanUI changes are merged, then run the full gate. General dependency updates should happen in their own branch so product changes and package changes are easy to trace.
