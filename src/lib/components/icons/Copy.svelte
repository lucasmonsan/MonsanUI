<script lang="ts">
	let {
		size = 24,
		color = 'currentColor',
		strokeWidth = 2.5,
		decorative = true,
		ariaLabel
	} = $props<{
		size?: number;
		color?: string;
		strokeWidth?: number;
		decorative?: boolean;
		ariaLabel?: string;
	}>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden={decorative}
	aria-label={decorative ? undefined : ariaLabel}
	focusable="false"
	role={decorative ? undefined : 'img'}
>
	<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
	<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
</svg>
