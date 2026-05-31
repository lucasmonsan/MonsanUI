<script lang="ts">
	let {
		size = 24,
		color = 'currentColor',
		decorative = true,
		ariaLabel
	} = $props<{
		size?: number;
		color?: string;
		decorative?: boolean;
		ariaLabel?: string;
	}>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={color}
	aria-hidden={decorative}
	aria-label={decorative ? undefined : ariaLabel}
	focusable="false"
	role={decorative ? undefined : 'img'}
>
	<path
		d="M21.35 11.1h-9.17v2.73h6.51c-.3 1.56-1.25 2.87-2.74 3.78v3.14h4.42c2.58-2.38 4.08-5.88 4.08-9.98 0-.6-.05-1.18-.16-1.67z M12.18 21c3.24 0 5.95-1.08 7.93-2.91l-4.42-3.14c-1.23.82-2.81 1.31-4.52 1.31-3.47 0-6.42-2.35-7.47-5.5H1.08v3.25C3.06 18 7.23 21 12.18 21z M4.71 13.76c-.27-.82-.42-1.7-.42-2.61s.15-1.79.42-2.61V5.29H1.08C.2 7.04 0 9.02 0 11.15s.2 4.11 1.08 5.86l3.63-3.25z M12.18 5.24c1.76 0 3.35.61 4.6 1.8l3.44-3.44C18.13 1.7 15.42 1 12.18 1 7.23 1 3.06 4 1.08 6.74l3.63 3.25c1.05-3.15 4-5.5 7.47-5.5z"
	/>
</svg>
