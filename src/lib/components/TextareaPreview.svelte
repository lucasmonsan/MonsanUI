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

	let editorHeight = $state(130);
	let currentHeight = $state(0);

	$effect(() => {
		if (!showPreview && currentHeight > 0) {
			editorHeight = currentHeight;
		}
	});
</script>

<div class="monsan-textarea-preview">
	<div class="editor-wrapper" class:hidden={showPreview} bind:clientHeight={currentHeight}>
		{@render children()}
	</div>

	<div class="preview-panel-content" class:hidden={!showPreview} style="height: {editorHeight}px;">
		{@render preview()}
	</div>

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

	.editor-wrapper {
		width: 100%;
	}

	.preview-panel-content {
		width: 100%;
		overflow-y: auto;
		background-color: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-md);
		padding: var(--space-sm);
		padding-right: 48px; /* space for the floating eye button */
		box-sizing: border-box;
		box-shadow: var(--shadow-sm);
		font-family: var(--font-body);
		font-size: var(--text-md);
		line-height: 1.5;
		color: var(--text-primary);
	}

	.hidden {
		display: none !important;
	}

	.floating-toggle-btn {
		position: absolute;
		right: var(--space-sm);
		bottom: var(--space-sm);
		z-index: 10;
	}
</style>
