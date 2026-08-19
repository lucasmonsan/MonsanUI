<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { i18n } from '../utils/i18n.svelte';

	interface Props {
		value?: string | number | null;
		size?: 'sm' | 'md';
		variant?: 'default' | 'unstyled' | 'title';
		showPasswordToggle?: boolean;
		showPasswordLabel?: string;
		hidePasswordLabel?: string;
		width?: 'full' | 'auto';
		id?: string;
		name?: string;
		type?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		inputmode?: HTMLInputAttributes['inputmode'];
		min?: string | number;
		max?: string | number;
		step?: string | number;
		minlength?: number;
		maxlength?: number;
		pattern?: string;
		title?: string;
		role?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
		ariaAutocomplete?: 'none' | 'inline' | 'list' | 'both';
		ariaControls?: string;
		ariaExpanded?: boolean | 'false' | 'true';
		ariaActivedescendant?: string;
		autofocus?: boolean;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		value = $bindable(),
		size = 'md',
		variant = 'default',
		showPasswordToggle = false,
		showPasswordLabel,
		hidePasswordLabel,
		width = 'full',
		type = 'text',
		id,
		name,
		placeholder,
		required = false,
		disabled = false,
		readonly = false,
		autocomplete,
		inputmode,
		min,
		max,
		step,
		minlength,
		maxlength,
		pattern,
		title,
		role,
		ariaLabel,
		ariaDescribedby,
		ariaInvalid,
		ariaAutocomplete,
		ariaControls,
		ariaExpanded,
		ariaActivedescendant,
		autofocus = false,
		oninput,
		onchange,
		onkeydown,
		onfocus,
		onblur
	}: Props = $props();

	let inputEl = $state<HTMLInputElement>();
	let isPasswordVisible = $state(false);

	let currentType = $derived(
		type === 'password' && showPasswordToggle && isPasswordVisible ? 'text' : type
	);
	let activeShowPasswordLabel = $derived(showPasswordLabel ?? i18n.t('input.showPassword'));
	let activeHidePasswordLabel = $derived(hidePasswordLabel ?? i18n.t('input.hidePassword'));

	// Expõe o método focus para ser usado via bind:this
	export function focus() {
		inputEl?.focus();
	}
</script>

<div
	class="monsan-input-container width-{width}"
	class:with-toggle={type === 'password' && showPasswordToggle}
>
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:this={inputEl}
		bind:value
		type={currentType}
		{id}
		{name}
		{placeholder}
		{required}
		{disabled}
		{readonly}
		{autocomplete}
		{inputmode}
		{min}
		{max}
		{step}
		{minlength}
		{maxlength}
		{pattern}
		{title}
		{role}
		{autofocus}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-invalid={ariaInvalid}
		aria-autocomplete={ariaAutocomplete}
		aria-controls={ariaControls}
		aria-expanded={ariaExpanded}
		aria-activedescendant={ariaActivedescendant}
		{oninput}
		{onchange}
		{onkeydown}
		{onfocus}
		{onblur}
		class="monsan-input {size === 'sm' ? 'size-sm' : ''} variant-{variant}"
	/>
	{#if type === 'password' && showPasswordToggle}
		<button
			type="button"
			class="password-toggle-btn"
			class:size-sm={size === 'sm'}
			onclick={() => (isPasswordVisible = !isPasswordVisible)}
			aria-label={isPasswordVisible ? activeHidePasswordLabel : activeShowPasswordLabel}
		>
			{#if !isPasswordVisible}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
					class="toggle-icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
					/>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2.5"
					stroke="currentColor"
					class="toggle-icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
				</svg>
			{/if}
		</button>
	{/if}
</div>

<style>
	.monsan-input-container {
		position: relative;
		width: 100%;
	}

	.monsan-input-container.width-auto {
		width: calc(var(--control-height) * 2);
	}

	.monsan-input {
		font-family: var(--font-body);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		color: var(--text-primary);
		height: var(--control-height);
		padding: 0 var(--space-sm);
		border-radius: var(--radius-md);
		font-size: var(--text-md);
		width: 100%;
		max-width: 100%;
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	.monsan-input.size-sm {
		height: calc(var(--control-height) * 0.8);
		padding: 0 var(--space-xs);
		font-size: var(--text-sm);
	}

	.monsan-input:focus:not(.variant-unstyled) {
		outline: none;
		border-color: var(--accent-primary);
		box-shadow: 3px 3px 0px var(--accent-primary);
		transform: translate(-1px, -1px);
	}

	.monsan-input[aria-invalid='true']:not(.variant-unstyled) {
		border-color: var(--error);
		box-shadow: 3px 3px 0px var(--error);
	}

	.monsan-input.variant-title {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
	}

	/* Unstyled Variant */
	.monsan-input.variant-unstyled {
		background-color: transparent;
		border: none;
		box-shadow: none;
		height: auto;
		padding: 0;
		border-radius: 0;
		width: auto;
		max-width: none;
		transition: none;
	}

	.monsan-input.variant-unstyled:focus {
		outline: none;
		transform: none;
		box-shadow: none;
	}

	/* Password Toggle Styles */
	.monsan-input-container.with-toggle .monsan-input {
		padding-right: 36px;
	}

	.monsan-input-container.with-toggle .monsan-input.size-sm {
		padding-right: 32px;
	}

	.password-toggle-btn {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		transition: color 0.2s ease;
		border-radius: var(--radius-sm);
	}

	.password-toggle-btn:hover {
		color: var(--text-primary);
	}

	.toggle-icon {
		width: 20px;
		height: 20px;
	}

	.password-toggle-btn.size-sm .toggle-icon {
		width: 16px;
		height: 16px;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-input,
		.password-toggle-btn {
			transition: none;
		}
	}
</style>
