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

- `packageManager` is `pnpm@11.17.0`.
- `type` is `module`.
- `lint` is `prettier --check . && eslint .`.
- `.prettierrc` matches the suite Prettier config.
- `.prettierignore` contains required generated-output ignores and does not contain broad source ignores.
- `eslint.config.js` uses the shared recommended configs, TypeScript/Svelte parser settings, `no-undef` handling and `svelte/no-navigation-without-resolve`.

## Component Ownership

New visual or layout needs should be added to MonsanUI first. Consumer apps should keep domain logic, data loading and app-specific text, but reusable layout and aesthetic behavior belongs here.

Use existing primitives before adding new ones:

- `AppShell` for every app page, with fixed suite padding, max-width, optional header/top/bottom/footer, `floatingAction` and `status` regions and internally scrolling content.
- `AppHeader` and `ContentRegion` for page structure inside the shell.
- `Stack`, `Inline`, `Grid` and `ResponsiveGrid` for composition.
- `ActionFooter`, `ActionBar`, `ButtonGroup`, `QuickActions` and `Tabs` for actions and navigation.
- `CenteredPanel`, `Panel`, `DataCard`, `ExpandableCard`, `ConsolePanel` and `EmptyState` for surfaces.
- `Alert`, `InlineNotice`, `Toast`, `ToastViewport`, `FlashOverlay` and `SkipLink` for feedback and accessibility.
- `QuestionPanel`, `MediaPreview`, `MediaDialog` and question controls for Koalify question surfaces.
- Shared icons from `src/lib/components/icons/*`, exported through `src/lib/index.ts`.

Only add new primitives when the existing API cannot express the required layout or behavior cleanly.

## Interaction And Mobile Composition Contract

### Dialogs And Editable Forms

- `Dialog` owns the modal history layer, focus restoration, Escape handling and
  mobile virtual-keyboard handling. Consumers must not add parallel browser
  history or keyboard listeners for a dialog.
- When a focused text control is covered by the virtual keyboard, browser back
  first dismisses that keyboard. A subsequent back action may close the dialog
  according to its close policy.
- An editor with unsaved data must use `onBeforeClose(reason)` as a synchronous
  close guard. Return `false`, retain the editor state and open an app-owned
  discard confirmation. The reason is one of `back`, `escape`, `outside` or
  `close-button`.
- Editors that can lose work must set `closeOnOutsideClick={false}`. They must
  use the header close control as the dismissal affordance; do not duplicate it
  with an X control in the footer.
- A confirmation dialog is a decision surface, not an editor. Its explicit
  cancel and confirm actions may remain in the footer.

### Action Hierarchy And Footer Alignment

- Completion actions — save, add, apply, continue, finish, confirm and similar
  actions that advance or commit work — use `Button` with both a meaningful
  shared icon and visible text. They are placed at the extreme end (right in
  left-to-right layouts) of their action region.
- Supporting, reset and navigation actions begin at the opposite edge and are
  ordered from that edge inward. A footer with a reset and an apply action,
  for example, places reset at the start and apply at the end.
- Dense, reversible utilities may use `IconButton` with an accessible `label`.
  Destructive actions may remain icon-only when the trash/archive icon is
  unambiguous and still has that accessible label.
- Consumers compose these regions with `Inline` or `ActionFooter`; they do not
  use app-owned CSS to reposition MonsanUI buttons.

### Workspace Primary Actions And Status

- A workspace whose primary creation actions must remain available uses
  `AppShell.floatingAction` with `FloatingActionMenu`, instead of an app-owned
  fixed footer. The dock overlays the scroll area instead of consuming a
  layout row; the shell owns its safe-area spacing and the content clearance
  that keeps the last item visible above it.
- `FloatingActionMenu` is for one primary action with up to three closely
  related choices. Its square trigger rotates as a whole by 45 degrees when
  open, so the plus becomes a close affordance. The choices fan out above it,
  retain visible icon-and-text labels, may use semantic variants for distinct
  domains, and close on outside press, Escape, browser back or selection.
- `AppShell.status` is a non-interactive, bottom-most status region. It is
  outside the scroll area and below the floating action. Consumers use a short
  localized `Text nowrap` message when the status must stay on one line; they
  do not add their own fixed positioning or safe-area CSS.
- During a temporary mode such as list selection, the consumer may replace the
  floating action snippet with that mode's action bar. The temporary mode must
  still own browser back before page navigation.

### Avatar Preferences And Shortcuts

- `SuiteHeaderActions` and `SuiteUserMenu` place suite preferences inside the
  Avatar menu. Theme remains an icon button and locale remains the compact
  `PT`/`EN`/`ES` control, both with accessible names and their existing
  behavior.
- App-specific compact shortcuts belong in `userMenuShortcuts`; destructive
  app actions belong in `userMenuDangerActions`, after ordinary links. Both
  slots keep application copy and behavior out of MonsanUI while preserving the
  shared menu structure.

### Search And Filters

