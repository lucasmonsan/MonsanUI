import { readFile } from 'node:fs/promises';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

async function readComponent(path) {
	return readFile(new URL(`../src/lib/components/${path}`, import.meta.url), 'utf8');
}

const appHeader = await readComponent('AppHeader.svelte');
const actionFooter = await readComponent('ActionFooter.svelte');
const appShell = await readComponent('AppShell.svelte');
const avatarMenu = await readComponent('AvatarMenu.svelte');
const brandHeader = await readComponent('BrandHeader.svelte');
const centeredPanel = await readComponent('CenteredPanel.svelte');
const credits = await readComponent('Credits.svelte');
const landingLayout = await readComponent('LandingLayout.svelte');
const dndMatch = await readComponent('DndMatch.svelte');
const dndOrder = await readComponent('DndOrder.svelte');
const dialog = await readComponent('Dialog.svelte');
const expandableCard = await readComponent('ExpandableCard.svelte');
const filterToolbar = await readComponent('FilterToolbar.svelte');
const formField = await readComponent('FormField.svelte');
const floatingPortal = await readFile(
	new URL('../src/lib/utils/floatingPortal.ts', import.meta.url),
	'utf8'
);
const dialogStack = await readFile(
	new URL('../src/lib/utils/dialogStack.ts', import.meta.url),
	'utf8'
);
const multipleChoice = await readComponent('questions/MultipleChoice.svelte');
const panel = await readComponent('Panel.svelte');
const responsiveGrid = await readComponent('ResponsiveGrid.svelte');
const singleChoice = await readComponent('questions/SingleChoice.svelte');
const ssoLoginButton = await readComponent('SSOLoginButton.svelte');
const splashScreen = await readComponent('SplashScreen.svelte');
const stack = await readComponent('Stack.svelte');
const suiteHeaderActions = await readComponent('SuiteHeaderActions.svelte');
const suiteUserMenu = await readComponent('SuiteUserMenu.svelte');
const themeSelector = await readComponent('ThemeSelector.svelte');
const colorPicker = await readComponent('ColorPicker.svelte');
const dataTable = await readComponent('DataTable.svelte');
const badge = await readComponent('Badge.svelte');
const badgeGroup = await readComponent('BadgeGroup.svelte');
const iconButton = await readComponent('IconButton.svelte');
const moneyInput = await readComponent('MoneyInput.svelte');
const moneyDisplay = await readComponent('MoneyDisplay.svelte');
const metricBar = await readComponent('MetricBar.svelte');
const actionBar = await readComponent('ActionBar.svelte');
const filterDialog = await readComponent('FilterDialog.svelte');
const folders = await readComponent('Folders.svelte');
const portugolRunner = await readComponent('PortugolRunner.svelte');
const portugolEditor = await readComponent('PortugolEditor.svelte');
const splitPane = await readComponent('SplitPane.svelte');

assert(
	appHeader.includes("size = 'compact'"),
	'AppHeader default must be compact, matching the Manki/Koalify suite header pattern.'
);

assert(
	actionFooter.includes('enterMotion?: boolean') &&
		actionFooter.includes('class:enter-motion={enterMotion}') &&
		actionFooter.includes('.position-fixed.enter-motion') &&
		actionFooter.includes('translateX(-50%) translateY') &&
		actionFooter.includes('@media (prefers-reduced-motion: reduce)'),
	'ActionFooter must offer optional entrance motion that respects reduced-motion preferences.'
);

assert(
	dataTable.includes('automaticLoadAvailable = $state(false)') &&
		dataTable.includes("'IntersectionObserver' in window") &&
		dataTable.includes('void requestProgressiveLoad()') &&
		dataTable.includes('{#if isClient && !automaticLoadAvailable && loadMoreLabel}') &&
		dataTable.includes('role="status"') &&
		dataTable.includes('aria-live="polite"'),
	'DataTable progressive loading must load automatically when supported, expose a manual fallback only when needed and announce its state accessibly.'
);

