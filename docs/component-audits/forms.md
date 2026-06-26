# Form Component Audit

Local branch: `fix/exam-badge-mobile-scaling`.

This audit covers the first form pass from the MonsanUI component simplification
plan. The goal is to keep form structure accessible while avoiding local app
compensation.

## Changed Locally

### Input

- Moved password toggle default labels to MonsanUI i18n.
- Preserved `showPasswordLabel` and `hidePasswordLabel` override props.
- Added reduced-motion handling for input and toggle transitions.

### Textarea

- Replaced row custom-property string style with Svelte style directives.
- Added reduced-motion handling for focus transition.

### Select

- Moved the default placeholder to MonsanUI i18n.
- Preserved the `placeholder` override prop.
- Added reduced-motion handling for trigger, chevron and option transitions.

### MultiSelect

- Moved the default placeholder to MonsanUI i18n through the same select
  placeholder key.
- Preserved the `placeholder` override prop and `formatSelected`.
- Added reduced-motion handling for trigger, chevron and option transitions.

### Checkbox

- Replaced manual wrapper class string assembly with Svelte class directives.
- Replaced inline check SVG with the shared `Check` icon component.
- Removed non-essential internal comments from the component CSS.
- Added reduced-motion handling.

### Radio

- Replaced manual wrapper class string assembly with Svelte class directives.
- Removed non-essential internal comments from the component CSS.
- Added reduced-motion handling.

### Range

- Replaced custom-property string style with a Svelte style directive.
- Clamped the computed fill percentage and guarded against `max === min`.
- Removed non-essential internal comments from the component CSS.
- Added reduced-motion handling for slider thumbs.

### SearchBar

- Moved default placeholder and clear button label to MonsanUI i18n.
- Preserved the `placeholder` and `clearLabel` override props.
- Replaced inline search and clear SVGs with shared icon components.
- Added reduced-motion handling for CSS transitions and Svelte scale dropdown
  transitions.

### Search

- Moved default title, placeholder and no-results message to MonsanUI i18n.
- Preserved title/message override props.
- Replaced inline folder SVG with the shared `Folder` icon component.

### DatePicker

- Replaced inline calendar SVG with the shared `CalendarBlank` icon component.
- Removed non-essential internal comments.
- Added reduced-motion handling for the trigger and Svelte scale dropdown
  transition.

### TimePicker

- Removed non-essential internal comments.
- Added reduced-motion handling for trigger, number buttons, confirm button and
  Svelte scale dropdown transition.

### ColorPicker

- Moved hardcoded panel title, custom button label and trigger label template to
  MonsanUI i18n.
- Moved `i18n` import to the script import block.
- Replaced background-color string styles with Svelte style directives.
- Removed non-essential internal comments.
- Added reduced-motion handling for CSS transitions and Svelte scale dropdown
  transition.

### Chips

- Moved default placeholder and remove-label template to MonsanUI i18n.
- Preserved `placeholder` and `removeLabel` override props.
- Replaced inline remove SVG with the shared `X` icon component.
- Removed non-essential internal comments.
- Added reduced-motion handling.

### FileUpload

- Replaced repeated inline upload/remove SVGs with shared `Upload` and `X`
  icons.
- Added reduced-motion handling for dropzones, buttons and overlay animations.
- Preserved all variants: `default`, `invisible`, `compact` and `overlay`.

## Audited Without Code Changes

### FormField

Current structure is small and semantic: wrapper, label and children. It does
not yet own helper/error text. Adding helper/error support should be a separate
API step because consumers would need to opt into `aria-describedby` IDs.

### FieldGroup

Current structure is semantic: `fieldset`, `legend` and children. No safe
wrapper removal was identified.

### FormStack

Current structure is a single `<form>` wrapper. No structural simplification was
needed.

## Pending

- Decide whether `FormField` should grow explicit `helper` and `error` regions
  with generated IDs, or remain a minimal label wrapper.
- `FileUpload` still has repeated file-list markup between variants. This can
  be simplified with snippets in a later pass, but it was not changed here to
  avoid increasing risk in drag/drop behavior.

## Validation

- `pnpm test` in `MonsanUI`: passed with 0 Svelte warnings after the local
  form-control and complex-form changes.
