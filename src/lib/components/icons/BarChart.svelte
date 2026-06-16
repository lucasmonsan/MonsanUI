<script lang="ts">
	import PhosphorIcon from 'phosphor-svelte/lib/ChartBarIcon';

	let {
		size = 24,
		color = 'currentColor',
		strokeWidth = 3,
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
	weight={strokeWidth >= 3 ? 'bold' : strokeWidth <= 1.5 ? 'light' : 'regular'}
	aria-hidden={decorative}
	aria-label={decorative ? undefined : ariaLabel}
	focusable="false"
	role={decorative ? undefined : 'img'}
/>
