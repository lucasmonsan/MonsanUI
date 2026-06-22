<script lang="ts">
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		value?: string;
		disabled?: boolean;
		id?: string;
		name?: string;
		title?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
	}

	let {
		value = $bindable('#c44933'),
		disabled = false,
		id,
		name,
		title,
		ariaLabel,
		ariaDescribedby,
		ariaInvalid
	}: Props = $props();

	const fallbackId = `colorpicker-${Math.random().toString(36).slice(2, 11)}`;

	let isOpen = $state(false);
	let colorInputEl = $state<HTMLInputElement>();
	let containerEl = $state<HTMLDivElement>();
	let triggerEl = $state<HTMLButtonElement>();
	let prefersReducedMotion = $state(false);
	let triggerId = $derived(id || fallbackId);
	let panelId = $derived(`${triggerId}-panel`);
	let paletteId = $derived(`${triggerId}-palette`);
	let invalid = $derived(ariaInvalid === true || ariaInvalid === 'true');

	const presetColors = [
		'#c44933',
		'#e06666',
		'#f6b26b',
		'#ffd966',
		'#93c47d',
		'#76a5af',
		'#6fa8dc',
		'#8e7cc3',
		'#c27ba0',
		'#ffffff',
		'#888888',
		'#222222'
	];

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = motionQuery.matches;

		function updateMotionPreference(event: MediaQueryListEvent) {
			prefersReducedMotion = event.matches;
		}

		motionQuery.addEventListener('change', updateMotionPreference);
		return () => {
			motionQuery.removeEventListener('change', updateMotionPreference);
		};
	});

	function selectPreset(color: string, close = true) {
		if (disabled) return;
		value = color;
		if (close) {
			closePopover(true);
		}
	}

	function handleOutsideClick(event: MouseEvent) {
		if (isOpen && containerEl && !containerEl.contains(event.target as Node)) {
			closePopover();
		}
	}

	function closePopover(focusTrigger = false) {
		isOpen = false;
		if (focusTrigger) {
			triggerEl?.focus();
		}
	}

	function focusPreset(index: number) {
		document.getElementById(`${paletteId}-option-${index}`)?.focus();
	}

	function movePreset(nextIndex: number) {
		const normalizedIndex = (nextIndex + presetColors.length) % presetColors.length;
		selectPreset(presetColors[normalizedIndex], false);
		focusPreset(normalizedIndex);
	}

	function handleRootKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			event.preventDefault();
			closePopover(true);
		}
	}

	function handlePresetKeyDown(event: KeyboardEvent, index: number) {
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			movePreset(index + 1);
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			movePreset(index - 1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			movePreset(0);
		} else if (event.key === 'End') {
			event.preventDefault();
			movePreset(presetColors.length - 1);
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			selectPreset(presetColors[index]);
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
		const colorLabel = getColorAriaLabel(value);
		return i18n.t('colorPicker.triggerLabel', { color: colorLabel });
	});
</script>

<div bind:this={containerEl} class="monsan-color-picker-container" onkeydown={handleRootKeyDown}>
	<button
		bind:this={triggerEl}
		type="button"
		class="color-picker-trigger"
		class:invalid
		id={triggerId}
		{disabled}
		{title}
		onclick={() => !disabled && (isOpen = !isOpen)}
		aria-label={ariaLabel ?? triggerAriaLabel}
		aria-describedby={ariaDescribedby}
		aria-haspopup="dialog"
		aria-expanded={isOpen}
		aria-controls={panelId}
	>
		<div class="color-preview" style:background-color={value}></div>
		<span class="color-hex">{value.toUpperCase()}</span>
	</button>

	<input
		bind:this={colorInputEl}
		id={`${triggerId}-native`}
		{name}
		type="color"
		bind:value
		class="sr-only"
		{disabled}
		aria-invalid={ariaInvalid}
		aria-describedby={ariaDescribedby}
	/>

	{#if isOpen}
		<div
			id={panelId}
			class="color-picker-dropdown panel"
			transition:scale={{
				duration: prefersReducedMotion ? 0 : 200,
				easing: backOut,
				start: prefersReducedMotion ? 1 : 0.9
			}}
		>
			<span id={`${paletteId}-label`} class="dropdown-title">{i18n.t('colorPicker.palette')}</span>
			<div class="preset-grid" role="radiogroup" aria-labelledby={`${paletteId}-label`}>
				{#each presetColors as color, index (color)}
					<button
						id={`${paletteId}-option-${index}`}
						type="button"
						class="preset-btn"
						style:background-color={color}
						class:active={value.toLowerCase() === color.toLowerCase()}
						role="radio"
						aria-checked={value.toLowerCase() === color.toLowerCase()}
						title={getColorAriaLabel(color)}
						aria-label={getColorAriaLabel(color)}
						onkeydown={(event) => handlePresetKeyDown(event, index)}
						onclick={() => selectPreset(color)}
					></button>
				{/each}
			</div>

			<button
				type="button"
				class="custom-color-btn"
				onclick={() => {
					colorInputEl?.click();
					closePopover(true);
				}}
			>
				{i18n.t('colorPicker.customize')}
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

	.color-picker-trigger.invalid {
		border-color: var(--error);
		box-shadow: 3px 3px 0px var(--error);
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

	@media (prefers-reduced-motion: reduce) {
		.color-picker-trigger,
		.preset-btn,
		.custom-color-btn {
			transition: none;
		}
	}
</style>
