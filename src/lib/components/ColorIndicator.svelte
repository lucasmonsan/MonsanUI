<script lang="ts">
	interface Props {
		color: string;
		label?: string;
		size?: 'sm' | 'md';
	}

	let { color, label, size = 'sm' }: Props = $props();
</script>

<span
	class="monsan-color-indicator size-{size}"
	style:background-color={color}
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : true}
></span>

<style>
	.monsan-color-indicator {
		display: inline-block;
		flex: 0 0 auto;
		border: var(--border-width) solid var(--border-color);
		border-radius: 999px;
		background: var(--accent-primary);
	}
	.size-sm {
		width: 0.625rem;
		height: 0.625rem;
	}
	.size-md {
		width: 0.875rem;
		height: 0.875rem;
	}
</style>
