<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';
	import Eye from './icons/Eye.svelte';
	import Pencil from './icons/Pencil.svelte';

	interface Props {
		children: Snippet;
		preview: Snippet;
		showPreview: boolean;
	}

	let { children, preview, showPreview = $bindable(false) }: Props = $props();
</script>

<div class="monsan-textarea-preview">
	{#if showPreview}
		<div class="preview-panel-content">
			{@render preview()}
		</div>
	{:else}
		{@render children()}
	{/if}

	<div class="floating-toggle-btn">
		<Button
			type="button"
			variant="secondary"
			size="sm"
			square
			onclick={() => (showPreview = !showPreview)}
			title={showPreview ? 'Editar' : 'Visualizar'}
		>
			{#if showPreview}
				<Pencil size={14} />
			{:else}
				<Eye size={14} />
			{/if}
		</Button>
	</div>
</div>

<style>
	.monsan-textarea-preview {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.preview-panel-content {
		width: 100%;
		box-sizing: border-box;
		min-height: 120px;
	}

	.floating-toggle-btn {
		position: absolute;
		right: var(--space-sm);
		bottom: var(--space-sm);
		z-index: 10;
	}
</style>
