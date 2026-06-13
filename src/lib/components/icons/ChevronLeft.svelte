<script lang="ts">
	import PhosphorIcon from 'phosphor-svelte/lib/CaretLeftIcon';

	let {
		size = 24,
		color = 'currentColor',
		strokeWidth = 2.5,
		decorative = true,
		ariaLabel
	} = $props<{
		size?: number | string;
		color?: string;
		strokeWidth?: number;
		decorative?: boolean;
		ariaLabel?: string;
	}>();
</script>

<PhosphorIcon
	{size}
	{color}
	weight={strokeWidth <= 1.5 ? 'regular' : 'fill'}
	aria-hidden={decorative}
	aria-label={decorative ? undefined : ariaLabel}
	focusable="false"
	role={decorative ? undefined : 'img'}
/>
