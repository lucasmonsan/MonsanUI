import { readFile } from 'node:fs/promises';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

async function readComponent(path) {
	return readFile(new URL(`../src/lib/components/${path}`, import.meta.url), 'utf8');
}

const appHeader = await readComponent('AppHeader.svelte');
const avatarMenu = await readComponent('AvatarMenu.svelte');
const ssoLoginButton = await readComponent('SSOLoginButton.svelte');
const suiteHeaderActions = await readComponent('SuiteHeaderActions.svelte');
const suiteUserMenu = await readComponent('SuiteUserMenu.svelte');

assert(
	appHeader.includes("size = 'compact'"),
	'AppHeader default must be compact, matching the Manki/Examster suite header pattern.'
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
		source.includes("PanelShadow = 'none'") || source.includes("panelShadow = 'none'"),
		`${name} menu panel shadow must default to none.`
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
