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
	<circle cx="9" cy="12" r="1" />
	<circle cx="9" cy="5" r="1" />
	<circle cx="9" cy="19" r="1" />
	<circle cx="15" cy="12" r="1" />
	<circle cx="15" cy="5" r="1" />
	<circle cx="15" cy="19" r="1" />
</svg>
