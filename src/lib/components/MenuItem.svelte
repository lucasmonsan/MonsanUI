<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		actions?: Snippet;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		variant?: 'default' | 'error';
		align?: 'left' | 'center' | 'right';
		disabled?: boolean;
		selected?: boolean;
		checked?: boolean;
		current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
		'data-menu-persistent'?: boolean;
	}

	let {
		children,
		actions,
		href,
		onclick,
		variant = 'default',
		align = 'center',
		disabled = false,
		selected = false,
		checked,
		current,
		'data-menu-persistent': dataMenuPersistent
	}: Props = $props();

	let itemRole = $derived(checked === undefined ? 'menuitem' : 'menuitemradio');
	let isSelected = $derived(selected || checked === true);
</script>

{#if actions}
	<div class="monsan-menu-item-frame {variant}" class:selected={isSelected}>
		{#if href && !disabled}
			<a
				class="monsan-menu-item frame-main {variant} align-{align}"
				role={itemRole}
				aria-checked={checked}
				aria-current={current}
				data-menu-item="true"
				data-menu-persistent={dataMenuPersistent ? '' : undefined}
				{href}
				{onclick}
			>
				{@render children()}
			</a>
		{:else}
			<button
				type="button"
				class="monsan-menu-item frame-main {variant} align-{align}"
				role={itemRole}
				aria-checked={checked}
				aria-current={current}
				data-menu-item="true"
				data-menu-persistent={dataMenuPersistent ? '' : undefined}
				{disabled}
				{onclick}
			>
				{@render children()}
			</button>
		{/if}

		<div class="monsan-menu-item-actions" data-menu-persistent>
			{@render actions()}
		</div>
	</div>
{:else if href && !disabled}
	<a
		class="monsan-menu-item {variant} align-{align}"
		class:selected={isSelected}
		role={itemRole}
		aria-checked={checked}
		aria-current={current}
		data-menu-item="true"
		data-menu-persistent={dataMenuPersistent ? '' : undefined}
		{href}
		{onclick}
	>
		{@render children()}
	</a>
{:else}
	<button
		type="button"
		class="monsan-menu-item {variant} align-{align}"
		class:selected={isSelected}
		role={itemRole}
		aria-checked={checked}
		aria-current={current}
		data-menu-item="true"
		data-menu-persistent={dataMenuPersistent ? '' : undefined}
		{disabled}
		{onclick}
	>
		{@render children()}
	</button>
{/if}

<style>
	.monsan-menu-item-frame,
	.monsan-menu-item {
		width: 100%;
		box-sizing: border-box;
		appearance: none;
		padding: var(--space-sm) var(--space-md);
		min-height: calc(var(--control-height) * 0.85);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		box-shadow: none;
		background: transparent;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font: inherit;
		font-family: var(--font-body);
		font-weight: 800;
		font-size: var(--text-sm);
		line-height: 1;
		margin: 0;
		text-decoration: none;
		white-space: nowrap;
		transition:
			transform 0.1s var(--ease-out),
			box-shadow 0.1s var(--ease-out),
			background-color 0.12s var(--ease-out),
			border-color 0.12s var(--ease-out);
	}

	.monsan-menu-item {
		cursor: pointer;
	}

	.monsan-menu-item-frame {
		position: relative;
		padding: 0;
		overflow: visible;
	}

	.frame-main {
		border: 0;
		border-radius: var(--radius-sm);
		padding-right: calc(var(--control-height) + var(--space-md));
		background: transparent;
		color: inherit;
	}

	.frame-main:hover:not(:disabled) {
		background: transparent;
	}

	.monsan-menu-item-actions {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-end: var(--space-sm);
		z-index: 2;
		display: flex;
		align-items: center;
		transform: translateY(-50%);
	}

	.monsan-menu-item-actions :global(.quick-actions-trigger > button) {
		background: none;
		border: none;
		box-shadow: none;
		cursor: pointer;
		padding: var(--space-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-secondary);
		transition: color 0.2s ease;
	}

	.monsan-menu-item-actions :global(.quick-actions-trigger > button:hover) {
		color: var(--text-primary);
	}

	.monsan-menu-item-frame.selected
		.monsan-menu-item-actions
		:global(.quick-actions-trigger > button) {
		color: currentColor;
	}

	.monsan-menu-item-actions :global(.monsan-button.size-sm.square) {
		width: calc(var(--control-height) * 0.72);
		height: calc(var(--control-height) * 0.72);
		min-height: calc(var(--control-height) * 0.72);
		padding: 0;
		box-shadow: none;
	}

	.monsan-menu-item-actions :global(.monsan-button.size-sm.square:hover:not(:disabled)) {
		box-shadow: 2px 2px 0 var(--text-primary);
	}

	.align-left {
		justify-content: flex-start;
		text-align: left;
	}

	.align-center {
		justify-content: center;
		text-align: center;
	}

	.align-right {
		justify-content: flex-end;
		text-align: right;
	}

	.monsan-menu-item:hover:not(:disabled),
	.monsan-menu-item-frame:hover {
		background: var(--bg-secondary);
		border-color: var(--border-color);
	}

	.error {
		color: var(--error);
	}

	.selected,
	.monsan-menu-item-frame.selected {
		background: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .selected,
	:global([data-theme='dark']) .monsan-menu-item-frame.selected {
		color: var(--text-primary);
	}

	.error:hover:not(:disabled) {
		background: color-mix(in srgb, var(--error) 12%, var(--bg-primary));
		border-color: var(--error);
	}

	.selected:hover:not(:disabled),
	.monsan-menu-item-frame.selected:hover {
		background: var(--accent-primary);
		border-color: var(--border-color);
		color: var(--bg-primary);
	}

	:global([data-theme='dark']) .selected:hover:not(:disabled),
	:global([data-theme='dark']) .monsan-menu-item-frame.selected:hover {
		color: var(--text-primary);
	}

	.monsan-menu-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}

	.monsan-menu-item:active:not(:disabled) {
		transform: none;
		box-shadow: none;
	}

	.monsan-menu-item:focus-visible {
		outline: 3px solid var(--accent-primary);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.monsan-menu-item {
			transition: none;
		}
	}
</style>
