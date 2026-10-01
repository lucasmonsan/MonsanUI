<script lang="ts">
	interface Props {
		value?: string;
		use?: (
			node: HTMLTextAreaElement,
			value?: string
		) => void | {
			update?: (value?: string) => void;
			destroy?: () => void;
		};
		size?: 'sm' | 'md';
		rows?: number;
		id?: string;
		name?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		minlength?: number;
		maxlength?: number;
		title?: string;
		ariaLabel?: string;
		ariaDescribedby?: string;
		ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		value = $bindable(''),
		use,
		size = 'md',
		rows = 2,
		id,
		name,
		placeholder,
		required = false,
		disabled = false,
		readonly = false,
		minlength,
		maxlength,
		title,
		ariaLabel,
		ariaDescribedby,
		ariaInvalid,
		oninput,
		onchange,
		onkeydown,
		onfocus,
		onblur
	}: Props = $props();
</script>

{#if use}
	<textarea
		bind:value
		class="monsan-textarea {size === 'sm' ? 'size-sm' : ''}"
		use:use={value}
		{rows}
		{id}
		{name}
		{placeholder}
		{required}
		{disabled}
		{readonly}
		{minlength}
		{maxlength}
		{title}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-invalid={ariaInvalid}
		{oninput}
		{onchange}
		{onkeydown}
		{onfocus}
		{onblur}
		style:--rows={rows}></textarea>
{:else}
	<textarea
		bind:value
		class="monsan-textarea {size === 'sm' ? 'size-sm' : ''}"
		{rows}
		{id}
		{name}
		{placeholder}
		{required}
		{disabled}
		{readonly}
		{minlength}
		{maxlength}
		{title}
		aria-label={ariaLabel}
		aria-describedby={ariaDescribedby}
		aria-invalid={ariaInvalid}
		{oninput}
		{onchange}
		{onkeydown}
		{onfocus}
		{onblur}
		style:--rows={rows}></textarea>
{/if}

<style>
	.monsan-textarea {
		font-family: var(--font-body);
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		color: var(--text-primary);
		padding: var(--space-md) var(--space-md);
		border-radius: var(--radius-md);
		font-size: var(--text-md);
		width: 100%;
		max-width: 100%;
		box-shadow: var(--shadow-sm);
		transition: border-color 0.2s var(--ease-out);
		resize: vertical;
		box-sizing: border-box;
		min-height: calc(var(--rows, 2) * 1.5em + var(--space-md) * 2 + (var(--border-width) * 2));
	}

	.monsan-textarea.size-sm {
		padding: var(--space-sm) var(--space-sm);
		font-size: var(--text-sm);
		min-height: calc(var(--rows, 2) * 1.4em + var(--space-sm) * 2 + (var(--border-width) * 2));
	}

	.monsan-textarea:focus {
		outline: none;
		border-color: var(--accent-primary);
	}

	.monsan-textarea[aria-invalid='true'] {
		border-color: var(--error);
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-textarea {
			transition: none;
		}
	}
</style>
