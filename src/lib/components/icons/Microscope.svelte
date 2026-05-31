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
	<path d="M6 18h8" />
	<path d="M3 22h18" />
	<path d="M14 22a7 7 0 1 0-14 0" />
	<path d="M9 14h2" />
	<path d="M9 12a3 3 0 0 1-3-3V6h6v3a3 3 0 0 1-3 3ZM12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
	<path d="M12 14a4 4 0 0 1 4 4v2" />
</svg>
