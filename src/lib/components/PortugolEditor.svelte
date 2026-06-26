<script lang="ts">
	let {
		code = $bindable(''),
		activeLine = 0,
		errorLine = 0,
		disabled = false,
		placeholder = 'Escreva seu código Portugol aqui...'
	} = $props<{
		code: string;
		activeLine?: number;
		errorLine?: number;
		disabled?: boolean;
		placeholder?: string;
	}>();

	let lines = $derived(code.split('\n'));
	let textareaElement = $state<HTMLTextAreaElement | null>(null);
	let lineNumbersElement = $state<HTMLDivElement | null>(null);

	function handleScroll() {
		if (textareaElement && lineNumbersElement) {
			lineNumbersElement.scrollTop = textareaElement.scrollTop;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Tab' && textareaElement) {
			e.preventDefault();
			const start = textareaElement.selectionStart;
			const end = textareaElement.selectionEnd;
			code = code.substring(0, start) + '\t' + code.substring(end);
			// Reposiciona o cursor de forma assíncrona após a atualização do Svelte
			setTimeout(() => {
				if (textareaElement) {
					textareaElement.selectionStart = textareaElement.selectionEnd = start + 1;
				}
			}, 0);
		}
	}
</script>

<div class="portugol-editor-container" class:disabled>
	<div class="line-numbers" bind:this={lineNumbersElement} aria-hidden="true">
		{#each lines as line, index (index)}
			{@const lineNum = index + 1}
			{@const isActive = activeLine === lineNum}
			{@const isError = errorLine === lineNum}
			<div class="line-number-row" class:active={isActive} class:error={isError}>
				{#if isActive}
					<span class="active-indicator">▶</span>
				{:else if isError}
					<span class="error-indicator">❌</span>
				{/if}
				<span class="num" title={line}>{lineNum}</span>
			</div>
		{/each}
	</div>
	<textarea
		bind:value={code}
		bind:this={textareaElement}
		onscroll={handleScroll}
		onkeydown={handleKeyDown}
		{disabled}
		{placeholder}
		spellcheck="false"
		autocomplete="off"
		autocapitalize="off"
	></textarea>
</div>

<style>
	.portugol-editor-container {
		display: flex;
		flex-direction: row;
		font-family: 'Fira Code', 'Courier New', Courier, monospace;
		font-size: 14px;
		line-height: 20px;
		background: var(--color-bg-dark, #1e1e2e);
		color: var(--color-text-light, #cdd6f4);
		border: 1px solid var(--color-border-dark, #313244);
		border-radius: 8px;
		overflow: hidden;
		height: 400px;
		position: relative;
	}

	.portugol-editor-container.disabled {
		opacity: 0.8;
	}

	.line-numbers {
		display: flex;
		flex-direction: column;
		width: 48px;
		padding: 12px 0;
		background: var(--color-bg-sidebar, #11111b);
		border-right: 1px solid var(--color-border-dark, #313244);
		user-select: none;
		overflow: hidden;
		text-align: right;
	}

	.line-number-row {
		height: 20px;
		padding-right: 8px;
		color: var(--color-text-muted, #585b70);
		position: relative;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.line-number-row.active {
		color: var(--color-warning, #f9e2af);
		font-weight: bold;
		background: rgba(249, 226, 175, 0.15);
	}

	.line-number-row.error {
		color: var(--color-error, #f38ba8);
		font-weight: bold;
		background: rgba(243, 139, 168, 0.15);
	}

	.active-indicator {
		position: absolute;
		left: 4px;
		font-size: 10px;
		color: var(--color-warning, #f9e2af);
	}

	.error-indicator {
		position: absolute;
		left: 4px;
		font-size: 10px;
		color: var(--color-error, #f38ba8);
	}

	.num {
		font-variant-numeric: tabular-nums;
	}

	textarea {
		flex: 1;
		padding: 12px;
		background: transparent;
		color: inherit;
		border: none;
		outline: none;
		resize: none;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		white-space: pre;
		overflow: auto;
		tab-size: 4;
	}

	textarea:disabled {
		cursor: not-allowed;
	}
</style>