- `Search` renders controls below its query field by default. Set
  `inlineControlsOnMobile` only when a short search scope or filter must share
  one row with the query field on narrow screens. The control must remain
  usable with an ellipsized label and an accessible name.
- `FilterDialog` keeps reset/clear at the start of its footer and apply at the
  end. With `compactActions`, both actions retain an icon and visible text.
  Use `showCancelAction={false}` when the header close control already owns
  dismissal.
- Filter labels describe the field; option labels describe the resulting state.
  Do not repeat a long field label verbatim as an option label.
- `FormField gridSpan="full"` spans every column of a parent CSS grid. Use it
  for a long or conceptually independent field so short related fields can
  remain paired in the remaining grid rows.

### Mobile Data Lists

- A selectable mobile `DataTable` is opt-in: provide `mobileRow`, bind
  `mobileSelectionMode`, and set `closeMobileSelectionOnBack` when browser back
  must clear selection before navigation. `DataTable` owns the temporary back
  layer and clears the selection when its final item is deselected.
- The default long-press duration is 500 ms. The table cancels the gesture on
  pointer movement, scrolling/cancellation or pointer release, and suppresses
  the activation click after a successful long press.
- For a card that is one interactive target, use `DataCard` with
  `textSelectable={false}`. The normal press opens the row; long press enters
  selection. In selection mode, pass `selected` to the selected card and
  `muted` to its peers. Selection must use the semantic selected treatment,
  not a domain-specific surface color.
- `DataTable` groups rows with `groupBy`. `groupLabel` may return a string or
  `{ leading, trailing }` for labels such as a localized month and year.
  Group labels render in desktop tables and mobile lists. On mobile, only the
  active group heading becomes sticky; it transitions as the next group reaches
  the top and owns the single gradient used to separate it from scrolling
  content. Its heading stays above the `Content` scroll fade while `AppShell`
  keeps the content edge line above it. Filtering happens before grouping and
  app-specific sorting stays within each group.

### Compact Context Labels

- `ActionBar` supports `inlineSubtitle` for a secondary, semantically distinct
  value shown after the main label. It is part of the accessible action label
  and is the preferred pattern for compact name–type context such as a wallet
  name followed by its mode.
- Use `FormField`, `ActionBar` and `DataCard` props for these composition needs
  instead of adding consumer classes or selectors.

### Compact Panel Context And Feedback

- `Panel` accepts an optional `plaque` snippet for compact context that must sit
  over the centre of the top border. Use `PanelPlaque` for the shared title and
  optional subtitle treatment. The panel reserves its own internal clearance;
  consumers must not position, pad or style the plaque themselves.
- A plaque is visual context, not a nested control. When the whole panel opens
  a detail or chooser, make the `Panel` the single interactive target and give
  it an accessible name that includes the relevant context.
- Use `IconButton count` for a compact active-filter counter. The visible count
  is included in its accessible name; do not add an app-owned badge around the
  button.
- Use one `ToastViewport` per app shell for transient feedback. It shows at
  most three notifications, keeps warnings, errors and action-required items
  visible until dismissal or resolution, and automatically expires ordinary
  information and success feedback. Provide localized `dismissLabel` and let
  validation messages remain associated with their own form fields.

## Shared CSS

MonsanUI owns `modern-normalize`, global tokens and base CSS. Consumer apps import `monsan-ui/monsan-ui.css` once and do not import another normalize file.

## Git Flow

## AI Project Execution Prohibition

No AI agent may start, run, preview or serve MonsanUI or any Monsan Suite
project. This prohibition includes `pnpm dev`, `dev:fast`, `dev:fresh`,
`preview`, `start`, `vite dev`, local app servers, browser-driven manual flows,
and starting Owlth or another supporting service. Only the user may start a
project process or perform a manual browser/SSO validation. AI agents may run
non-serving static checks only when separately authorized by the workspace
rules.

AI agents may create and switch branches or isolated worktrees, inspect Git
state, stage intended changes and create local commits. They must not push,
pull, fetch, merge, rebase, reset, checkout of a non-branch target or create a
PR without a separate explicit user command.

Run the full gate before PR:

```bash
pnpm test
```

No implementation, documentation, tooling or config change may be reported as complete, committed or pushed until the project gate passes. If the gate cannot be run in the current environment, the work must be reported as not validated.

GitHub Actions runs the same gate on pull requests and branch pushes through `.github/workflows/ci.yml`.

Install the versioned local hook once per checkout:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

The pre-commit hook runs:

```bash
pnpm test
git diff --check
```

GitHub branch protection for `main` must require the `CI / Test` status check before merge.

Use a new branch for each stage. Before committing, run the project gate and inspect `git status` so generated files, secrets and unrelated local changes are not included accidentally.

Use `git add .` after confirming the worktree contains only changes intended for the commit.

Commit format:

```text
prefix: short English sentence
```

Push the branch, wait for PR review and merge, then pull `main`.

## Dependency Updates

Dependency updates should be explicit work. Update MonsanUI in consumers after MonsanUI changes are merged, then run the full gate. General dependency updates should happen in their own branch so product changes and package changes are easy to trace.
