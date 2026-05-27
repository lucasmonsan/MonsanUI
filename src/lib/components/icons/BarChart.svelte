<script lang="ts">
	let {
		size = 24,
		color = 'currentColor',
		strokeWidth = 2.5,
		class: className = '',
		...restProps
	} = $props<{
		size?: number;
		color?: string;
		strokeWidth?: number;
		class?: string;
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
	class={className}
	{...restProps}
>
	<path d="M18 20V10" />
	<path d="M12 20V4" />
	<path d="M6 20V14" />
	<path d="M3 20h18" />
</svg>
