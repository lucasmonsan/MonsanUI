<script lang="ts">
	import { tick, onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import PortugolEditor from './PortugolEditor.svelte';
	import Button from './Button.svelte';
	import Panel from './Panel.svelte';
	import Stack from './Stack.svelte';
	import Inline from './Inline.svelte';
	import Alert from './Alert.svelte';
	import Text from './Text.svelte';
	import RotateCwIcon from './icons/RotateCw.svelte';
	import TriangleAlertIcon from './icons/TriangleAlert.svelte';
	import PlayIcon from './icons/Play.svelte';
	import SaveIcon from './icons/Save.svelte';
	import SkipForwardIcon from './icons/SkipForward.svelte';
	import XIcon from './icons/X.svelte';
	import SlidersHorizontalIcon from './icons/SlidersHorizontal.svelte';
	import SettingsIcon from './icons/Settings.svelte';
	import CheckIcon from './icons/Check.svelte';
	import Range from './Range.svelte';
	import QuickActions from './QuickActions.svelte';
	import MenuItem from './MenuItem.svelte';
	import { i18n } from '../utils/i18n.svelte.js';
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
		onsave?: (isShortcut?: boolean) => void;
		floatingActions?: Snippet;
		userId?: string;
		fileName?: string;
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
		onsave,
		floatingActions,
		userId,
		fileName
	}: Props = $props();

	let activeLine = $state(0);
	let errorLine = $state(0);
	let strictIndent = $state(false);
	let autoCloseBrackets = $state(true);
	let autoCloseQuotes = $state(true);
	let lineWrapping = $state(true);
	let isRunning = $state(false);
	let isPaused = $state(false);
	let isStepMode = $state(false);
	let variables = $state<Record<string, { value: unknown; type: string }>>({});
	let outputs = $state<string[]>([]);
	let errorMsg = $state('');

	// Zoom and Font Size State
	let fontSize = $state(14);
	let showBlur = $state(true);
	let animateBackground = $state(true);

	const storageKey = $derived(
		userId ? 'monsan-portugol-font-size:' + userId : 'monsan-portugol-font-size:anonymous'
	);

	const strictIndentKey = $derived(
		userId ? 'monsan-portugol-strict-indent:' + userId : 'monsan-portugol-strict-indent:anonymous'
	);
	const autoCloseBracketsKey = $derived(
		userId
			? 'monsan-portugol-auto-close-brackets:' + userId
			: 'monsan-portugol-auto-close-brackets:anonymous'
	);
	const autoCloseQuotesKey = $derived(
		userId
			? 'monsan-portugol-auto-close-quotes:' + userId
			: 'monsan-portugol-auto-close-quotes:anonymous'
	);
	const lineWrappingKey = $derived(
		userId ? 'monsan-portugol-line-wrapping:' + userId : 'monsan-portugol-line-wrapping:anonymous'
	);

	// Load settings preference when user ID changes
	$effect(() => {
		const key = strictIndentKey;
		const saved = localStorage.getItem(key);
		strictIndent = saved === 'true';
	});

	$effect(() => {
		const key = autoCloseBracketsKey;
		const saved = localStorage.getItem(key);
		autoCloseBrackets = saved !== 'false'; // default true
	});

	$effect(() => {
		const key = autoCloseQuotesKey;
		const saved = localStorage.getItem(key);
		autoCloseQuotes = saved !== 'false'; // default true
	});

	$effect(() => {
		const key = lineWrappingKey;
		const saved = localStorage.getItem(key);
		lineWrapping = saved !== 'false'; // default true
	});

	// Save settings on changes
	$effect(() => {
		localStorage.setItem(strictIndentKey, strictIndent.toString());
	});

	$effect(() => {
		localStorage.setItem(autoCloseBracketsKey, autoCloseBrackets.toString());
	});

	$effect(() => {
		localStorage.setItem(autoCloseQuotesKey, autoCloseQuotes.toString());
	});

	$effect(() => {
		localStorage.setItem(lineWrappingKey, lineWrapping.toString());
	});

	$effect(() => {
		localStorage.setItem(storageKey, fontSize.toString());
	});

	// Load font size preference when user ID changes
	$effect(() => {
		const key = storageKey;
		const saved = localStorage.getItem(key);
		if (saved) {
			const parsed = parseInt(saved, 10);
			if (!isNaN(parsed) && parsed >= 10 && parsed <= 32) {
				fontSize = parsed;
				return;
			}
		}
		fontSize = 14;
	});

	// Load showBlur and animateBackground preferences
	$effect(() => {
		const saved = localStorage.getItem('monsan-suite-no-blur');
		if (saved === 'true') {
			showBlur = false;
		} else if (saved === 'false') {
			showBlur = true;
		} else {
			if (typeof document !== 'undefined') {
				showBlur = !document.documentElement.classList.contains('monsan-no-blur');
			}
		}
	});

	$effect(() => {
		const saved = localStorage.getItem('monsan-suite-no-bg-animation');
		if (saved === 'true') {
			animateBackground = false;
		} else if (saved === 'false') {
			animateBackground = true;
		} else {
			if (typeof document !== 'undefined') {
				animateBackground = !document.documentElement.classList.contains('monsan-no-bg-animation');
			}
		}
	});

	// Save preferences reactively and toggle classes on root element
	$effect(() => {
		localStorage.setItem('monsan-suite-no-blur', (!showBlur).toString());
		if (typeof document !== 'undefined') {
			if (!showBlur) {
				document.documentElement.classList.add('monsan-no-blur');
			} else {
				document.documentElement.classList.remove('monsan-no-blur');
			}
		}
	});

	$effect(() => {
		localStorage.setItem('monsan-suite-no-bg-animation', (!animateBackground).toString());
		if (typeof document !== 'undefined') {
			if (!animateBackground) {
				document.documentElement.classList.add('monsan-no-bg-animation');
			} else {
				document.documentElement.classList.remove('monsan-no-bg-animation');
			}
		}
	});

	// Global shortcut listeners for Ctrl + +, Ctrl + -, Ctrl + 0
	onMount(() => {
		function handleKeyDown(e: KeyboardEvent) {
			const isCtrlOrCmd = e.ctrlKey || e.metaKey;
			if (!isCtrlOrCmd) return;

			if (e.key === '=' || e.key === '+') {
				e.preventDefault();
				fontSize = Math.min(32, fontSize + 2);
				localStorage.setItem(storageKey, fontSize.toString());
			} else if (e.key === '-') {
				e.preventDefault();
				fontSize = Math.max(10, fontSize - 2);
				localStorage.setItem(storageKey, fontSize.toString());
			} else if (e.key === '0') {
				e.preventDefault();
				fontSize = 14;
				localStorage.setItem(storageKey, '14');
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Input prompt state
	let pendingInputVar = $state<string | null>(null);
	let currentInputValue = $state('');
	let terminalInputElement = $state<HTMLInputElement | null>(null);

	// Collapsible state
	let isConsoleCollapsed = $state(false);
	let isVariablesCollapsed = $state(false);
	let showLineNumbers = $state(true);

	// Resizable state
	let editorWidthPercent = $state(60);
	let isDragging = $state(false);

	// Horizontal split state
	let consoleHeightPercent = $state(50);
	let isHorizontalDragging = $state(false);

	function startHorizontalResize(e: MouseEvent) {
		e.preventDefault();
		if (window.matchMedia('(max-width: 900px)').matches) return;

		const sidebarElement = (e.currentTarget as HTMLElement).parentElement;
		if (!sidebarElement) return;

		isHorizontalDragging = true;
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
		if (window.matchMedia('(max-width: 900px)').matches) return;

		const gridElement = (e.currentTarget as HTMLElement).parentElement;
		if (!gridElement) return;

		isDragging = true;
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
	let stopRequested = false;
	let scheduledRun: ReturnType<typeof setTimeout> | null = null;
	const executionChunkSize = 500;
	let embeddedConsoleVisible = $derived(!isConsoleCollapsed);
	let sidebarHidden = $derived(!embeddedConsoleVisible && isVariablesCollapsed);
	let sidebarRows = $derived(
		embeddedConsoleVisible && !isVariablesCollapsed
			? `${consoleHeightPercent}% 12px calc(${100 - consoleHeightPercent}% - 12px)`
			: '1fr'
	);

	$effect(() => {
		if (pendingInputVar) {
			void tick().then(() => terminalInputElement?.focus());
		}
	});

	function clearScheduledRun() {
		if (scheduledRun) {
			clearTimeout(scheduledRun);
			scheduledRun = null;
		}
	}

	function scheduleRunNext() {
		clearScheduledRun();
		scheduledRun = setTimeout(() => {
			scheduledRun = null;
			runNext();
		}, 0);
	}

	function finishStoppedExecution() {
		clearScheduledRun();
		isRunning = false;
		isStepMode = false;
		isPaused = false;
		pendingInputVar = null;
		currentInputValue = '';
		activeLine = 0;
		stopRequested = false;
		interpreter = null;
		generator = null;
	}

	function prepareConsoleForExecution() {
		if (isConsoleCollapsed) {
			isConsoleCollapsed = false;
		}
	}

	function startExecution(step = false) {
		clearScheduledRun();
		prepareConsoleForExecution();
		errorMsg = '';
		errorLine = 0;
		outputs = [];
		variables = {};
		activeLine = 0;
		pendingInputVar = null;
		isStepMode = step;
		stopRequested = false;

		if (strictIndent) {
			const indentResult = checkIndentation(code);
			if (!indentResult.ok) {
				errorMsg = indentResult.errorMsg || i18n.t('portugolRunner.indentationError');
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
		if (stopRequested) {
			finishStoppedExecution();
			return;
		}

		try {
			let result = generator.next(inputValue);
			let chunkSteps = 0;

			while (!result.done) {
				if (stopRequested) {
					finishStoppedExecution();
					return;
				}

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

				chunkSteps += 1;
				if (!isStepMode && chunkSteps >= executionChunkSize) {
					scheduleRunNext();
					return;
				}

				result = generator.next();
			}

			// Fim da execução limpa estados
			if (interpreter) {
				variables = interpreter.getGlobalVariables();
			}
			clearScheduledRun();
			isRunning = false;
			isStepMode = false;
			isPaused = false;
			activeLine = 0;
			stopRequested = false;
			interpreter = null;
			generator = null;
			onSuccess?.();
		} catch (e: unknown) {
			if (interpreter) {
				variables = interpreter.getGlobalVariables();
			}
			clearScheduledRun();
			const err = e as Error;
			errorMsg = err.message || String(e);
			const lineMatch = errorMsg.match(/(?:linha|line)\s+(\d+)/i);
			errorLine = lineMatch ? parseInt(lineMatch[1], 10) : 0;
			isRunning = false;
			isStepMode = false;
			isPaused = false;
			stopRequested = false;
			interpreter = null;
			generator = null;
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

	function handleStop() {
		stopRequested = true;
		finishStoppedExecution();
	}

	function handleReset() {
		clearScheduledRun();
		activeLine = 0;
		errorLine = 0;
		isRunning = false;
		isPaused = false;
		isStepMode = false;
		stopRequested = false;
		variables = {};
		outputs = [];
		errorMsg = '';
		pendingInputVar = null;
		currentInputValue = '';
		interpreter = null;
		generator = null;
	}
</script>

{#snippet consoleContent()}
	<div class="terminal-box">
		<div class="terminal-content">
			{#if outputs.length > 0}
				<div class="terminal-line">{outputs.join('')}</div>
			{/if}

			{#if pendingInputVar}
				<div class="terminal-input-prompt">
					<form onsubmit={submitInput} class="input-form">
						<Text size="sm" variant="neutral">&gt;</Text>
						<input
							bind:this={terminalInputElement}
							type="text"
							bind:value={currentInputValue}
							placeholder={i18n.t('portugolRunner.inputPlaceholder')}
							aria-label={i18n.t('portugolRunner.inputLabel', { variable: pendingInputVar })}
							class="terminal-text-input"
						/>
						<button
							type="submit"
							aria-label={i18n.t('portugolRunner.sendInput')}
							style="display: none;"
						></button>
					</form>
				</div>
			{/if}

			{#if outputs.length === 0 && !pendingInputVar}
				<div class="terminal-empty">{i18n.t('portugolRunner.emptyConsole')}</div>
			{/if}
		</div>
	</div>
{/snippet}

<div
	class="portugol-runner"
	class:has-collapsed-panel={isConsoleCollapsed || isVariablesCollapsed}
	style="--runner-font-size: {fontSize}px;"
>
	<Stack gap="sm" fullHeight={true}>
		<!-- Grid Layout do Editor + Terminal/Variáveis -->
		<div class="runner-workspace">
			<div
				class="workspace-grid"
				class:has-collapsed-panel={isConsoleCollapsed || isVariablesCollapsed}
				class:all-panels-collapsed={isConsoleCollapsed && isVariablesCollapsed}
				style={sidebarHidden
					? 'grid-template-columns: 100% 0px 0px'
					: 'grid-template-columns: ' +
						editorWidthPercent +
						'% 12px calc(' +
						(100 - editorWidthPercent) +
						'% - 12px)'}
			>
				<!-- Editor de Código -->
				<div class="editor-col">
					{#if floatingActions}
						<div class="runner-floating-actions">
							{@render floatingActions()}
						</div>
					{/if}
					<PortugolEditor
						bind:code
						{activeLine}
						{errorLine}
						{showLineNumbers}
						{autoCloseBrackets}
						{autoCloseQuotes}
						{lineWrapping}
						disabled={disabled || (isRunning && !isPaused)}
						{onsave}
					/>
					{#if fileName}
						<div class="runner-editor-watermark" aria-hidden="true">
							{fileName}
						</div>
					{/if}
				</div>

				<!-- Barra de redimensionamento -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div
					class="resize-bar"
					class:dragging={isDragging}
					class:hidden={sidebarHidden}
					onmousedown={startResize}
					role="separator"
					aria-valuenow={editorWidthPercent}
				></div>

				<!-- Terminal de I/O e inspetor de variáveis -->
				<div
					class="sidebar-col"
					class:hidden={sidebarHidden}
					style="grid-template-rows: {sidebarRows}"
				>
					<!-- Console/Terminal -->
					{#if embeddedConsoleVisible}
						<div class="terminal-card" style="grid-row: 1;">
							<Panel padding="none" maxWidth="none" fullHeight={true} shadow={false}>
								<div class="panel-header">
									<span>{i18n.t('portugolRunner.consoleTitle')}</span>
									<div class="panel-header-actions">
										<button
											type="button"
											class="collapse-btn"
											onclick={() => (isConsoleCollapsed = true)}
										>
											{i18n.t('portugolRunner.hide')}
										</button>
									</div>
								</div>
								{@render consoleContent()}
							</Panel>
						</div>
					{/if}

					<!-- Barra de redimensionamento horizontal -->
					{#if embeddedConsoleVisible && !isVariablesCollapsed}
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
						<div
							class="variables-panel-wrapper"
							style="grid-row: {embeddedConsoleVisible ? 3 : 1};"
						>
							<Panel padding="none" maxWidth="none" fullHeight={true} shadow={false}>
								<div class="panel-header">
									<span>{i18n.t('portugolRunner.variablesTitle')}</span>
									<button
										type="button"
										class="collapse-btn"
										onclick={() => (isVariablesCollapsed = true)}
									>
										{i18n.t('portugolRunner.hide')}
									</button>
								</div>
								<div class="variables-box">
									{#if Object.keys(variables).length > 0}
										<table class="variables-table">
											<thead>
												<tr>
													<th>{i18n.t('portugolRunner.variableName')}</th>
													<th>{i18n.t('portugolRunner.variableType')}</th>
													<th>{i18n.t('portugolRunner.variableValue')}</th>
												</tr>
											</thead>
											<tbody>
												{#each Object.entries(variables) as [name, info] (name)}
													<tr>
														<td class="var-name">{name}</td>
														<td class="var-type">{info.type}</td>
														<td class="var-value">
															{#if info.value === undefined}
																{i18n.t('portugolRunner.emptyValue')}
															{:else if ['caractere', 'caracter', 'cadeia'].includes(info.type)}
																"{info.value}"
															{:else}
																{String(info.value)}
															{/if}
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									{:else}
										<div class="variables-empty">{i18n.t('portugolRunner.noVariables')}</div>
									{/if}
								</div>
							</Panel>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Alerta de erro de compilação/execução -->
		{#if errorMsg}
			<Alert type="error" title={i18n.t('portugolRunner.executionError')}>
				<div class="error-msg-box">
					<TriangleAlertIcon size="16" />
					<span style="margin-left: 8px;">{errorMsg}</span>
				</div>
			</Alert>
		{/if}

		<!-- Toolbar de controle -->
		<div class="toolbar">
			<Inline justify="between" align="center" fullWidth={true} wrap>
				<!-- Controles de Execução (Esquerda) -->
				<Inline gap="sm" wrap>
					<Button
						variant={isRunning ? 'error' : 'primary'}
						size="sm"
						onclick={() => (isRunning ? handleStop() : startExecution(false))}
						{disabled}
					>
						{#if isRunning}
							<XIcon size="16" />
							<span class="toolbar-label">{i18n.t('portugolRunner.stop')}</span>
						{:else}
							<PlayIcon size="16" />
							<span class="toolbar-label">{i18n.t('portugolRunner.run')}</span>
						{/if}
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onclick={handleStep}
						disabled={disabled || (isRunning && !isStepMode && !isPaused)}
					>
						<SkipForwardIcon size="16" />
						<span class="toolbar-label">{i18n.t('portugolRunner.step')}</span>
					</Button>
					<Button variant="secondary" size="sm" onclick={handleReset} {disabled}>
						<RotateCwIcon size="16" />
						<span class="toolbar-label">{i18n.t('portugolRunner.reset')}</span>
					</Button>
					{#if onsave}
						<Button
							variant="secondary"
							size="sm"
							onclick={() => onsave?.(false)}
							disabled={disabled || isRunning}
						>
							<SaveIcon size="16" />
							<span class="toolbar-label">{i18n.t('portugolRunner.save')}</span>
						</Button>
					{/if}
				</Inline>
				<!-- Configurações e Alternador de Visibilidade (Direita) -->
				<Inline gap="sm" align="center">
					<!-- Menu de Configurações do Editor -->
					<QuickActions align="right">
						{#snippet trigger(toggle)}
							<Button
								variant="secondary"
								size="sm"
								onclick={toggle}
								disabled={disabled || isRunning}
							>
								<SettingsIcon size={16} />
								<span class="toolbar-label">{i18n.t('portugolRunner.settingsTitle')}</span>
							</Button>
						{/snippet}

						<MenuItem
							checked={strictIndent}
							onclick={() => (strictIndent = !strictIndent)}
							align="left"
							data-menu-persistent
						>
							<Inline gap="sm" align="center">
								{#if strictIndent}
									<CheckIcon size={14} />
								{:else}
									<span style="width: 14px"></span>
								{/if}
								<span>{i18n.t('portugolRunner.strictIndentLabel')}</span>
							</Inline>
						</MenuItem>

						<MenuItem
							checked={autoCloseBrackets}
							onclick={() => (autoCloseBrackets = !autoCloseBrackets)}
							align="left"
							data-menu-persistent
						>
							<Inline gap="sm" align="center">
								{#if autoCloseBrackets}
									<CheckIcon size={14} />
								{:else}
									<span style="width: 14px"></span>
								{/if}
								<span>{i18n.t('portugolRunner.autoCloseBracketsLabel')}</span>
							</Inline>
						</MenuItem>

						<MenuItem
							checked={autoCloseQuotes}
							onclick={() => (autoCloseQuotes = !autoCloseQuotes)}
							align="left"
							data-menu-persistent
						>
							<Inline gap="sm" align="center">
								{#if autoCloseQuotes}
									<CheckIcon size={14} />
								{:else}
									<span style="width: 14px"></span>
								{/if}
								<span>{i18n.t('portugolRunner.autoCloseQuotesLabel')}</span>
							</Inline>
						</MenuItem>

						<MenuItem
							checked={lineWrapping}
							onclick={() => (lineWrapping = !lineWrapping)}
							align="left"
							data-menu-persistent
						>
							<Inline gap="sm" align="center">
								{#if lineWrapping}
									<CheckIcon size={14} />
								{:else}
									<span style="width: 14px"></span>
								{/if}
								<span>{i18n.t('portugolRunner.lineWrappingLabel')}</span>
							</Inline>
						</MenuItem>

						<MenuItem
							checked={showBlur}
							onclick={() => (showBlur = !showBlur)}
							align="left"
							data-menu-persistent
						>
							<Inline gap="sm" align="center">
								{#if showBlur}
									<CheckIcon size={14} />
								{:else}
									<span style="width: 14px"></span>
								{/if}
								<span>{i18n.t('portugolRunner.settingsBlurLabel')}</span>
							</Inline>
						</MenuItem>

						<MenuItem
							checked={animateBackground}
							onclick={() => (animateBackground = !animateBackground)}
							align="left"
							data-menu-persistent
						>
							<Inline gap="sm" align="center">
								{#if animateBackground}
									<CheckIcon size={14} />
								{:else}
									<span style="width: 14px"></span>
								{/if}
								<span>{i18n.t('portugolRunner.settingsBgAnimLabel')}</span>
							</Inline>
						</MenuItem>

						<MenuItem align="left" data-menu-persistent>
							<Stack gap="xs" fullWidth>
								<Inline justify="between" fullWidth>
									<Text size="sm" weight="bold">{i18n.t('portugolRunner.fontSizeLabel')}</Text>
									<Text size="sm" weight="bold" variant="secondary">{fontSize}px</Text>
								</Inline>
								<div role="presentation" onclick={(e) => e.stopPropagation()}>
									<Range min={12} max={24} bind:value={fontSize} />
								</div>
							</Stack>
						</MenuItem>

						<div class="zoom-hint-box" data-menu-persistent>
							<Text size="xs" variant="secondary" align="center">
								{i18n.t('portugolRunner.zoomHint')}
							</Text>
						</div>
					</QuickActions>

					<!-- Alternador de Visibilidade Unificado -->
					<QuickActions align="right">
						{#snippet trigger(toggle)}
							<Button
								variant="secondary"
								size="sm"
								onclick={toggle}
								disabled={disabled || isRunning}
							>
								<SlidersHorizontalIcon size={16} />
								<span class="toolbar-label">{i18n.t('portugolRunner.view')}</span>
							</Button>
						{/snippet}

						<MenuItem
							checked={showLineNumbers}
							onclick={() => (showLineNumbers = !showLineNumbers)}
							data-menu-persistent
						>
							{i18n.t('portugolRunner.lines')}
						</MenuItem>
						<MenuItem
							checked={!isConsoleCollapsed}
							onclick={() => (isConsoleCollapsed = !isConsoleCollapsed)}
							data-menu-persistent
						>
							{i18n.t('portugolRunner.consoleTitle')}
						</MenuItem>
						<MenuItem
							checked={!isVariablesCollapsed}
							onclick={() => (isVariablesCollapsed = !isVariablesCollapsed)}
							data-menu-persistent
						>
							{i18n.t('portugolRunner.variablesTitle')}
						</MenuItem>
					</QuickActions>
				</Inline>
			</Inline>
		</div>
	</Stack>
</div>

<style>
	.portugol-runner {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: visible !important;
	}

	.runner-workspace {
		position: relative;
		flex: 1;
		min-height: 0;
		width: 100%;
	}

	.runner-floating-actions {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		z-index: 20;
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.runner-editor-watermark {
		position: absolute;
		bottom: var(--space-sm);
		right: var(--space-sm);
		z-index: 10;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		opacity: 0.35;
		pointer-events: none;
		user-select: none;
		background-color: var(--bg-primary);
		padding: 2px 6px;
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-sm);
	}

	.toolbar {
		padding: 0 4px 4px 0;
		background: transparent;
		border: 0;
		border-radius: 0;
		overflow: visible !important;
	}

	.workspace-grid {
		display: grid;
		gap: 0px;
		width: 100%;
		height: 100%;
		flex: 1;
		min-height: 0;
	}

	@media (max-width: 600px) {
		.toolbar-label {
			display: none;
		}
	}

	.editor-col {
		position: relative;
		min-width: 0;
		min-height: 0;
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
		opacity: 0.25;
		transition: opacity 0.2s ease;
	}

	.resize-bar:hover,
	.resize-bar.dragging {
		opacity: 1;
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
		min-height: 0;
	}

	.sidebar-col.hidden {
		display: none;
	}

	.terminal-card {
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;
		box-sizing: border-box;
	}

	.terminal-box {
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: calc(var(--runner-font-size, 14px) - 1px);
		line-height: 1.45;
		overflow-y: auto;
		flex: 1;
		min-height: 0;
		padding: 16px;
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
		box-sizing: border-box;
	}

	.variables-box {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 16px;
		font-size: calc(var(--runner-font-size, 14px) - 1px);
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
		font-size: inherit;
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
		background: var(--bg-secondary);
		border-bottom: var(--border-width) solid var(--border-color);
		padding: 8px 12px;
		color: var(--text-primary);
		font-family: var(--font-body);
		font-size: var(--text-xs);
		font-weight: 800;
		line-height: 1.25;
		text-transform: uppercase;
		letter-spacing: 0;
		user-select: none;
	}

	.panel-header span {
		display: inline-flex;
		align-items: center;
		min-height: 1.25em;
	}

	.panel-header-actions {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.collapse-btn {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-family: inherit;
		font-size: 11px;
		cursor: pointer;
		text-transform: uppercase;
		font-weight: 800;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		transition:
			color 0.15s ease,
			background-color 0.15s ease;
	}

	.collapse-btn:hover {
		color: var(--text-primary);
		background: rgba(0, 0, 0, 0.05);
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
		opacity: 0.25;
		transition: opacity 0.2s ease;
	}

	.horizontal-resize-bar:hover,
	.horizontal-resize-bar.dragging {
		opacity: 1;
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

	@media (max-width: 900px) {
		.portugol-runner {
			height: 100%;
			min-height: 0;
		}

		.runner-workspace {
			display: flex;
			flex-direction: column;
			flex: 1 1 auto;
			min-height: 0;
			overflow: hidden;
		}

		.workspace-grid {
			display: flex;
			flex-direction: column;
			flex: 1 1 auto;
			height: 100%;
			gap: var(--space-sm);
			min-height: 0;
			overflow: hidden;
			padding: 0;
		}

		.workspace-grid.has-collapsed-panel {
			flex: 1 1 auto;
			height: auto;
			min-height: 0;
			overflow: hidden;
		}

		.workspace-grid.has-collapsed-panel .editor-col {
			height: auto;
			min-height: 0;
			flex: 1 1 0;
		}

		.workspace-grid.all-panels-collapsed {
			height: auto;
		}

		.workspace-grid.all-panels-collapsed .editor-col {
			height: auto;
			flex: 1 1 0;
		}

		.workspace-grid.all-panels-collapsed .resize-bar {
			display: none;
		}

		.runner-floating-actions {
			position: absolute;
			top: var(--space-sm);
			right: var(--space-sm);
			justify-content: flex-end;
		}

		.editor-col {
			height: auto;
			flex: 1 1 0;
		}

		.resize-bar {
			display: none;
		}

		.sidebar-col {
			display: flex;
			flex-direction: column;
			gap: var(--space-sm);
			height: auto;
			min-height: 0;
		}

		.workspace-grid.has-collapsed-panel .sidebar-col {
			flex: 1 1 0;
			height: auto;
			min-height: 0;
			overflow: hidden;
		}

		.terminal-card {
			height: 180px;
			flex: 0 0 180px;
		}

		.variables-panel-wrapper {
			height: 160px;
			flex: 0 0 160px;
		}

		.workspace-grid.has-collapsed-panel .terminal-card,
		.workspace-grid.has-collapsed-panel .variables-panel-wrapper {
			height: auto;
			min-height: 0;
			flex: 1 1 0;
		}

		.horizontal-resize-bar {
			display: none;
		}
	}

	.zoom-hint-box {
		padding: var(--space-xs) var(--space-md);
		border-top: var(--border-width) solid var(--border-color);
		margin-top: var(--space-xs);
		background-color: var(--bg-secondary);
		text-align: center;
		white-space: normal;
		word-break: break-word;
	}
</style>
