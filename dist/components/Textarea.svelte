<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
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
	}

	let {
		value = $bindable(''),
		use,
		size = 'md',
		class: className = '',
		rows = 2,
		...rest
	}: Props = $props();
</script>

{#if use}
	<textarea
		bind:value
		class="monsan-textarea {size === 'sm' ? 'size-sm' : ''} {className}"
		use:use={value}
		{rows}
		style="--rows: {rows};"
		{...rest}
	></textarea>
{:else}
	<textarea
		bind:value
		class="monsan-textarea {size === 'sm' ? 'size-sm' : ''} {className}"
		{rows}
		style="--rows: {rows};"
		{...rest}
	></textarea>
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
		transition:
			transform 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
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
		box-shadow: 3px 3px 0px var(--accent-primary);
		transform: translate(-1px, -1px);
	}
</style>