assert(
	dialog.includes("headerActionsGap = 'sm'") &&
		dialog.includes("size?: 'sm' | 'md' | 'lg' | 'xl'") &&
		dialog.includes('.modal-container.size-xl') &&
		dialog.includes('width: calc(100% - var(--space-md) * 2)') &&
		dialog.includes('width: calc(100% - var(--space-sm) * 2)') &&
		dialog.includes('class:closing={isClosing}') &&
		dialog.includes('prefers-reduced-motion: reduce') &&
		dialog.includes('setTimeout(finishClose, closeDuration)') &&
		dialog.includes('window.visualViewport') &&
		dialog.includes('scheduleFocusedElementVisibility') &&
		dialog.includes('scrollIntoView') &&
		dialog.includes('dismissVirtualKeyboard') &&
		dialog.includes('handleBackNavigation') &&
		dialog.includes('<Separator orientation="vertical" />'),
	'Dialog must preserve responsive viewport insets, dismiss a mobile virtual keyboard before closing on Back, keep focused fields visible above a mobile keyboard, separate header actions from close, support compact header action gaps and an extra-wide content size, and animate its exit unless reduced motion is requested.'
);

assert(
	responsiveGrid.includes('minItemWidth?: MinItemWidth | number') &&
		responsiveGrid.includes('`${minItemWidth}px`'),
	'ResponsiveGrid must support an explicit reusable pixel minimum for dense card dialogs.'
);

assert(
	responsiveGrid.includes('preset?: Preset') &&
		responsiveGrid.includes("preset === 'launcher' ? '5' : columns") &&
		responsiveGrid.includes("preset === 'launcher' ? '3' : mobileColumns") &&
		responsiveGrid.includes("preset === 'launcher' ? 'sm' : columnsBreakpoint"),
	'ResponsiveGrid launcher preset must keep three mobile columns and five columns from the shared 480px breakpoint.'
);

assert(
	panel.includes('surfaceColor?: string') &&
		panel.includes('contrastForeground(surfaceColor)') &&
		panel.includes('--monsan-surface-foreground'),
	'Panel must expose a custom color surface with a computed contrasting foreground.'
);

assert(
	badge.includes('onSurface?: boolean') && iconButton.includes('onSurface?: boolean'),
	'Badge and IconButton must support readable rendering on a custom Panel surface.'
);

assert(
	badgeGroup.includes('fit?: boolean') &&
		badgeGroup.includes('moreLabel?: (hiddenLabels: readonly string[]) => string') &&
		badgeGroup.includes('new ResizeObserver(scheduleFit)') &&
		badgeGroup.includes('data-badge-summary') &&
		badgeGroup.includes('min-width: 0;') &&
		badgeGroup.includes('text-overflow: ellipsis;'),
	'BadgeGroup must support width-aware fitting with accessible consumer-provided overflow labels without enlarging constrained cards.'
);

assert(
	moneyInput.includes("currencyDisplay?: 'code' | 'symbol'") &&
		moneyInput.includes("currencyDisplay = 'code'") &&
		moneyInput.includes("currencyDisplay: 'symbol'"),
	'MoneyInput must support an opt-in locale-aware currency symbol without changing existing code-prefix consumers.'
);

assert(
	moneyDisplay.includes("align?: 'start' | 'center' | 'end'") &&
		moneyDisplay.includes("mobileAlign?: 'start' | 'center' | 'end'") &&
		moneyDisplay.includes('fullWidth?: boolean') &&
		moneyDisplay.includes('compactLabel?: string') &&
		metricBar.includes("columns: 'one' | 'two' | 'three' | 'four'") &&
		metricBar.includes("mobileColumns?: 'one' | 'two'") &&
		metricBar.includes('.divided > :global(:not(:first-child))'),
	'MoneyDisplay and MetricBar must support aligned, proportionally distributed financial metrics.'
);

