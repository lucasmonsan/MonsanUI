<script lang="ts">
	interface Props {
		orientation?: 'horizontal' | 'vertical';
	}
	let { orientation = 'horizontal' }: Props = $props();
</script>

<hr class="monsan-separator {orientation}" />

<style>
	.monsan-separator {
		border: none;
		box-sizing: border-box;
		opacity: 0.85;
	}
	.monsan-separator.horizontal {
		border-top: var(--border-width, 2px) solid var(--border-color, var(--text-primary));
		margin: var(--space-xs) 0;
		width: 100%;
	}
	.monsan-separator.vertical {
		border-left: var(--border-width, 2px) solid var(--border-color, var(--text-primary));
		margin: 0;
		height: 20px;
		width: 0px;
		display: inline-block;
		vertical-align: middle;
		flex-shrink: 0;
	}
</style>
