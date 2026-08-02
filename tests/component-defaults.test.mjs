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
const badge = await readComponent('Badge.svelte');
const iconButton = await readComponent('IconButton.svelte');

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
	dialog.includes("headerActionsGap = 'sm'") &&
		dialog.includes('class:closing={isClosing}') &&
		dialog.includes('prefers-reduced-motion: reduce') &&
		dialog.includes('setTimeout(finishClose, closeDuration)'),
	'Dialog must support compact header action gaps and animate its exit unless reduced motion is requested.'
);

assert(
	responsiveGrid.includes('minItemWidth?: MinItemWidth | number') &&
		responsiveGrid.includes('`${minItemWidth}px`'),
	'ResponsiveGrid must support an explicit reusable pixel minimum for dense card dialogs.'
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
