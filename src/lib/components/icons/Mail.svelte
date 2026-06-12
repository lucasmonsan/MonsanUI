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
	<rect width="20" height="16" x="2" y="4" rx="2" />
	<path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7" />
</svg>
