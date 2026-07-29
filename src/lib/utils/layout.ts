export type MaxWidthPreset =
	| 'content'
	| 'centered'
	| 'panel'
	| 'xs'
	| 'sm'
	| 'md'
	| 'lg'
	| 'xl'
	| '2xl'
	| 'full'
	| 'none'
	| 'var(--container-max-width)'
	| 'var(--centered-panel-max-width, 512px)'
	| '400px'
	| '512px'
	| '600px'
	| '760px'
	| '1000px'
	| '1200px'
	| '1280px'
	| '1400px'
	| '100%';

export type PaddingPreset =
	| 'none'
	| 'xs'
	| 'sm'
	| 'md'
	| 'lg'
	| 'xl'
	| 'app'
	| 'flow'
	| 'document'
	| 'document-wide'
	| 'fullscreen'
	| '0'
	| '0 var(--space-md)'
	| 'var(--space-xs)'
	| 'var(--space-sm)'
	| 'var(--space-md)'
	| 'var(--space-lg)'
	| 'var(--space-xl)'
	| 'var(--space-xl) var(--space-md)'
	| 'var(--space-xl) var(--space-lg)'
	| 'var(--space-md) var(--space-md) 0 var(--space-md)';

export type HeightPreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '12px' | '16px' | '20px' | '256px';

export type ActionPanelWidthPreset =
	'dropdown' | 'compact' | 'comfortable' | 'wide' | 'max-content' | '70%' | '80%';

export type LayerPreset = 'overlay' | 'splash' | 'critical';

const maxWidthValues: Record<MaxWidthPreset, string> = {
	content: 'var(--container-max-width)',
	centered: 'var(--centered-panel-max-width, 512px)',
	panel: '512px',
	xs: '400px',
	sm: '600px',
	md: '760px',
	lg: '1000px',
	xl: '1280px',
	'2xl': '1400px',
	full: '100%',
	none: 'none',
	'var(--container-max-width)': 'var(--container-max-width)',
	'var(--centered-panel-max-width, 512px)': 'var(--centered-panel-max-width, 512px)',
	'400px': '400px',
	'512px': '512px',
	'600px': '600px',
	'760px': '760px',
	'1000px': '1000px',
	'1200px': '1200px',
	'1280px': '1280px',
	'1400px': '1400px',
	'100%': '100%'
};

const paddingValues: Record<PaddingPreset, string> = {
	none: '0',
	xs: 'var(--space-xs)',
	sm: 'var(--space-sm)',
	md: 'var(--space-md)',
	lg: 'var(--space-lg)',
	xl: 'var(--space-xl)',
	app: 'max(var(--space-md), env(safe-area-inset-top)) max(var(--space-md), env(safe-area-inset-right)) max(var(--space-md), env(safe-area-inset-bottom)) max(var(--space-md), env(safe-area-inset-left))',
	flow: 'max(var(--space-lg), env(safe-area-inset-top)) max(var(--space-md), env(safe-area-inset-right)) max(var(--space-lg), env(safe-area-inset-bottom)) max(var(--space-md), env(safe-area-inset-left))',
	document:
		'max(var(--space-xl), env(safe-area-inset-top)) max(var(--space-md), env(safe-area-inset-right)) max(var(--space-xl), env(safe-area-inset-bottom)) max(var(--space-md), env(safe-area-inset-left))',
	'document-wide':
		'max(var(--space-xl), env(safe-area-inset-top)) max(var(--space-lg), env(safe-area-inset-right)) max(var(--space-xl), env(safe-area-inset-bottom)) max(var(--space-lg), env(safe-area-inset-left))',
	fullscreen:
		'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
	'0': '0',
	'0 var(--space-md)': '0 var(--space-md)',
	'var(--space-xs)': 'var(--space-xs)',
	'var(--space-sm)': 'var(--space-sm)',
	'var(--space-md)': 'var(--space-md)',
	'var(--space-lg)': 'var(--space-lg)',
	'var(--space-xl)': 'var(--space-xl)',
	'var(--space-xl) var(--space-md)': 'var(--space-xl) var(--space-md)',
	'var(--space-xl) var(--space-lg)': 'var(--space-xl) var(--space-lg)',
	'var(--space-md) var(--space-md) 0 var(--space-md)':
		'var(--space-md) var(--space-md) 0 var(--space-md)'
};

const heightValues: Record<HeightPreset, string> = {
	xs: '8px',
	sm: '12px',
	md: '16px',
	lg: '24px',
	xl: '256px',
	'12px': '12px',
	'16px': '16px',
	'20px': '20px',
	'256px': '256px'
};

const actionPanelWidthValues: Record<ActionPanelWidthPreset, string> = {
	dropdown: 'max-content',
	compact: '50%',
	comfortable: '70%',
	wide: '80%',
	'max-content': 'max-content',
	'70%': '70%',
	'80%': '80%'
};

const layerValues: Record<LayerPreset, number> = {
	overlay: 1000,
	splash: 9999,
	critical: 2147483647
};

export function resolveMaxWidth(value: MaxWidthPreset) {
	return maxWidthValues[value];
}

export function resolvePadding(value: PaddingPreset) {
	return paddingValues[value];
}

export function resolveHeight(value: HeightPreset) {
	return heightValues[value];
}

export function resolveActionPanelWidth(value: ActionPanelWidthPreset) {
	return actionPanelWidthValues[value];
}

export function resolveLayer(value: LayerPreset) {
	return layerValues[value];
}
