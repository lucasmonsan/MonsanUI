<script lang="ts">
	let { class: className = '', ...restProps } = $props<{
		class?: string;
		[key: string]: unknown;
	}>();
</script>

<hr class="monsan-separator {className}" {...restProps} />

<style>
	.monsan-separator {
		border: none;
		border-top: var(--border-width, 2px) solid var(--border-color, var(--text-primary));
		margin: var(--space-xs) 0;
		width: 100%;
		box-sizing: border-box;
		opacity: 0.85;
	}
</style>
