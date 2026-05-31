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
	<path d="M10 11v6" />
	<path d="M14 11v6" />
	<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
	<path d="M3 6h18" />
	<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
</svg>
