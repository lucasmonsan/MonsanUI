import { readFile } from 'node:fs/promises';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

async function readComponent(path) {
	return readFile(new URL(`../src/lib/components/${path}`, import.meta.url), 'utf8');
}

const appHeader = await readComponent('AppHeader.svelte');
const appShell = await readComponent('AppShell.svelte');
const avatarMenu = await readComponent('AvatarMenu.svelte');
const brandHeader = await readComponent('BrandHeader.svelte');
const dndMatch = await readComponent('DndMatch.svelte');
const dndOrder = await readComponent('DndOrder.svelte');
const filterToolbar = await readComponent('FilterToolbar.svelte');
const multipleChoice = await readComponent('questions/MultipleChoice.svelte');
const singleChoice = await readComponent('questions/SingleChoice.svelte');
const ssoLoginButton = await readComponent('SSOLoginButton.svelte');
const splashScreen = await readComponent('SplashScreen.svelte');
const stack = await readComponent('Stack.svelte');
const suiteHeaderActions = await readComponent('SuiteHeaderActions.svelte');
const suiteUserMenu = await readComponent('SuiteUserMenu.svelte');
const themeSelector = await readComponent('ThemeSelector.svelte');

assert(
	appHeader.includes("size = 'compact'"),
	'AppHeader default must be compact, matching the Manki/Koalify suite header pattern.'
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
	appShell.includes('hasMeaningfulOverflow') &&
		appShell.includes('contentHeight > scrollEl.clientHeight + threshold'),
	'AppShell overflow fade must require meaningful content overflow before showing edge borders.'
);

assert(
	appShell.includes('showTop = true') && appShell.includes('{#if top && showTop}'),
	'AppShell must allow consumers to hide the complete top region without removing its snippet.'
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
