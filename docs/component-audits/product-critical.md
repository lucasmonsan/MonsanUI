# Product-Critical Component Audit

Local branch: `fix/exam-badge-mobile-scaling`.

This audit covers components directly tied to Koalify/Manki product workflows.
Changes here must be smaller and validated more often because regressions can
break answer capture, study flows, drag/drop or calendar statistics.

## Changed Locally

### ChoiceCard

- Added reduced-motion handling for hover/focus transitions.
- Kept existing DOM structure, visual states and public API.

### questions/SingleChoice

- Added `type="button"` to option buttons so they do not accidentally submit
  surrounding forms.
- Replaced selected string class assembly with Svelte class directives.
- Replaced column style string with a Svelte style directive.
- Added `radiogroup`/`radio` roles and `aria-checked` state.
- Replaced `transition: all` with explicit transitions.
- Added reduced-motion handling.

### questions/MultipleChoice

- Added `type="button"` to option buttons so they do not accidentally submit
  surrounding forms.
- Replaced selected string class assembly with Svelte class directives.
- Replaced column style string with a Svelte style directive.
- Added checkbox roles and `aria-checked` state.
- Replaced inline check SVG with the shared `Check` icon.
- Replaced `transition: all` with explicit transitions.
- Added reduced-motion handling.

### Deck

- Replaced selected string class assembly with a Svelte class directive.
- Replaced delay style string with a Svelte style directive.
- Moved static pointer/position styles into CSS.
- Added `type="button"` and expanded menu semantics to the context menu trigger.
- Added accessible labels to icon-only action buttons.
- Added optional `moreOptions` and `closePopover` labels to avoid new hardcoded
  action copy in consumers.
- Added reduced-motion handling for reveal/popover/card appear transitions.

### CardEditor

- Added reduced-motion handling for card, icon button and optional field
  transitions.
- Tested a declarative header listener rewrite, but kept the manual listener
  wiring because the header intentionally supports pointer dragging while also
  containing real buttons; making it declarative created Svelte a11y warnings
  or required a false interactive role.

### Folders

- Added explicit `type="button"` to folder/add/color buttons.
- Replaced edit/delete inline dropdown SVGs with shared `Pencil` and `Trash`
  icons.
- Replaced color swatch string class assembly with Svelte class directives.
- Added menu trigger semantics for the folder options trigger.
- Added reduced-motion handling for chip, dropdown and color swatch
  transitions.

### DndOrder

- Moved grid column style string to a Svelte style directive.
- Added runtime reduced-motion detection for Svelte `animate:flip`.
- Added reduced-motion handling for item transitions.

### DndMatch

- Added runtime reduced-motion detection for Svelte `transition:scale`.
- Added reduced-motion handling for area and chip transitions.
- Kept drag/touch/keyboard movement logic intact.

### Terminal

- Moved tree indentation style string to a Svelte style directive.
- Added explicit `type="button"` to mobile tab buttons.
- Kept terminal command/VFS behavior intact.

### Calendar

- Added runtime reduced-motion detection for the month/year popover scale
  transition.
- Added explicit `type="button"` to month navigation and detail-close buttons.
- Replaced broad `transition: all` declarations with explicit transition
  properties.
- Added reduced-motion handling for calendar title, picker icon, nav buttons,
  day cells and list items.
- Kept calendar/heatmap/week/list structure intact.

## Current Consumer Notes

- `SingleChoice` and `MultipleChoice` are used by Koalify landing simulator,
  sandbox, exam route and admin preview.
- `ChoiceCard` is used by Koalify auth link selection.
- `Deck` is used by Manki home deck grid.
- `CardEditor` is used by Manki deck create/edit flow.
- `Folders` is used by Manki home folder filtering/management.
- `DndOrder`, `DndMatch` and `Terminal` are used by Koalify interactive
  question/simulator flows.
- `Calendar` is used by Manki stats/activity views.

## Pending

- Validate Koalify answer flows visually before merging package changes into
  consumers.
- Consider a shared internal option primitive for `SingleChoice` and
  `MultipleChoice` only after current behavior is locked by screenshots/tests.
- Decide whether `Terminal` should keep Portuguese/English default strings or
  require fully app-provided messages.
- Calendar still has inline SVGs and some component-owned i18n/default copy;
  those should be addressed in an icon/copy API pass, not mixed into this
  structural pass.

## Validation

- `pnpm test` in `MonsanUI`: passed after this local block with 0 Svelte errors
  and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the `Deck`/`CardEditor` block with 0
  Svelte errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the `Folders` block with 0 Svelte
  errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the DnD/Terminal block with 0 Svelte
  errors and 0 Svelte warnings.
- `pnpm test` in `MonsanUI`: passed after the `Calendar` block with 0 Svelte
  errors and 0 Svelte warnings.
