<script lang="ts">
	interface Props {
		content: string;
	}

	let { content }: Props = $props();
</script>

<div class="markdown-content">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html content}
</div>
