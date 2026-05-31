<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	interface Props extends Omit<HTMLButtonAttributes, 'value' | 'type'> {
		value?: string;
		disabled?: boolean;
	}

	let {
		value = $bindable('#c44933'),
		disabled = false,
		...rest
	}: Props = $props();

	let isOpen = $state(false);
	let colorInputEl = $state<HTMLInputElement>();
	let containerEl = $state<HTMLDivElement>();

	const presetColors = [
		'#c44933', // Rust Accent
		'#e06666', // Soft Red
		'#f6b26b', // Orange
		'#ffd966', // Yellow
		'#93c47d', // Green
		'#76a5af', // Teal
		'#6fa8dc', // Light Blue
		'#8e7cc3', // Violet
		'#c27ba0', // Magenta
		'#ffffff', // White
		'#888888', // Gray
		'#222222' // Black
	];

	function selectPreset(color: string) {
		if (disabled) return;
		value = color;
		isOpen = false;
	}

	function handleOutsideClick(event: MouseEvent) {
		if (isOpen && containerEl && !containerEl.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleOutsideClick, { capture: true });
			return () => {
				document.removeEventListener('click', handleOutsideClick, { capture: true });
			};
		}
	});

	import { i18n } from '../utils/i18n.svelte';

	const colorNames: Record<string, Record<string, string>> = {
		'#c44933': { pt: 'Ferrugem', en: 'Rust', es: 'Óxido' },
		'#e06666': { pt: 'Vermelho claro', en: 'Soft Red', es: 'Rojo claro' },
		'#f6b26b': { pt: 'Laranja', en: 'Orange', es: 'Naranja' },
		'#ffd966': { pt: 'Amarelo', en: 'Yellow', es: 'Amarillo' },
		'#93c47d': { pt: 'Verde', en: 'Green', es: 'Verde' },
		'#76a5af': { pt: 'Azul-petróleo', en: 'Teal', es: 'Azul verdoso' },
		'#6fa8dc': { pt: 'Azul claro', en: 'Light Blue', es: 'Azul claro' },
		'#8e7cc3': { pt: 'Violeta / Roxo', en: 'Violet', es: 'Violeta' },
		'#c27ba0': { pt: 'Magenta / Rosa', en: 'Magenta', es: 'Magenta' },
		'#ffffff': { pt: 'Branco', en: 'White', es: 'Blanco' },
		'#888888': { pt: 'Cinza', en: 'Gray', es: 'Gris' },
		'#222222': { pt: 'Preto', en: 'Black', es: 'Negro' }
	};

	function getColorAriaLabel(color: string) {
		const locale = i18n.locale || 'pt';
		const name =
			colorNames[color.toLowerCase()]?.[locale] || colorNames[color.toLowerCase()]?.['en'] || color;
		return name;
	}

	let triggerAriaLabel = $derived.by(() => {
		const locale = i18n.locale || 'pt';
		const colorLabel = getColorAriaLabel(value);
		if (locale === 'pt') return `Seletor de cor. Cor atual: ${colorLabel}`;
		if (locale === 'es') return `Selector de color. Color actual: ${colorLabel}`;
		return `Color picker. Current color: ${colorLabel}`;
	});
</script>

<div bind:this={containerEl} class="monsan-color-picker-container ">
	<button
		type="button"
		class="color-picker-trigger"
		{disabled}
		onclick={() => !disabled && (isOpen = !isOpen)}
		aria-label={triggerAriaLabel}
		aria-expanded={isOpen}
		{...rest}
	>
		<div class="color-preview" style="background-color: {value};"></div>
		<span class="color-hex">{value.toUpperCase()}</span>
	</button>

	<!-- Input nativo invisível para picker customizado -->
	<input bind:this={colorInputEl} type="color" bind:value class="sr-only" {disabled} />

	{#if isOpen}
		<div
			class="color-picker-dropdown panel"
			transition:scale={{ duration: 200, easing: backOut, start: 0.9 }}
		>
			<span class="dropdown-title">Paleta de Cores</span>
			<div class="preset-grid">
				{#each presetColors as color (color)}
					<button
						type="button"
						class="preset-btn"
						style="background-color: {color};"
						class:active={value.toLowerCase() === color.toLowerCase()}
						title={getColorAriaLabel(color)}
						aria-label={getColorAriaLabel(color)}
						onclick={() => selectPreset(color)}
					></button>
				{/each}
			</div>

			<button
				type="button"
				class="custom-color-btn"
				onclick={() => {
					colorInputEl?.click();
					isOpen = false;
				}}
			>
				Personalizar...
			</button>
		</div>
	{/if}
</div>

<style>
	.monsan-color-picker-container {
		position: relative;
		display: inline-block;
		font-family: var(--font-body);
	}

	.color-picker-trigger {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		height: var(--control-height);
		padding: 0 var(--space-md);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		color: var(--text-primary);
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	.color-picker-trigger:hover:not(:disabled) {
		border-color: var(--accent-primary);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px var(--accent-primary);
	}

	.color-picker-trigger:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.color-preview {
		width: 20px;
		height: 20px;
		border: 2px solid var(--border-color);
		border-radius: 4px;
		flex-shrink: 0;
	}

	.color-hex {
		font-size: var(--text-sm);
		font-weight: bold;
		letter-spacing: 0;
	}

	/* Hidden native color input */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* Dropdown Popover */
	.color-picker-dropdown {
		position: absolute;
		top: calc(100% + var(--space-xs));
		left: 0;
		z-index: 1000;
		width: 190px;
		padding: var(--space-md);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.dropdown-title {
		font-size: var(--text-xs);
		font-weight: bold;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0;
	}

	/* Preset Grid */
	.preset-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-sm);
	}

	.preset-btn {
		width: 32px;
		height: 32px;
		border: 2px solid var(--border-color);
		border-radius: var(--radius-sm);
		cursor: pointer;
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			border-color 0.2s ease;
	}

	.preset-btn:hover {
		transform: scale(1.08) translate(-1px, -1px);
		box-shadow: 2px 2px 0px var(--border-color);
	}

	.preset-btn.active {
		transform: scale(1.08);
		box-shadow: 2px 2px 0px var(--accent-primary);
		border-color: var(--accent-primary);
	}

	/* Custom Color Button */
	.custom-color-btn {
		background-color: var(--bg-secondary);
		border: 2px solid var(--border-color);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		font-weight: bold;
		padding: var(--space-xs);
		font-size: var(--text-xs);
		cursor: pointer;
		text-align: center;
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out);
	}

	.custom-color-btn:hover {
		background-color: var(--bg-primary);
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0px var(--border-color);
	}
</style>
