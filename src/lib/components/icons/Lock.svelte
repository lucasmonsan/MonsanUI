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
	<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
	<path d="M7 11V7a5 5 0 0 1 10 0v4" />
</svg>
