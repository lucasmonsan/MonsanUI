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
	let highlightOverlayElement = $state<HTMLPreElement | null>(null);
	let activeCursorLine = $state(1);

	function handleScroll() {
		if (textareaElement) {
			if (lineNumbersElement) {
				lineNumbersElement.scrollTop = textareaElement.scrollTop;
			}
			if (highlightOverlayElement) {
				highlightOverlayElement.scrollTop = textareaElement.scrollTop;
				highlightOverlayElement.scrollLeft = textareaElement.scrollLeft;
			}
		}
	}

	function updateCursorLine() {
		if (textareaElement) {
			const selectionStart = textareaElement.selectionStart;
			const textBeforeCursor = code.substring(0, selectionStart);
			activeCursorLine = textBeforeCursor.split('\n').length;
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
					updateCursorLine();
				}
			}, 0);
		}
	}

	function highlight(src: string): string {
		// Escape HTML
		let html = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

		// Keywords list
		const keywords = [
			'programa',
			'funcao',
			'função',
			'inteiro',
			'real',
			'caracter',
			'caractere',
			'logico',
			'lógico',
			'cadeia',
			'se',
			'senao',
			'senão',
			'enquanto',
			'para',
			'retorne',
			'verdadeiro',
			'falso',
			'e',
			'ou',
			'nao',
			'não',
			'algoritmo',
			'var',
			'inicio',
			'fimalgoritmo',
			'fimse',
			'fimenquanto',
			'fimpara',
			'entao',
			'então',
			'faca',
			'faça',
			'de',
			'ate',
			'até',
			'passo',
			'escreva',
			'escreval',
			'leia',
			'limpa'
		];

		// Strings (double quotes)
		html = html.replace(/("[^"\\]*(?:\\.[^"\\]*)*")/g, '<span class="hl-string">$1</span>');

		// Chars (single quotes)
		html = html.replace(/('[^'\\]*(?:\\.[^'\\]*)*')/g, '<span class="hl-char">$1</span>');

		// Comments (single line)
		html = html.replace(/(\/\/.*)/g, '<span class="hl-comment">$1</span>');

		// Numbers
		html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hl-number">$1</span>');

		// Keywords - match only outside HTML tags
		const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
		html = html
			.split(/(<[^>]*>)/)
			.map((part) => {
				if (part.startsWith('<')) return part;
				return part.replace(keywordRegex, '<span class="hl-keyword">$1</span>');
			})
			.join('');

		return html;
	}

	let highlightedCode = $derived(highlight(code));
</script>

<div class="portugol-editor-container" class:disabled>
	<div class="line-numbers" bind:this={lineNumbersElement} aria-hidden="true">
		{#each lines as line, index (index)}
			{@const lineNum = index + 1}
			{@const isActive = activeLine === lineNum}
			{@const isError = errorLine === lineNum}
			{@const isCursor = activeCursorLine === lineNum}
			<div
				class="line-number-row"
				class:active={isActive}
				class:error={isError}
				class:cursor={isCursor}
			>
				{#if isActive}
					<span class="active-indicator">▶</span>
				{:else if isError}
					<span class="error-indicator">❌</span>
				{/if}
				<span class="num" title={line}>{lineNum}</span>
			</div>
		{/each}
	</div>
	<div class="editor-wrapper">
		<!-- eslint-disable svelte/no-at-html-tags -->
		<pre
			class="highlight-overlay"
			bind:this={highlightOverlayElement}
			aria-hidden="true">{@html highlightedCode}</pre>
		<!-- eslint-enable svelte/no-at-html-tags -->
		<textarea
			bind:value={code}
			bind:this={textareaElement}
			onscroll={handleScroll}
			onkeydown={handleKeyDown}
			oninput={updateCursorLine}
			onkeyup={updateCursorLine}
			onclick={updateCursorLine}
			onfocus={updateCursorLine}
			{disabled}
			{placeholder}
			spellcheck="false"
			autocomplete="off"
			autocapitalize="off"
		></textarea>
	</div>
</div>

<style>
	.portugol-editor-container {
		display: flex;
		flex-direction: row;
		font-family: var(--font-mono);
		font-size: 14px;
		line-height: 20px;
		background: var(--bg-primary);
		color: var(--text-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-lg);
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
		background: var(--bg-secondary);
		border-right: var(--border-width) solid var(--border-color);
		user-select: none;
		overflow: hidden;
		text-align: right;
	}

	.line-number-row {
		height: 20px;
		padding-right: 8px;
		color: var(--text-secondary);
		position: relative;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.line-number-row.active {
		color: var(--warning);
		font-weight: bold;
		background: rgba(224, 123, 57, 0.12);
	}

	.line-number-row.error {
		color: var(--error);
		font-weight: bold;
		background: rgba(155, 34, 38, 0.12);
	}

	.line-number-row.cursor:not(.active):not(.error) {
		background: rgba(45, 36, 34, 0.05);
		color: var(--text-primary);
	}

	:root[data-theme='dark'] .line-number-row.cursor:not(.active):not(.error) {
		background: rgba(253, 251, 247, 0.06);
	}

	.active-indicator {
		position: absolute;
		left: 4px;
		font-size: 10px;
		color: var(--warning);
	}

	.error-indicator {
		position: absolute;
		left: 4px;
		font-size: 10px;
		color: var(--error);
	}

	.num {
		font-variant-numeric: tabular-nums;
	}

	.editor-wrapper {
		flex: 1;
		position: relative;
		height: 100%;
		overflow: hidden;
	}

	.highlight-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		padding: 12px;
		margin: 0;
		background: transparent;
		color: var(--text-primary);
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		white-space: pre;
		overflow: auto;
		pointer-events: none;
		box-sizing: border-box;
		border: none;
		scrollbar-width: none;
	}

	.highlight-overlay::-webkit-scrollbar {
		display: none;
	}

	textarea {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		padding: 12px;
		margin: 0;
		background: transparent;
		color: transparent;
		caret-color: var(--text-primary);
		border: none;
		outline: none;
		resize: none;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		white-space: pre;
		overflow: auto;
		tab-size: 4;
		box-sizing: border-box;
	}

	textarea:disabled {
		cursor: not-allowed;
	}

	/* Code Highlighting Token Classes */
	:global(.hl-keyword) {
		color: var(--accent-primary);
		font-weight: bold;
	}

	:global(.hl-string) {
		color: var(--success);
	}

	:global(.hl-char) {
		color: var(--success);
	}

	:global(.hl-number) {
		color: var(--warning);
	}

	:global(.hl-comment) {
		color: var(--text-secondary);
		font-style: italic;
	}
</style>
