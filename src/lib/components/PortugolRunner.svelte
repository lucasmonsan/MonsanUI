<script lang="ts">
	import PortugolEditor from './PortugolEditor.svelte';
	import Button from './Button.svelte';
	import Panel from './Panel.svelte';
	import Stack from './Stack.svelte';
	import Inline from './Inline.svelte';
	import Alert from './Alert.svelte';
	import Text from './Text.svelte';
	import Checkbox from './Checkbox.svelte';
	import ZapIcon from './icons/Zap.svelte';
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
			<Inline gap="sm">
				<Button
					variant="primary"
					size="sm"
					onclick={() => startExecution(false)}
					disabled={disabled || (isRunning && !isStepMode)}
				>
					<ZapIcon size="16" />
					Executar
				</Button>
				<Button
					variant="secondary"
					size="sm"
					onclick={handleStep}
					disabled={disabled || (isRunning && !isStepMode && !isPaused)}
				>
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
				<Checkbox
					bind:checked={strictIndent}
					label="Identação Estrita"
					disabled={disabled || isRunning}
				/>
			</Inline>
		</div>

		<!-- Grid Layout do Editor + Terminal/Variáveis -->
		<div
			class="workspace-grid"
			style="grid-template-columns: {editorWidthPercent}% 12px calc({100 -
				editorWidthPercent}% - 12px)"
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
				onmousedown={startResize}
				role="separator"
				aria-valuenow={editorWidthPercent}
			></div>

			<!-- Terminal de I/O e inspetor de variáveis -->
			<div class="sidebar-col">
				<!-- Console/Terminal -->
				<div class="terminal-card" class:collapsed={isConsoleCollapsed}>
					<div class="panel-header">
						<span>Terminal / Console</span>
						<button
							type="button"
							class="collapse-btn"
							onclick={() => (isConsoleCollapsed = !isConsoleCollapsed)}
						>
							{isConsoleCollapsed ? 'Mostrar' : 'Ocultar'}
						</button>
					</div>
					{#if !isConsoleCollapsed}
						<div class="terminal-box">
							<div class="terminal-content">
								{#each outputs as output, index (index)}
									<div class="terminal-line">{output}</div>
								{/each}

								{#if pendingInputVar}
									<div class="terminal-input-prompt">
										<form onsubmit={submitInput} class="input-form">
											<Text size="sm" variant="neutral">
												leia({pendingInputVar}):
											</Text>
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
					{/if}
				</div>

				<!-- Inspetor de Variáveis -->
				<div class="variables-panel-wrapper" class:collapsed={isVariablesCollapsed}>
					<Panel maxWidth="none" fullHeight={true}>
						<div class="panel-header">
							<span>Variáveis de Execução</span>
							<button
								type="button"
								class="collapse-btn"
								onclick={() => (isVariablesCollapsed = !isVariablesCollapsed)}
							>
								{isVariablesCollapsed ? 'Mostrar' : 'Ocultar'}
							</button>
						</div>
						{#if !isVariablesCollapsed}
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
						{/if}
					</Panel>
				</div>
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
		}
		.editor-col {
			height: 400px;
		}
		.sidebar-col {
			height: 500px;
		}
	}

	.editor-col {
		min-width: 0;
		height: 100%;
	}

	.resize-bar {
		grid-column: 2;
		width: 8px;
		margin: 0 2px;
		cursor: col-resize;
		background: transparent;
		border-left: 1px dashed var(--border-color);
		transition: border-color 0.2s;
		align-self: stretch;
		z-index: 10;
	}

	.resize-bar:hover,
	.resize-bar.dragging {
		border-left: 2px solid var(--accent-primary);
	}

	.sidebar-col {
		display: flex;
		flex-direction: column;
		gap: 16px;
		height: 100%;
		min-width: 0;
	}

	.terminal-card {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		transition: flex 0.2s ease;
	}

	.terminal-card.collapsed {
		flex: none;
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
		flex: 1;
		min-height: 0;
		transition: flex 0.2s ease;
	}

	.variables-panel-wrapper.collapsed {
		flex: none;
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
		font-size: 14px;
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
		font-size: 12px;
		cursor: pointer;
		text-transform: none;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
	}

	.collapse-btn:hover {
		background: rgba(224, 123, 57, 0.08);
	}
</style>