assert(
	actionBar.includes('surfaceColor?: string') &&
		actionBar.includes("align?: 'center' | 'start'") &&
		actionBar.includes('inlineSubtitle?: string') &&
		actionBar.includes('badge?: number') &&
		actionBar.includes("compactBelow?: 'sm'") &&
		actionBar.includes('flex: 0 0 var(--control-height)') &&
		actionBar.includes('color-mix(in srgb, var(--action-surface) 10%, var(--bg-primary))'),
	'ActionBar items must support softened domain colors, alignment and compact accessible counters.'
);

assert(
	folders.includes('function customColor') &&
		folders.includes('color-mix(in srgb, var(--folder-custom-color) 10%, var(--bg-secondary))') &&
		folders.includes('background: var(--folder-custom-color)') &&
		folders.includes('<ColorPicker') &&
		folders.includes('onchange={(color) => (newFolderColor = color)}'),
	'Folders must support any ColorPicker hex color as a softened passive surface and a pure active state.'
);

assert(
	colorPicker.includes('onchange?: (value: string) => void') &&
		colorPicker.includes('function handleNativeInput') &&
		colorPicker.includes('onchange?.(color)'),
	'ColorPicker must notify consumers about preset and custom color changes.'
);

assert(
	filterDialog.includes('showTrigger?: boolean') &&
		filterDialog.includes('showTrigger = true') &&
		filterDialog.includes('compactActions?: boolean') &&
		filterDialog.includes('compactApplyLabel?: string') &&
		filterDialog.includes('headerActions?: Snippet') &&
		filterDialog.includes('{#if showTrigger}'),
	'FilterDialog must support a shared trigger and compact header/footer actions.'
);

assert(
	dialog.includes('min(85dvh') && !dialog.includes('min(85vh'),
	'Dialog viewport caps must use dynamic viewport units.'
);

assert(
	dialog.includes('window.visualViewport') &&
		dialog.includes('scheduleFocusedElementVisibility') &&
		dialog.includes('dismissVirtualKeyboard') &&
		dialogStack.includes('history.pushState'),
	'Dialog must preserve the visual viewport, keep a focused field visible, dismiss the virtual keyboard safely and retain the current route in history.'
);

