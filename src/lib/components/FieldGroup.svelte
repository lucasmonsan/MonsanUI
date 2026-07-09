<script lang="ts">
	import type { Snippet } from 'svelte';
	import Text from './Text.svelte';

	interface Props {
		label: string;
		info?: string;
		children: Snippet;
	}

	let { label, info, children }: Props = $props();
</script>

<fieldset class="monsan-field-group">
	<legend>
		<Text tag="span" size="sm" weight="bold" variant="secondary">
			{label}
			{#if info}
				<span class="info-trigger" role="img" aria-label={info}>
					?
					<span class="info-tooltip">{info}</span>
				</span>
			{/if}
		</Text>
	</legend>
	{@render children()}
</fieldset>

<style>
	.monsan-field-group {
		border: 0;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		min-width: 0;
	}

	legend {
		padding: 0;
		text-transform: uppercase;
		letter-spacing: 0;
	}

	.info-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		border: var(--border-width) solid var(--border-color);
		box-shadow: 1px 1px 0 var(--text-primary);
		background: var(--bg-secondary);
		border-radius: var(--radius-sm);
		font-size: 10px;
		font-family: var(--font-body);
		font-weight: bold;
		color: var(--text-secondary);
		cursor: help;
		position: relative;
		margin-left: var(--space-xs);
		vertical-align: middle;
		user-select: none;
	}

	.info-trigger:hover {
		color: var(--text-primary);
		border-color: var(--text-primary);
		box-shadow: 1.5px 1.5px 0 var(--text-primary);
		transform: translate(-0.5px, -0.5px);
	}

	.info-tooltip {
		visibility: hidden;
		position: absolute;
		bottom: 150%;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--text-primary);
		color: var(--bg-primary);
		text-align: center;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-family: var(--font-body);
		font-weight: 500;
		text-transform: none;
		letter-spacing: normal;
		white-space: normal;
		width: max-content;
		max-width: 220px;
		z-index: 100;
		box-shadow: var(--shadow-md);
		opacity: 0;
		transition: opacity 0.2s var(--ease-out);
		pointer-events: none;
		border: 1px solid var(--border-color);
	}

	.info-trigger:hover .info-tooltip {
		visibility: visible;
		opacity: 1;
	}
</style>
