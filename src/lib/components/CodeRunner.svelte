<script lang="ts">
	import { tick, onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import CodeEditor from './CodeEditor.svelte';
	import Button from './Button.svelte';
	import Panel from './Panel.svelte';
	import Stack from './Stack.svelte';
	import Inline from './Inline.svelte';
	import Alert from './Alert.svelte';
	import Dialog from './Dialog.svelte';
	import Text from './Text.svelte';
	import RotateCwIcon from './icons/RotateCw.svelte';
	import TriangleAlertIcon from './icons/TriangleAlert.svelte';
	import PlayIcon from './icons/Play.svelte';
	import SaveIcon from './icons/Save.svelte';
	import SkipForwardIcon from './icons/SkipForward.svelte';
	import TerminalIcon from './icons/Terminal.svelte';
	import XIcon from './icons/X.svelte';
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
	import { JavaScriptRunnerSession } from '../utils/javascript/runner.js';

	export interface CodeRunnerProps {
		code?: string;
		language?: 'portugol' | 'javascript';
		disabled?: boolean;
		onOutputsChange?: (outputs: string[]) => void;
		onSuccess?: () => void;
		onFailure?: (error: string) => void;
		onsave?: (isShortcut?: boolean) => void;
		floatingActions?: Snippet;
		userId?: string;
		fileName?: string;
		height?: string;
		fill?: boolean;
		defaultFocusMode?: boolean;
	}

	let {
		code = $bindable(
			`algoritmo "sem nome"
var

inicio

fimalgoritmo`
		),
		language = 'portugol',
		disabled = false,
		onOutputsChange,
		onSuccess,
		onFailure,
		onsave,
		floatingActions,
		userId,
		fileName,
		height = '100%',
		fill = false,
		defaultFocusMode = true
	}: CodeRunnerProps = $props();

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
	let fullErrorMsg = $state('');
	let errorDetailsOpen = $state(false);
	let errorSourceCode = $state('');
	let hasRun = $state(false);

	// Zoom and Font Size State
	let fontSize = $state(14);
	let isFocusMode = $state(false);
	let floatingWidth = $state(320);
	let isFloatingDragging = $state(false);
	let isLoaded = $state(false);

	const jsSession = new JavaScriptRunnerSession();

	function startFloatingResize(e: MouseEvent) {
		e.preventDefault();
		isFloatingDragging = true;
		document.addEventListener('mousemove', handleFloatingResize);
		document.addEventListener('mouseup', stopFloatingResize);
	}

	function handleFloatingResize(e: MouseEvent) {
		if (!isFloatingDragging) return;
		const runnerEl = document.querySelector('.portugol-runner');
		if (runnerEl) {
			const rect = runnerEl.getBoundingClientRect();
			const newWidth = rect.right - e.clientX - 8;
			floatingWidth = Math.max(220, Math.min(newWidth, rect.width * 0.9));
		}
	}

	function stopFloatingResize() {
		isFloatingDragging = false;
		document.removeEventListener('mousemove', handleFloatingResize);
		document.removeEventListener('mouseup', stopFloatingResize);
	}

	const focusModeKey = $derived(
		userId ? 'monsan-portugol-focus-mode:' + userId : 'monsan-portugol-focus-mode:anonymous'
	);

	const storageKey = $derived(
		userId ? 'monsan-portugol-font-size:' + userId : 'monsan-portugol-font-size:anonymous'
	);

	const floatingWidthKey = $derived(
		userId ? 'monsan-portugol-floating-width:' + userId : 'monsan-portugol-floating-width:anonymous'
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

	$effect(() => {
		if (isLoaded) {
			localStorage.setItem(strictIndentKey, strictIndent.toString());
		}
	});

	$effect(() => {
		if (isLoaded) {
			localStorage.setItem(autoCloseBracketsKey, autoCloseBrackets.toString());
		}
	});

	$effect(() => {
		if (isLoaded) {
			localStorage.setItem(autoCloseQuotesKey, autoCloseQuotes.toString());
		}
	});

	$effect(() => {
		if (isLoaded) {
			localStorage.setItem(lineWrappingKey, lineWrapping.toString());
		}
	});

	$effect(() => {
		if (isLoaded) {
			localStorage.setItem(storageKey, fontSize.toString());
		}
	});

	$effect(() => {
		if (isLoaded) {
			localStorage.setItem(focusModeKey, isFocusMode.toString());
		}
	});

	$effect(() => {
		if (isLoaded) {
			localStorage.setItem(floatingWidthKey, floatingWidth.toString());
		}
	});

	onMount(() => {
		if (window.innerWidth <= 560) {
			isFocusMode = true;
		} else {
			const savedFocus = localStorage.getItem(focusModeKey);
			if (savedFocus !== null) {
				isFocusMode = savedFocus === 'true';
			} else {
				isFocusMode = defaultFocusMode;
			}
		}

		const savedWidth = localStorage.getItem(floatingWidthKey);
		if (savedWidth) {
			const parsed = parseInt(savedWidth, 10);
			if (!isNaN(parsed) && parsed >= 220) {
				floatingWidth = parsed;
			}
		}

		const savedFont = localStorage.getItem(storageKey);
		if (savedFont) {
			const parsed = parseInt(savedFont, 10);
			if (!isNaN(parsed) && parsed >= 10 && parsed <= 32) {
				fontSize = parsed;
			}
		}

		const savedStrict = localStorage.getItem(strictIndentKey);
		if (savedStrict !== null) {
			strictIndent = savedStrict === 'true';
		}

		const savedBrackets = localStorage.getItem(autoCloseBracketsKey);
		if (savedBrackets !== null) {
			autoCloseBrackets = savedBrackets !== 'false';
		}

		const savedQuotes = localStorage.getItem(autoCloseQuotesKey);
		if (savedQuotes !== null) {
			autoCloseQuotes = savedQuotes !== 'false';
		}

		const savedWrapping = localStorage.getItem(lineWrappingKey);
		if (savedWrapping !== null) {
			lineWrapping = savedWrapping !== 'false';
		}

		isLoaded = true;
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'F8') {
				e.preventDefault();
				handleStep();
				return;
			}
			if (e.key === 'F9') {
				e.preventDefault();
				if (isRunning) handleStop();
				else startExecution(false);
				return;
			}

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

	onDestroy(() => {
		jsSession.stop();
		clearScheduledRun();
	});

	let pendingInputVar = $state<string | null>(null);
	let pendingPromptResolver = $state<((value: string) => void) | null>(null);
	let currentInputValue = $state('');
	let terminalInputElement = $state<HTMLInputElement | null>(null);

	let resultsVisible = $state(true);
	let showLineNumbers = $state(true);

	let editorWidthPercent = $state(60);
	let isDragging = $state(false);

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
	let resultsPanelVisible = $derived(resultsVisible && (isRunning || hasRun));
	let sidebarHidden = $derived(!resultsPanelVisible || isFocusMode);
	let sidebarRows = $derived(
		language === 'javascript'
			? '100% 0px 0px'
			: `${consoleHeightPercent}% 12px calc(${100 - consoleHeightPercent}% - 12px)`
	);

	$effect(() => {
		if (pendingInputVar) {
			void tick().then(() => terminalInputElement?.focus());
		}
	});

	$effect(() => {
		if (errorMsg && code !== errorSourceCode) {
			errorMsg = '';
			errorLine = 0;
		}
	});

	function setExecutionError(error: unknown) {
		const rawMessage = error instanceof Error ? error.message : String(error);
		const message = formatExecutionError(rawMessage);
		const maxMessageLength = 64;
		errorMsg =
			message.length > maxMessageLength
				? `${message.slice(0, maxMessageLength).trimEnd()}…`
				: message || i18n.t('portugolRunner.executionError');
		fullErrorMsg = message || i18n.t('portugolRunner.executionError');
		errorSourceCode = code;
		const lineMatch = rawMessage.match(/(?:linha|line)\s+(\d+)/i);
		errorLine = lineMatch ? parseInt(lineMatch[1], 10) : 0;
		onFailure?.(errorMsg);
	}

	function formatExecutionError(value: string): string {
		const message = value.replace(/\s+/g, ' ').trim();
		const position = message.match(/linha\s+(\d+)(?:,\s*coluna\s+(\d+))?/i);
		const text = message
			.replace(
				/^erro\s+(?:léxico|de sintaxe|em tempo de execução)\s*:?(?:\s+na)?\s+linha\s+\d+(?:,\s*coluna\s+\d+)?\s*:\s*/i,
				''
			)
			.replace(/^erro\s+na\s+linha\s+\d+(?:,\s*coluna\s+\d+)?\s*:\s*/i, '')
			.replace(/^linha\s+\d+(?:,\s*coluna\s+\d+)?\s*:\s*/i, '')
			.trim();
		if (!position) return text || message;
		const prefix = position[2]
			? `Linha ${position[1]}, coluna ${position[2]}: `
			: `Linha ${position[1]}: `;
		return `${prefix}${text || message}`;
	}

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
		resultsVisible = true;
	}

	function startExecution(step = false) {
		hasRun = true;
		clearScheduledRun();
		prepareConsoleForExecution();
		errorMsg = '';
		errorSourceCode = '';
		errorLine = 0;
		outputs = [];
		variables = {};
		activeLine = 0;
		pendingInputVar = null;
		isStepMode = step;
		stopRequested = false;

		if (language === 'javascript') {
			isRunning = true;
			isPaused = false;
			pendingPromptResolver = null;

			void jsSession.run(code, {
				timeoutMs: 5000,
				isStepMode: step,
				onOutput: (text) => {
					outputs = [...outputs, text + '\n'];
					onOutputsChange?.(outputs);
				},
				onPrompt: (message, reply) => {
					if (message) {
						outputs = [...outputs, message];
						onOutputsChange?.(outputs);
					}
					pendingInputVar = 'prompt';
					pendingPromptResolver = reply;
				},
				onStep: (line, vars) => {
					activeLine = line;
					variables = vars;
					isPaused = true;
				},
				onVariables: (vars) => {
					variables = vars;
				},
				onSuccess: () => {
					isRunning = false;
					isPaused = false;
					activeLine = 0;
					pendingPromptResolver = null;
					onSuccess?.();
				},
				onError: (err) => {
					isRunning = false;
					isPaused = false;
					activeLine = 0;
					pendingPromptResolver = null;
					errorMsg = err.message;
					fullErrorMsg = err.message;
					errorLine = err.line || 0;
					errorSourceCode = code;
					onFailure?.(errorMsg);
				}
			});
			return;
		}

		if (strictIndent) {
			const indentResult = checkIndentation(code);
			if (!indentResult.ok) {
				errorMsg = indentResult.errorMsg || i18n.t('portugolRunner.indentationError');
				errorLine = indentResult.line || 0;
				errorSourceCode = code;
				onFailure?.(errorMsg);
				return;
			}
		}

		try {
			const lexer = new Lexer(code);
			const tokens = lexer.tokenize();
			const parser = new Parser(tokens);
			const ast = parser.parse();

			const validator = new SemanticValidator();
			validator.validate(ast);

			interpreter = new Interpreter(true);
			generator = interpreter.run(ast);
			isRunning = true;
			isPaused = false;

			runNext();
		} catch (error: unknown) {
			setExecutionError(error);
			isRunning = false;
			isStepMode = false;
			isPaused = false;
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
						isPaused = true;
						return;
					}
				} else if (val && val.type === 'write') {
					outputs = [...outputs, val.value || ''];
					onOutputsChange?.(outputs);
				} else if (val && val.type === 'read') {
					pendingInputVar = val.variable || '';
					isPaused = true;
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
		} catch (error: unknown) {
			if (interpreter) {
				variables = interpreter.getGlobalVariables();
			}
			clearScheduledRun();
			setExecutionError(error);
			isRunning = false;
			isStepMode = false;
			isPaused = false;
			stopRequested = false;
			interpreter = null;
			generator = null;
		}
	}

	function handleStep() {
		if (pendingInputVar) return;
		if (language === 'javascript') {
			if (!isRunning) {
				startExecution(true);
			} else if (isPaused) {
				isPaused = false;
				jsSession.step();
			}
			return;
		}
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

		outputs = [...outputs, `${value}\n`];
		onOutputsChange?.(outputs);

		if (pendingPromptResolver) {
			const resolver = pendingPromptResolver;
			pendingPromptResolver = null;
			resolver(value);
			return;
		}

		runNext(value);
	}

	function handleStop() {
		hasRun = false;
		pendingPromptResolver = null;
		pendingInputVar = null;
		if (language === 'javascript') {
			jsSession.stop();
			isRunning = false;
			isPaused = false;
			activeLine = 0;
			return;
		}
		stopRequested = true;
		finishStoppedExecution();
	}

	function handleReset() {
		hasRun = false;
		pendingPromptResolver = null;
		if (language === 'javascript') {
			jsSession.stop();
		}
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
		errorSourceCode = '';
		pendingInputVar = null;
		currentInputValue = '';
		interpreter = null;
		generator = null;
		resultsVisible = true;
	}

	function toggleResults() {
		resultsVisible = !resultsVisible;
	}
</script>

{#snippet consoleContent()}
	<div class="terminal-box notranslate" translate="no">
		<div class="terminal-content notranslate" translate="no" spellcheck="false">
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
							aria-label={language === 'javascript'
								? i18n.t('portugolRunner.inputPlaceholder')
								: i18n.t('portugolRunner.inputLabel', { variable: pendingInputVar })}
							class="terminal-text-input"
							translate="no"
							spellcheck="false"
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
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

{#snippet variablesContent()}
	<div class="variables-box notranslate" translate="no" spellcheck="false">
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
								{:else if ['caractere', 'caracter', 'cadeia', 'string', 'texto'].includes(info.type)}
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
{/snippet}

<div class="portugol-runner" class:fill style="--runner-font-size: {fontSize}px;" style:height>
	<Stack gap="sm" fullHeight={true}>
		<!-- Grid Layout do Editor + Terminal/Variáveis -->
		<div class="runner-workspace">
			<div
				class="workspace-grid"
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
					<CodeEditor
						bind:code
						{language}
						{activeLine}
						followActiveLine={isRunning && isStepMode}
						{errorLine}
						{showLineNumbers}
						{autoCloseBrackets}
						{autoCloseQuotes}
						{lineWrapping}
						disabled={disabled || (isRunning && !isPaused)}
						{onsave}
					/>
					{#if isFocusMode && isRunning}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="editor-blocked-overlay" onclick={handleStop}></div>
					{/if}
					{#if fileName}
						<div class="runner-editor-watermark notranslate" aria-hidden="true" translate="no">
							{fileName}
						</div>
					{/if}

					<!-- Controles de Ação Flutuantes (Apenas Ícones) -->
					<div class="runner-floating-controls">
						<Button
							variant={isRunning ? 'error' : 'primary'}
							size="sm"
							onclick={() => (isRunning ? handleStop() : startExecution(false))}
							{disabled}
							title={isRunning ? i18n.t('portugolRunner.stop') : i18n.t('portugolRunner.run')}
						>
							{#if isRunning}
								<XIcon size={16} />
							{:else}
								<PlayIcon size={16} />
							{/if}
						</Button>
						{#if language === 'portugol' || language === 'javascript'}
							<Button
								variant="secondary"
								size="sm"
								onclick={handleStep}
								disabled={disabled ||
									Boolean(pendingInputVar) ||
									(isRunning && !isStepMode && !isPaused)}
								title={i18n.t('portugolRunner.step')}
							>
								<SkipForwardIcon size={16} />
							</Button>
						{/if}
						<Button
							variant="secondary"
							size="sm"
							onclick={handleReset}
							{disabled}
							title={i18n.t('portugolRunner.reset')}
						>
							<RotateCwIcon size={16} />
						</Button>
						{#if hasRun && !isRunning}
							<Button
								variant="secondary"
								size="sm"
								onclick={toggleResults}
								title={resultsVisible
									? i18n.t('portugolRunner.hideResults')
									: i18n.t('portugolRunner.showResults')}
							>
								<TerminalIcon size={16} />
							</Button>
						{/if}
						{#if onsave}
							<Button
								variant="secondary"
								size="sm"
								onclick={() => onsave?.(false)}
								disabled={disabled || isRunning}
								title={i18n.t('portugolRunner.save')}
							>
								<SaveIcon size={16} />
							</Button>
						{/if}

						<QuickActions align="right">
							{#snippet trigger(toggle)}
								<Button
									variant="secondary"
									size="sm"
									onclick={toggle}
									disabled={disabled || isRunning}
									title={i18n.t('portugolRunner.settingsTitle')}
								>
									<SettingsIcon size={16} />
								</Button>
							{/snippet}

							{#if language === 'portugol'}
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
							{/if}

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
								checked={isFocusMode}
								onclick={() => (isFocusMode = !isFocusMode)}
								align="left"
								data-menu-persistent
							>
								<Inline gap="sm" align="center">
									{#if isFocusMode}
										<CheckIcon size={14} />
									{:else}
										<span style="width: 14px"></span>
									{/if}
									<span>{i18n.t('portugolRunner.settingsFocusModeLabel')}</span>
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
					</div>
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
					class:hidden={!resultsPanelVisible}
					class:focus-floating={isFocusMode}
					style="grid-template-rows: {sidebarRows}"
					style:--floating-width={isFocusMode ? `${floatingWidth}px` : undefined}
				>
					{#if isFocusMode}
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div
							class="floating-resize-handle"
							class:dragging={isFloatingDragging}
							onmousedown={startFloatingResize}
							role="separator"
						></div>
					{/if}
					<!-- Console/Terminal -->
					{#if resultsVisible}
						<div class="terminal-card" style="grid-row: 1;">
							{#if isFocusMode}
								<div class="focus-panel-header">
									<span>{i18n.t('portugolRunner.consoleTitle')}</span>
									<button type="button" class="collapse-btn" onclick={toggleResults}>
										{i18n.t('portugolRunner.hideResults')}
									</button>
								</div>
								{@render consoleContent()}
							{:else}
								<Panel padding="none" maxWidth="none" fullHeight={true} shadow={false}>
									<div class="panel-header">
										<span>{i18n.t('portugolRunner.consoleTitle')}</span>
										<button type="button" class="collapse-btn" onclick={toggleResults}>
											{i18n.t('portugolRunner.hideResults')}
										</button>
									</div>
									{@render consoleContent()}
								</Panel>
							{/if}
						</div>
					{/if}

					<!-- Barra de redimensionamento horizontal -->
					{#if resultsVisible && language === 'portugol'}
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

					<!-- Inspetor de Variáveis (apenas Portugol) -->
					{#if resultsVisible && language === 'portugol'}
						<div class="variables-panel-wrapper" style="grid-row: 3;">
							{#if isFocusMode}
								<div class="focus-panel-header">
									<span>{i18n.t('portugolRunner.variablesTitle')}</span>
								</div>
								{@render variablesContent()}
							{:else}
								<Panel padding="none" maxWidth="none" fullHeight={true} shadow={false}>
									<div class="panel-header">
										<span>{i18n.t('portugolRunner.variablesTitle')}</span>
									</div>
									{@render variablesContent()}
								</Panel>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Alerta de erro de compilação/execução -->
		{#if errorMsg}
			<Alert type="error" title={i18n.t('portugolRunner.executionError')}>
				<Inline align="start" gap="sm" wrap fullWidth>
					<TriangleAlertIcon size="16" />
					<span class="error-message">{errorMsg}</span>
					{#if fullErrorMsg.length > errorMsg.length}
						<Button variant="secondary" size="sm" onclick={() => (errorDetailsOpen = true)}>
							{i18n.t('portugolRunner.errorDetails')}
						</Button>
					{/if}
				</Inline>
			</Alert>
		{/if}

		<Dialog
			open={errorDetailsOpen}
			title={i18n.t('portugolRunner.errorDetailsTitle')}
			onClose={() => (errorDetailsOpen = false)}
		>
			<Text tag="p">{fullErrorMsg}</Text>
		</Dialog>
	</Stack>
</div>

<style>
	.focus-panel-header {
		padding: var(--space-xs) var(--space-sm);
		font-size: var(--font-size-sm);
		font-weight: bold;
		border-bottom: var(--border-width) solid var(--border-color);
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		flex: 0 0 auto;
	}

	.editor-blocked-overlay {
		position: absolute;
		inset: 0;
		z-index: 40;
		cursor: pointer;
		background: rgba(0, 0, 0, 0.22);
		box-sizing: border-box;
	}

	.sidebar-col.focus-floating {
		position: absolute;
		right: 8px;
		top: 8px;
		width: var(--floating-width, 320px) !important;
		max-width: 90%;
		max-height: 90%;
		z-index: 50;
		background: transparent;
		border: none;
		box-shadow: none;
		overflow: visible;
		display: grid;
		gap: 0px;
		transition:
			opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
			visibility 0.2s;
		opacity: 1;
		transform: scale(1);
		visibility: visible;
		pointer-events: auto;
	}

	.sidebar-col.focus-floating.hidden {
		display: grid !important;
		opacity: 0 !important;
		transform: scale(0.95) !important;
		pointer-events: none !important;
		visibility: hidden !important;
	}

	.sidebar-col.focus-floating .terminal-card,
	.sidebar-col.focus-floating .variables-panel-wrapper {
		background: var(--bg-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-height: 80px;
	}

	.sidebar-col.focus-floating .horizontal-resize-bar {
		height: 6px;
	}

	.floating-resize-handle {
		position: absolute;
		left: -4px;
		top: 0;
		bottom: 0;
		width: 8px;
		cursor: ew-resize;
		z-index: 60;
		background: transparent;
	}

	.portugol-runner {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: min(28rem, 60dvh);
		overflow: visible !important;
	}

	.portugol-runner.fill {
		min-height: 0;
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
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
		bottom: 64px;
		right: 16px;
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

	.runner-floating-controls {
		position: absolute;
		bottom: 16px;
		right: 16px;
		z-index: 70;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		background: transparent;
		border: none;
		box-shadow: none;
		padding: 0;
	}

	.workspace-grid {
		display: grid;
		gap: 0px;
		width: 100%;
		height: 100%;
		flex: 1;
		min-height: 0;
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

	.error-message {
		flex: 1 1 18rem;
		min-width: 0;
		overflow-wrap: anywhere;
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

		.terminal-card {
			height: 180px;
			flex: 0 0 180px;
		}

		.variables-panel-wrapper {
			height: 160px;
			flex: 0 0 160px;
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
