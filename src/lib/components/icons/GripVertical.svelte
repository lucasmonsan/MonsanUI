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
	<circle cx="9" cy="12" r="1" />
	<circle cx="9" cy="5" r="1" />
	<circle cx="9" cy="19" r="1" />
	<circle cx="15" cy="12" r="1" />
	<circle cx="15" cy="5" r="1" />
	<circle cx="15" cy="19" r="1" />
</svg>
