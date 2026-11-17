<script lang="ts">
	import { tokenizeCode } from '$lib/utils/portugol/highlight.js';

	export interface PortugolCodeProps {
		code: string;
		language?: 'portugol' | 'javascript' | 'html' | 'css';
		size?: 'xs' | 'sm' | 'md' | 'lg';
		weight?: 'normal' | 'medium' | 'bold';
	}

	let { code, language = 'portugol', size = 'sm', weight = 'normal' }: PortugolCodeProps = $props();

	let tokens = $derived(tokenizeCode(code, language));
</script>

<code
	class="portugol-code notranslate size-{size} weight-{weight}"
	translate="no"
	spellcheck="false"
>
	{#each tokens as token, index (index)}
		{#if token.kind === 'plain'}
			{token.text}
		{:else}
			<span class="token-{token.kind}">{token.text}</span>
		{/if}
	{/each}
</code>

<style>
	.portugol-code {
		display: block;
		margin: 0;
		max-width: 100%;
		min-width: 0;
		box-sizing: border-box;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-family: var(--font-mono);
		line-height: 1.5;
		color: var(--text-primary);
	}

	.size-xs {
		font-size: var(--text-xs);
	}

	.size-sm {
		font-size: var(--text-sm);
	}

	.size-md {
		font-size: var(--text-md);
	}

	.size-lg {
		font-size: var(--text-lg);
	}

	.weight-normal {
		font-weight: 400;
	}

	.weight-medium {
		font-weight: 500;
	}

	.weight-bold {
		font-weight: 800;
	}

	.token-keyword {
		color: var(--accent-primary);
		font-weight: 800;
	}

	.token-string {
		color: var(--success);
	}

	.token-number {
		color: var(--warning);
	}

	.token-comment {
		color: var(--text-secondary);
		font-style: italic;
	}
</style>
