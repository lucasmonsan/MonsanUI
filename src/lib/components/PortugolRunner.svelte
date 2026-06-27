<script lang="ts">
	import PortugolEditor from './PortugolEditor.svelte';
	import Button from './Button.svelte';
	import Panel from './Panel.svelte';
	import Stack from './Stack.svelte';
	import Inline from './Inline.svelte';
	import Alert from './Alert.svelte';
	import Text from './Text.svelte';
	import RotateCwIcon from './icons/RotateCw.svelte';
	import TriangleAlertIcon from './icons/TriangleAlert.svelte';
	import {
		Lexer,
		Parser,
		Interpreter,
		SemanticValidator,
		checkIndentation
	} from '../utils/portugol/interpreter.js';

	interface Props {
		code?: string;
		disabled?: boolean;
		onOutputsChange?: (outputs: string[]) => void;
		onSuccess?: () => void;
		onFailure?: (error: string) => void;
		onsave?: () => void;
	}

	let {
		code = $bindable(`programa
{
	funcao inicio()
	{
		inteiro x = 5
		inteiro y = 10
		inteiro soma = x + y
		escreva("A soma de x e y é: ", soma)
	}
}`),
		disabled = false,
		onOutputsChange,
		onSuccess,
		onFailure,
		onsave
	}: Props = $props();

	let activeLine = $state(0);
	let errorLine = $state(0);
	let strictIndent = $state(false);
	let isRunning = $state(false);
	let isPaused = $state(false);
	let isStepMode = $state(false);
	let variables = $state<Record<string, { value: unknown; type: string }>>({});
	let outputs = $state<string[]>([]);
	let errorMsg = $state('');

	// Input prompt state
	let pendingInputVar = $state<string | null>(null);
	let currentInputValue = $state('');

	// Collapsible state
	let isConsoleCollapsed = $state(false);
	let isVariablesCollapsed = $state(false);

	// Resizable state
	let editorWidthPercent = $state(60);
	let isDragging = $state(false);

	// Horizontal split state
	let consoleHeightPercent = $state(50);
	let isHorizontalDragging = $state(false);

	function startHorizontalResize(e: MouseEvent) {
		e.preventDefault();
		isHorizontalDragging = true;
		const sidebarElement = (e.currentTarget as HTMLElement).parentElement;
		if (!sidebarElement) return;

		const startY = e.clientY;
		const rect = sidebarElement.getBoundingClientRect();
		const totalHeight = rect.height;
		const initialPercent = consoleHeightPercent;

		function onMouseMove(moveEvent: MouseEvent) {
			const deltaY = moveEvent.clientY - startY;
			const deltaPercent = (deltaY / totalHeight) * 100;
			consoleHeightPercent = Math.min(Math.max(initialPercent + deltaPercent, 20), 80);
		}

		function onMouseUp() {
			isHorizontalDragging = false;
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		}

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	function startResize(e: MouseEvent) {
		e.preventDefault();
		isDragging = true;
		const gridElement = (e.currentTarget as HTMLElement).parentElement;
		if (!gridElement) return;

		const startX = e.clientX;
		const rect = gridElement.getBoundingClientRect();
		const totalWidth = rect.width;
		const initialPercent = editorWidthPercent;

		function onMouseMove(moveEvent: MouseEvent) {
			const deltaX = moveEvent.clientX - startX;
			const deltaPercent = (deltaX / totalWidth) * 100;
			editorWidthPercent = Math.min(Math.max(initialPercent + deltaPercent, 20), 80);
		}

		function onMouseUp() {
			isDragging = false;
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		}

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	let interpreter: Interpreter | null = null;
	let generator: Generator<unknown, unknown, unknown> | null = null;

	function startExecution(step = false) {
		errorMsg = '';
		errorLine = 0;
		outputs = [];
		variables = {};
		activeLine = 0;
		pendingInputVar = null;
		isStepMode = step;

		if (strictIndent) {
			const indentResult = checkIndentation(code);
			if (!indentResult.ok) {
				errorMsg = indentResult.errorMsg || 'Erro de Indentação.';
				errorLine = indentResult.line || 0;
				onFailure?.(errorMsg);
				return;
			}
		}

		try {
			const lexer = new Lexer(code);
			const tokens = lexer.tokenize();
			const parser = new Parser(tokens);
			const ast = parser.parse();

			// Validador Semântico
			const validator = new SemanticValidator();
			validator.validate(ast);

			interpreter = new Interpreter(true); // true = debug/step mode enabled
			generator = interpreter.run(ast);
			isRunning = true;
			isPaused = false;

			runNext();
		} catch (e: unknown) {
			const err = e as Error;
			errorMsg = err.message || String(e);
			const lineMatch = errorMsg.match(/(?:linha|line)\s+(\d+)/i);
			errorLine = lineMatch ? parseInt(lineMatch[1], 10) : 0;
			isRunning = false;
			isStepMode = false;
			isPaused = false;
			onFailure?.(errorMsg);
		}
	}

	function runNext(inputValue?: string) {
		if (!generator) return;

		try {
			let result = generator.next(inputValue);

			while (!result.done) {
				const val = result.value as {
					type: string;
					value?: string;
					variable?: string;
					line?: number;
					variables?: Record<string, { value: unknown; type: string }>;
				} | null;
				if (val && val.type === 'step') {
					activeLine = val.line || 0;
					variables = val.variables || {};

					if (isStepMode) {
						// Pausa aqui no modo passo a passo
						isPaused = true;
						return;
					}
				} else if (val && val.type === 'write') {
					outputs = [...outputs, val.value || ''];
					onOutputsChange?.(outputs);
				} else if (val && val.type === 'read') {
					pendingInputVar = val.variable || '';
					isPaused = true;
					// Para o loop e espera a resposta
					return;
				} else if (val && val.type === 'clear') {
					outputs = [];
					onOutputsChange?.(outputs);
				}

				result = generator.next();
			}

			// Fim da execução limpa estados
			isRunning = false;
			isStepMode = false;
			isPaused = false;
			activeLine = 0;
			onSuccess?.();
		} catch (e: unknown) {
			const err = e as Error;
			errorMsg = err.message || String(e);
			const lineMatch = errorMsg.match(/(?:linha|line)\s+(\d+)/i);
			errorLine = lineMatch ? parseInt(lineMatch[1], 10) : 0;
			isRunning = false;
			isStepMode = false;
			isPaused = false;
			onFailure?.(errorMsg);
		}
	}

	function handleStep() {
		if (!isRunning) {
			startExecution(true);
		} else {
			runNext();
		}
	}

	function submitInput(e?: Event) {
		if (e) e.preventDefault();
		if (!pendingInputVar) return;

		const value = currentInputValue;
		currentInputValue = '';
		pendingInputVar = null;
		isPaused = false;

		runNext(value);
	}

	function handleReset() {
		activeLine = 0;
		errorLine = 0;
		isRunning = false;
		isPaused = false;
		isStepMode = false;
		variables = {};
		outputs = [];
		errorMsg = '';
		pendingInputVar = null;
		currentInputValue = '';
		interpreter = null;
		generator = null;
	}
</script>

<div class="portugol-runner">
	<Stack gap="md">
		<!-- Toolbar de controle -->
		<div class="toolbar">
			<Inline justify="between" align="center" fullWidth={true}>
				<!-- Controles de Execução (Esquerda) -->
				<Inline gap="xs">
					<Button
						variant="primary"
						size="sm"
						onclick={() => startExecution(false)}
						disabled={disabled || (isRunning && !isStepMode)}
					>
						<!-- Play icon SVG -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							viewBox="0 0 256 256"
						>
							<rect width="256" height="256" fill="none" />
							<polygon points="80 56 200 128 80 200 80 56" fill="currentColor" />
						</svg>
						Executar
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onclick={handleStep}
						disabled={disabled || (isRunning && !isStepMode && !isPaused)}
					>
						<!-- Step icon SVG -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							viewBox="0 0 256 256"
						>
							<rect width="256" height="256" fill="none" />
							<polygon points="64 48 184 128 64 208 64 48" fill="currentColor" />
							<line
								x1="208"
								y1="48"
								x2="208"
								y2="208"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
						</svg>
						Passo a Passo
					</Button>
					<Button variant="secondary" size="sm" onclick={handleReset} {disabled}>
						<RotateCwIcon size="16" />
						Reiniciar
					</Button>
					{#if onsave}
						<Button variant="secondary" size="sm" onclick={onsave} disabled={disabled || isRunning}>
							Salvar
						</Button>
					{/if}
					<Button
						variant={strictIndent ? 'primary' : 'secondary'}
						size="sm"
						onclick={() => (strictIndent = !strictIndent)}
						disabled={disabled || isRunning}
					>
						<!-- Indent Icon SVG -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							viewBox="0 0 256 256"
						>
							<rect width="256" height="256" fill="none" />
							<line
								x1="120"
								y1="56"
								x2="224"
								y2="56"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
							<line
								x1="120"
								y1="128"
								x2="224"
								y2="128"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
							<line
								x1="120"
								y1="200"
								x2="224"
								y2="200"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
							<polyline
								points="40 88 80 128 40 168"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
						</svg>
						Identação Estrita
					</Button>
				</Inline>

				<!-- Alternadores de Visibilidade de Painéis (Direita) -->
				<Inline gap="xs">
					<Button
						variant={!isConsoleCollapsed ? 'primary' : 'secondary'}
						size="sm"
						onclick={() => (isConsoleCollapsed = !isConsoleCollapsed)}
					>
						<!-- Terminal/Console Icon -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							viewBox="0 0 256 256"
						>
							<rect width="256" height="256" fill="none" />
							<polyline
								points="40 64 112 128 40 192"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
							<line
								x1="120"
								y1="192"
								x2="216"
								y2="192"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
						</svg>
						Console
					</Button>
					<Button
						variant={!isVariablesCollapsed ? 'primary' : 'secondary'}
						size="sm"
						onclick={() => (isVariablesCollapsed = !isVariablesCollapsed)}
					>
						<!-- Variables Icon -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							viewBox="0 0 256 256"
						>
							<rect width="256" height="256" fill="none" />
							<path
								d="M80,40c-24,0-24,24-24,24v32c0,16-16,24-16,24s16,8,16,24v32c0,0,0,24,24,24"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
							<path
								d="M176,40c24,0,24,24,24,24v32c0,16,16,24,16,24s-16,8-16,24v32c0,0,0,24-24,24"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="16"
							/>
						</svg>
						Variáveis
					</Button>
				</Inline>
			</Inline>
		</div>

		<!-- Grid Layout do Editor + Terminal/Variáveis -->
		<div
			class="workspace-grid"
			style={isConsoleCollapsed && isVariablesCollapsed
				? 'grid-template-columns: 100% 0px 0px'
				: 'grid-template-columns: ' +
					editorWidthPercent +
					'% 12px calc(' +
					(100 - editorWidthPercent) +
					'% - 12px)'}
		>
			<!-- Editor de Código -->
			<div class="editor-col">
				<PortugolEditor
					bind:code
					{activeLine}
					{errorLine}
					disabled={disabled || (isRunning && !isPaused)}
				/>
			</div>

			<!-- Barra de redimensionamento -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="resize-bar"
				class:dragging={isDragging}
				class:hidden={isConsoleCollapsed && isVariablesCollapsed}
				onmousedown={startResize}
				role="separator"
				aria-valuenow={editorWidthPercent}
			></div>

			<!-- Terminal de I/O e inspetor de variáveis -->
			<div
				class="sidebar-col"
				class:hidden={isConsoleCollapsed && isVariablesCollapsed}
				style="grid-template-rows: {isConsoleCollapsed || isVariablesCollapsed
					? '1fr'
					: `${consoleHeightPercent}% 12px calc(${100 - consoleHeightPercent}% - 12px)`}"
			>
				<!-- Console/Terminal -->
				{#if !isConsoleCollapsed}
					<div class="terminal-card" style="grid-row: 1;">
						<div class="panel-header">
							<span>Console</span>
							<button
								type="button"
								class="collapse-btn"
								onclick={() => (isConsoleCollapsed = true)}
							>
								Ocultar
							</button>
						</div>
						<div class="terminal-box">
							<div class="terminal-content">
								{#each outputs as output, index (index)}
									<div class="terminal-line">{output}</div>
								{/each}

								{#if pendingInputVar}
									<div class="terminal-input-prompt">
										<form onsubmit={submitInput} class="input-form">
											<Text size="sm" variant="neutral">leia({pendingInputVar}):</Text>
											<input
												type="text"
												bind:value={currentInputValue}
												placeholder="Digite um valor e pressione Enter"
												class="terminal-text-input"
											/>
											<button type="submit" aria-label="Enviar" style="display: none;"></button>
										</form>
									</div>
								{/if}

								{#if outputs.length === 0 && !pendingInputVar}
									<div class="terminal-empty">Console vazio. Clique em Executar.</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Barra de redimensionamento horizontal -->
				{#if !isConsoleCollapsed && !isVariablesCollapsed}
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<div
						class="horizontal-resize-bar"
						class:dragging={isHorizontalDragging}
						onmousedown={startHorizontalResize}
						role="separator"
						aria-valuenow={consoleHeightPercent}
						style="grid-row: 2;"
					></div>
				{/if}

				<!-- Inspetor de Variáveis -->
				{#if !isVariablesCollapsed}
					<div class="variables-panel-wrapper" style="grid-row: {isConsoleCollapsed ? 1 : 3};">
						<Panel maxWidth="none" fullHeight={true}>
							<div class="panel-header">
								<span>Variáveis</span>
								<button
									type="button"
									class="collapse-btn"
									onclick={() => (isVariablesCollapsed = true)}
								>
									Ocultar
								</button>
							</div>
							<div class="variables-box">
								{#if Object.keys(variables).length > 0}
									<table class="variables-table">
										<thead>
											<tr>
												<th>Nome</th>
												<th>Tipo</th>
												<th>Valor</th>
											</tr>
										</thead>
										<tbody>
											{#each Object.entries(variables) as [name, info] (name)}
												<tr>
													<td class="var-name">{name}</td>
													<td class="var-type">{info.type}</td>
													<td class="var-value">
														{info.value === undefined ? 'vazio' : String(info.value)}
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								{:else}
									<div class="variables-empty">Nenhuma variável ativa.</div>
								{/if}
							</div>
						</Panel>
					</div>
				{/if}
			</div>
		</div>

		<!-- Alerta de erro de compilação/execução -->
		{#if errorMsg}
			<Alert type="error" title="Erro de Execução">
				<div class="error-msg-box">
					<TriangleAlertIcon size="16" />
					<span style="margin-left: 8px;">{errorMsg}</span>
				</div>
			</Alert>
		{/if}
	</Stack>
</div>

<style>
	.portugol-runner {
		width: 100%;
	}

	.toolbar {
		padding: 8px;
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-lg);
	}

	.workspace-grid {
		display: grid;
		gap: 0px;
		width: 100%;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-lg);
		background: var(--bg-primary);
		overflow: hidden;
	}

	@media (min-width: 901px) {
		.workspace-grid {
			height: 480px;
		}
	}

	@media (max-width: 900px) {
		.workspace-grid {
			display: flex;
			flex-direction: column;
			height: auto;
			gap: 16px;
			padding: 12px;
		}
		.editor-col {
			height: 400px;
		}
		.sidebar-col {
			height: 600px;
		}
	}

	.editor-col {
		min-width: 0;
		height: 100%;
	}

	.resize-bar {
		grid-column: 2;
		width: 12px;
		cursor: col-resize;
		background: transparent;
		display: flex;
		justify-content: center;
		align-self: stretch;
		z-index: 10;
		position: relative;
	}

	.resize-bar::before {
		content: '';
		width: 1px;
		background-image: linear-gradient(to bottom, var(--border-color) 60%, transparent 40%);
		background-size: 1px 10px;
		height: 100%;
		transition:
			background-color 0.2s,
			width 0.2s;
	}

	.resize-bar:hover::before,
	.resize-bar.dragging::before {
		background-image: none;
		background-color: var(--accent-primary);
		width: 2px;
	}

	.resize-bar.hidden {
		display: none;
	}

	.sidebar-col {
		display: grid;
		gap: 0px;
		height: 100%;
		min-width: 0;
	}

	.sidebar-col.hidden {
		display: none;
	}

	.terminal-card {
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;
		padding: 12px;
	}

	.terminal-box {
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 18px;
		padding: 12px;
		border-radius: var(--radius-md);
		overflow-y: auto;
		border: var(--border-width) solid var(--border-color);
		flex: 1;
		min-height: 0;
	}

	.terminal-content {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.terminal-line {
		white-space: pre-wrap;
		word-break: break-all;
	}

	.terminal-empty {
		color: var(--text-secondary);
		font-style: italic;
		margin: auto;
		text-align: center;
	}

	.terminal-input-prompt {
		margin-top: 8px;
		border-top: 1px dashed var(--border-color);
		padding-top: 8px;
	}

	.input-form {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.terminal-text-input {
		flex: 1;
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		color: var(--text-primary);
		padding: 4px 8px;
		font-family: inherit;
		font-size: inherit;
		border-radius: var(--radius-sm);
		outline: none;
	}

	.terminal-text-input:focus {
		border-color: var(--accent-primary);
	}

	.variables-panel-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;
		padding: 12px;
	}

	.variables-box {
		height: calc(100% - 32px);
		overflow-y: auto;
		flex: 1;
		min-height: 0;
	}

	.variables-empty {
		color: var(--text-secondary);
		font-style: italic;
		text-align: center;
		padding: 12px 0;
	}

	.variables-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}

	.variables-table th,
	.variables-table td {
		padding: 6px 12px;
		text-align: left;
		border-bottom: 1px solid var(--border-color);
	}

	.variables-table th {
		color: var(--text-secondary);
		font-weight: 500;
	}

	.var-name {
		font-family: var(--font-mono);
		color: var(--accent-primary);
	}

	.var-type {
		font-family: var(--font-mono);
		color: var(--text-secondary);
	}

	.var-value {
		font-family: var(--font-mono);
		color: var(--text-primary);
	}

	.error-msg-box {
		display: flex;
		align-items: center;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 600;
		font-size: 13px;
		margin-bottom: 12px;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.collapse-btn {
		background: transparent;
		border: none;
		color: var(--accent-primary);
		font-family: inherit;
		font-size: 11px;
		cursor: pointer;
		text-transform: none;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
	}

	.collapse-btn:hover {
		background: rgba(224, 123, 57, 0.08);
	}

	.horizontal-resize-bar {
		grid-row: 2;
		height: 12px;
		cursor: row-resize;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		position: relative;
	}

	.horizontal-resize-bar::before {
		content: '';
		height: 1px;
		width: 100%;
		background-image: linear-gradient(to right, var(--border-color) 60%, transparent 40%);
		background-size: 10px 1px;
		transition:
			background-color 0.2s,
			height 0.2s;
	}

	.horizontal-resize-bar:hover::before,
	.horizontal-resize-bar.dragging::before {
		background-image: none;
		background-color: var(--accent-primary);
		height: 2px;
	}
</style>
