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
	<path d="M10 5H3" />
	<path d="M12 19H3" />
	<path d="M14 3v4" />
	<path d="M16 17v4" />
	<path d="M21 12h-9" />
	<path d="M21 19h-5" />
	<path d="M21 5h-7" />
	<path d="M8 10v4" />
	<path d="M8 12H3" />
</svg>
