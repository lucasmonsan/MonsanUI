<script lang="ts">
	let {
		size = 24,
		color = 'currentColor',
		strokeWidth = 2.5,
		...restProps
	} = $props<{
		size?: number;
		color?: string;
		strokeWidth?: number;
		[key: string]: unknown;
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
	{...restProps}
>
	<path d="M20 6 9 17l-5-5" />
</svg>