assert(
	portugolRunner.includes('if (pendingInputVar) return;') &&
		/disabled=\{disabled\s*\|\|\s*Boolean\(pendingInputVar\)/.test(portugolRunner),
	'PortugolRunner must not advance step execution while a read input is pending.'
);

assert(
	splitPane.includes('fill?: boolean') &&
		splitPane.includes('class:fill') &&
		splitPane.includes('.monsan-split-pane.fill') &&
		splitPane.includes('flex: 1 1 auto'),
	'SplitPane must opt into filling its constrained parent without expanding the page scroll region.'
);

assert(
	portugolRunner.includes('min-height: 0;') &&
		portugolRunner.includes('flex: 1 1 auto;') &&
		portugolRunner.includes('position: absolute;') &&
		portugolRunner.includes('bottom: 16px;'),
	'PortugolRunner fill mode must retain a constrained editor area and its floating controls.'
);

assert(
	portugolEditor.includes("scrollbarWidth: 'none'") &&
		portugolEditor.includes("'& .cm-scroller::-webkit-scrollbar'"),
	'PortugolEditor must keep its code scroll area visually discreet without disabling scrolling.'
);

assert(
	panel.includes('ariaLabel?: string') && panel.includes('aria-label={ariaLabel}'),
	'Panel must support an accessible name when used as an interactive surface.'
);

assert(
	colorPicker.includes('bind:this={colorInputEl}') &&
		!colorPicker.includes("{#if variant === 'default'}\n\t\t<input"),
	'ColorPicker swatches must retain access to the native custom-color input.'
);

assert(
	colorPicker.includes("import { floatingPortal } from '../utils/floatingPortal.js'") &&
		colorPicker.includes('use:floatingPortal={{') &&
		colorPicker.includes('anchor: triggerEl'),
	'ColorPicker must portal its palette outside clipping dialog content while retaining dialog-stack ownership.'
);

assert(
	avatarMenu.includes("size = 'control'"),
	'AvatarMenu default must match control height for header/account actions.'
);

assert(
	avatarMenu.includes("shape = 'square'"),
	'AvatarMenu default must be square to match the MonsanUI visual language.'
);

assert(
	brandHeader.includes('adaptiveLogo = false') &&
		brandHeader.includes('class="brand-logo brand-logo-image"') &&
		brandHeader.includes('class="brand-logo brand-logo-mask"'),
	'BrandHeader must preserve source logo colors by default and reserve adaptive masking for explicit opt-in.'
);

assert(
	landingLayout.includes('descriptionLines: readonly [string, string]') &&
		landingLayout.includes('<AppShell {fullHeight} showScrollFades={false}>') &&
		landingLayout.includes('{#snippet bottom()}') &&
		landingLayout.includes('<CenteredPanel {fullHeight}>') &&
		landingLayout.includes('<Stack gap="md" fullWidth align="center" textAlign="center">') &&
		landingLayout.includes('<Stack gap="sm" fullWidth>') &&
		landingLayout.includes('<PreferenceBar>') &&
		landingLayout.includes(
			'<Credits placement="page-bottom" variant="compact" spacing="default" />'
		),
	'LandingLayout must own the common two-line landing composition, action rhythm, preferences controls and structural Credits.'
);

assert(
	landingLayout.includes('white-space: nowrap') &&
		centeredPanel.includes('padding-inline-start: max(') &&
		centeredPanel.includes('env(safe-area-inset-left)') &&
		centeredPanel.includes('padding-inline-end: max(') &&
		centeredPanel.includes('env(safe-area-inset-right)'),
	'LandingLayout must preserve two visual description lines and CenteredPanel must protect both horizontal safe areas.'
);

assert(
	credits.includes("'https://github.com/lucasmonsan'") &&
		credits.includes('color: var(--accent-primary)') &&
		!credits.includes('text-decoration-line: underline') &&
		!credits.includes('⚡'),
	'Credits must link the default Monsan author to its GitHub profile, use the suite accent and avoid decorative lightning or underlines.'
);

assert(
	!themeSelector.includes('binary-theme-icons') &&
		themeSelector.includes('document.documentElement.getAttribute') &&
		themeSelector.includes('theme-icon-current'),
	'ThemeSelector must render one active icon and initialize from the document theme when available.'
);

assert(
	appShell.includes('hasOverflowTop = scrollEl.scrollTop > threshold') &&
		appShell.includes(
			'scrollEl.scrollTop + scrollEl.clientHeight < scrollEl.scrollHeight - threshold'
		),
	'AppShell overflow fade must show the top edge only after real upward scrolling.'
);

assert(
	appShell.includes('showTop = true') && appShell.includes('{#if top && showTop}'),
	'AppShell must allow consumers to hide the complete top region without removing its snippet.'
);

assert(
	appShell.includes('class="app-shell-header-content"') &&
		appShell.includes('class="app-shell-top-content"') &&
		appShell.includes('.viewport-scroll .app-shell-header-content') &&
		appShell.includes('.viewport-scroll .app-shell-top-content') &&
		appShell.includes('width: min(100%, var(--container-max-width));'),
	'AppShell viewportScroll must constrain header and top content to the same maximum width as the main content.'
);

assert(
	splashScreen.includes('animation: splashFailsafe 0s linear 10s forwards') &&
		splashScreen.includes('@keyframes splashFailsafe') &&
		splashScreen.includes('visibility: hidden') &&
		splashScreen.includes('pointer-events: none'),
	'SplashScreen must release SSR content even when client hydration never runs.'
);

assert(
	dndMatch.includes('value?: Record<string, string[]> | null') &&
		dndMatch.includes('let safeValue = $derived(isMatchValue(value) ? value : {})') &&
		dndMatch.includes('getOccurrenceKey(safeValue[bucket] || [], itemIndex)'),
	'DndMatch must render a null bound answer safely before its initialization effect runs.'
);

for (const [name, source] of [
	['DndMatch', dndMatch],
	['DndOrder', dndOrder],
	['MultipleChoice', multipleChoice],
	['SingleChoice', singleChoice]
]) {
	assert(
		source.includes('getOccurrenceKey'),
		`${name} must use occurrence-aware render keys so duplicate labels cannot crash the UI.`
	);
}

assert(
	filterToolbar.includes('.filter-toolbar-filters > :global(.monsan-select-container)') &&
		filterToolbar.includes('.filter-toolbar-filters > :global(.monsan-multiselect-container)') &&
		!filterToolbar.includes('.filter-toolbar-filters :global(.monsan-select-container),'),
	'FilterToolbar sizing must only target direct controls so nested dialog fields remain content-sized.'
);

assert(
	expandableCard.includes("variant?: 'default' | 'success' | 'archived'") &&
		expandableCard.includes('.monsan-expandable-card.variant-archived'),
	'ExpandableCard must expose an explicit, semantic archived visual variant.'
);

assert(
	floatingPortal.includes('requiredStableFrames') &&
		floatingPortal.includes("node.dataset.floatingPositioned = 'true';") &&
		floatingPortal.indexOf("node.dataset.floatingPositioned = 'true';") <
			floatingPortal.indexOf("node.style.visibility = 'visible';"),
	'Floating overlays must wait for stable geometry and expose positioned state before becoming visible.'
);

assert(
	/function mount\(\) \{[\s\S]*?node\.style\.visibility = 'hidden';[\s\S]*?node\.style\.position = 'fixed';[\s\S]*?ensurePortalRoot\(\);/.test(
		floatingPortal
	),
	'Floating overlays must leave document flow before entering the portal or measuring geometry.'
);

assert(
	/<\/label>\s*\{#if info\}\s*<InfoTooltip/.test(formField) &&
		!/<label[\s\S]*?<InfoTooltip[\s\S]*?<\/label>/.test(formField),
	'FormField must keep interactive help outside its label so the label cannot intercept the trigger.'
);

assert(
	/<button\s+type="button"[\s\S]*?class="info-trigger"/.test(
		await readComponent('InfoTooltip.svelte')
	),
	'InfoTooltip must expose a native button target for reliable pointer and keyboard interaction.'
);

assert(
	!/\.app-shell-content\s*\{[\s\S]*?\n\s*height:\s*100%;/.test(appShell),
	'AppShell content must not force height: 100%; it clips card shadows and vertical content flow.'
);

assert(
	/\.app-shell-content\.full-height\s*\{[\s\S]*?flex:\s*1 1 auto;[\s\S]*?min-height:\s*0;[\s\S]*?height:\s*100%;/.test(
		appShell
	),
	'AppShell fullHeight must establish a concrete content height for constrained workspaces without changing normal page flow.'
);

assert(
	/\.full-height\s*\{[\s\S]*?flex:\s*1 1 auto;[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*0;/.test(
		stack
	),
	'Stack fullHeight must grow inside flex parents so tool surfaces can fill AppShell content height.'
);

assert(
	ssoLoginButton.includes('class="account-main"') &&
		ssoLoginButton.includes('aria-haspopup="menu"') &&
		ssoLoginButton.includes('<DotsThreeVerticalIcon size={18} />'),
	'SSOLoginButton logged-in state must open its menu from the whole account button.'
);

assert(
	!ssoLoginButton.includes('square\n\t\t\t\t\t{disabled}\n\t\t\t\t\tariaLabel={accountMenuLabel}'),
	'SSOLoginButton logged-in state must not render a separate square menu button.'
);

for (const [name, source] of [
	['SuiteHeaderActions', suiteHeaderActions],
	['SuiteUserMenu', suiteUserMenu]
]) {
	assert(
		source.includes("PanelShadow = 'default'") || source.includes("panelShadow = 'default'"),
		`${name} menu panel shadow must default to default.`
	);
	assert(
		source.includes("PanelPadding = 'sm'") || source.includes("panelPadding = 'sm'"),
		`${name} menu panel padding must default to sm.`
	);
	assert(
		source.includes("PanelGap = 'sm'") || source.includes("panelGap = 'sm'"),
		`${name} menu panel gap must default to sm.`
	);
}

console.log('Component default tests passed.');
