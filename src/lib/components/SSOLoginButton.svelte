<script lang="ts">
	import Button from './Button.svelte';

	interface Props {
		label: string;
		loadingLabel?: string;
		logoSrc?: string;
		loading?: boolean;
		disabled?: boolean;
		block?: boolean;
		ariaLabel?: string;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		label,
		loadingLabel,
		logoSrc,
		loading = false,
		disabled = false,
		block = false,
		ariaLabel,
		onclick
	}: Props = $props();

	let resolvedLabel = $derived(loading && loadingLabel ? loadingLabel : label);
</script>

<Button
	variant="primary"
	{block}
	disabled={disabled || loading}
	ariaBusy={loading}
	ariaLabel={ariaLabel ?? resolvedLabel}
	{onclick}
>
	{#if logoSrc}
		<img src={logoSrc} alt="" width="18" height="18" loading="lazy" />
	{/if}
	{resolvedLabel}
</Button>
