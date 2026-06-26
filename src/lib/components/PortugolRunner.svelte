<script lang="ts">
	import PortugolEditor from './PortugolEditor.svelte';
	import Button from './Button.svelte';
	import Panel from './Panel.svelte';
	import Stack from './Stack.svelte';
	import Inline from './Inline.svelte';
	import Alert from './Alert.svelte';
	import Text from './Text.svelte';
	import ZapIcon from './icons/Zap.svelte';
	import RotateCwIcon from './icons/RotateCw.svelte';
	import TriangleAlertIcon from './icons/TriangleAlert.svelte';
	import { Lexer, Parser, Interpreter } from '../utils/portugol/interpreter.js';

	interface Props {
		code?: string;
		disabled?: boolean;
		onOutputsChange?: (outputs: string[]) => void;
		onSuccess?: () => void;
		onFailure?: (error: string) => void;
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
		onFailure
	}: Props = $props();

	let activeLine = $state(0);
	let isRunning = $state(false);
	let isPaused = $state(false);
	let isStepMode = $state(false);
	let variables = $state<Record<string, unknown>>({});
	let outputs = $state<string[]>([]);
	let errorMsg = $state('');

	// Input prompt state
	let pendingInputVar = $state<string | null>(null);
	let currentInputValue = $state('');

	let interpreter: Interpreter | null = null;
	let generator: Generator<unknown, unknown, unknown> | null = null;

	function startExecution(step = false) {
		errorMsg = '';
		outputs = [];
		variables = {};
		activeLine = 0;
		pendingInputVar = null;
		isStepMode = step;

		try {
			const lexer = new Lexer(code);
			const tokens = lexer.tokenize();
			const parser = new Parser(tokens);
			const ast = parser.parse();

			interpreter = new Interpreter(true); // true = debug/step mode enabled
			generator = interpreter.run(ast);
			isRunning = true;
			isPaused = false;

			runNext();
		} catch (e: unknown) {
			const err = e as Error;
			errorMsg = err.message || String(e);
			isRunning = false;
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
					variables?: Record<string, unknown>;
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
			</Inline>
		</div>

		<!-- Grid Layout do Editor + Terminal/Variáveis -->
		<div class="workspace-grid">
			<!-- Editor de Código -->
			<div class="editor-col">
				<PortugolEditor bind:code {activeLine} disabled={disabled || (isRunning && !isPaused)} />
			</div>

			<!-- Terminal de I/O e inspetor de variáveis -->
			<div class="sidebar-col">
				<Stack gap="md">
					<!-- Console/Terminal -->
					<Panel variant="accent">
						<div class="panel-header">Terminal / Console</div>
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
					</Panel>

					<!-- Inspetor de Variáveis -->
					<Panel>
						<div class="panel-header">Variáveis de Execução</div>
						<div class="variables-box">
							{#if Object.keys(variables).length > 0}
								<table class="variables-table">
									<thead>
										<tr>
											<th>Nome</th>
											<th>Valor</th>
										</tr>
									</thead>
									<tbody>
										{#each Object.entries(variables) as [name, val] (name)}
											<tr>
												<td class="var-name">{name}</td>
												<td class="var-value">
													{val === undefined ? 'vazio' : String(val)}
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
				</Stack>
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
		background: var(--color-bg-panel, #24273a);
		border: 1px solid var(--color-border, #36394f);
		border-radius: 8px;
	}

	.workspace-grid {
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: 16px;
	}

	@media (max-width: 900px) {
		.workspace-grid {
			grid-template-columns: 1fr;
		}
	}

	.editor-col {
		min-width: 0;
	}

	.sidebar-col {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.terminal-box {
		background: #11111b;
		color: #a6adc8;
		font-family: 'Fira Code', 'Courier New', Courier, monospace;
		font-size: 13px;
		line-height: 18px;
		height: 180px;
		padding: 12px;
		border-radius: 6px;
		overflow-y: auto;
		border: 1px solid #313244;
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
		color: #585b70;
		font-style: italic;
		margin: auto;
		text-align: center;
	}

	.terminal-input-prompt {
		margin-top: 8px;
		border-top: 1px dashed #313244;
		padding-top: 8px;
	}

	.input-form {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.terminal-text-input {
		flex: 1;
		background: #1e1e2e;
		border: 1px solid #45475a;
		color: #cdd6f4;
		padding: 4px 8px;
		font-family: inherit;
		font-size: inherit;
		border-radius: 4px;
		outline: none;
	}

	.terminal-text-input:focus {
		border-color: var(--color-primary, #b4befe);
	}

	.variables-box {
		max-height: 160px;
		overflow-y: auto;
	}

	.variables-empty {
		color: var(--color-text-muted, #a6adc8);
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
		border-bottom: 1px solid var(--color-border, #36394f);
	}

	.variables-table th {
		color: var(--color-text-muted, #a6adc8);
		font-weight: 500;
	}

	.var-name {
		font-family: 'Fira Code', monospace;
		color: var(--color-primary, #b4befe);
	}

	.var-value {
		font-family: 'Fira Code', monospace;
		color: var(--color-text, #cdd6f4);
	}

	.error-msg-box {
		display: flex;
		align-items: center;
	}

	.panel-header {
		font-weight: 600;
		font-size: 14px;
		margin-bottom: 12px;
		color: var(--color-text, #cdd6f4);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
</style>
