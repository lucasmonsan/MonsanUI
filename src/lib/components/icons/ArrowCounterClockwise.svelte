<script lang="ts">
	let { size = 18 } = $props<{ size?: number }>();
</script>

<svg
	width={size}
	height={size}
	fill="currentColor"
	viewBox="0 0 256 256"
	aria-hidden="true"
	focusable="false"
>
	<rect width="256" height="256" fill="none"></rect>
	<path
		d="M224,128a96,96,0,1,1-28.12-67.88L216,80V40a12,12,0,0,1,24,0v68a12,12,0,0,1-12,12H160a12,12,0,0,1,0-24h39.05l-20.14-20.14A72,72,0,1,0,200,128a12,12,0,0,1,24,0Z"
	></path>
</svg>
