<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Button from './Button.svelte';
	import Panel from './Panel.svelte';
	import Stack from './Stack.svelte';
	import Inline from './Inline.svelte';
	import Text from './Text.svelte';
	import RotateCwIcon from './icons/RotateCw.svelte';
	import XIcon from './icons/X.svelte';
	import { Lexer, Parser, Interpreter, SemanticValidator } from '../utils/portugol/interpreter.js';
	import { i18n } from '../utils/i18n.svelte.js';

	interface Props {
		code: string;
		title?: string;
		onclose?: () => void;
		fill?: boolean;
	}

	let { code, title, onclose, fill = false }: Props = $props();

	let interpreter: Interpreter | null = null;
	let generator: Generator<unknown, unknown, unknown> | null = null;
	let outputs = $state<string[]>([]);
	let pendingInputVar = $state<string | null>(null);
	let currentInputValue = $state('');
	let terminalInputElement = $state<HTMLInputElement | null>(null);
	let isRunning = $state(false);
	let errorMessage = $state('');
	let scheduledRun = $state<ReturnType<typeof setTimeout> | null>(null);

	const executionChunkSize = 500;

	$effect(() => {
		if (pendingInputVar) {
			void tick().then(() => terminalInputElement?.focus());
		}
	});

	onMount(() => {
		startExecution();
		return clearScheduledRun;
	});

	function clearScheduledRun() {
		if (scheduledRun) {
			clearTimeout(scheduledRun);
			scheduledRun = null;
		}
	}

	function resetRuntime() {
		clearScheduledRun();
		interpreter = null;
		generator = null;
		isRunning = false;
		pendingInputVar = null;
		currentInputValue = '';
	}

	function executionError(error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		errorMessage = message || i18n.t('portugolRunner.executionError');
		resetRuntime();
	}

	function startExecution() {
		resetRuntime();
		outputs = [];
		errorMessage = '';

		try {
			const tokens = new Lexer(code).tokenize();
			const ast = new Parser(tokens).parse();
			new SemanticValidator().validate(ast);
			interpreter = new Interpreter(true);
			generator = interpreter.run(ast);
			isRunning = true;
			runNext();
		} catch (error: unknown) {
			executionError(error);
		}
	}

	function scheduleRunNext() {
		clearScheduledRun();
		scheduledRun = setTimeout(() => {
			scheduledRun = null;
			runNext();
		}, 0);
	}

	function runNext(inputValue?: string) {
		if (!generator) return;

		try {
			let result = generator.next(inputValue);
			let chunkSteps = 0;

			while (!result.done) {
				const value = result.value as { type: string; value?: string; variable?: string } | null;
				if (value?.type === 'write') {
					outputs = [...outputs, value.value || ''];
				} else if (value?.type === 'read') {
					pendingInputVar = value.variable || '';
					return;
				} else if (value?.type === 'clear') {
					outputs = [];
				}

				chunkSteps += 1;
				if (chunkSteps >= executionChunkSize) {
					scheduleRunNext();
					return;
				}
				result = generator.next();
			}

			resetRuntime();
		} catch (error: unknown) {
			executionError(error);
		}
	}

	function submitInput(event: SubmitEvent) {
		event.preventDefault();
		if (!pendingInputVar) return;

		const value = currentInputValue;
		currentInputValue = '';
		pendingInputVar = null;
		runNext(value);
	}
</script>

<div class="portugol-console" class:fill>
	<Stack gap="sm" fullHeight={true}>
		<Inline justify="between" align="center" fullWidth wrap>
			{#if title}
				<Text tag="h2" size="lg" weight="bold">{title}</Text>
			{/if}
			<Inline gap="sm" align="center">
				<Button
					variant="secondary"
					size="sm"
					onclick={startExecution}
					title={i18n.t('portugolRunner.reset')}
				>
					<RotateCwIcon size={16} />
				</Button>
				{#if onclose}
					<Button
						variant="secondary"
						size="sm"
						onclick={onclose}
						title={i18n.t('mediaDialog.closeAriaLabel')}
					>
						<XIcon size={16} />
					</Button>
				{/if}
			</Inline>
		</Inline>

		<Panel maxWidth="100%" fullHeight={true} padding="none">
			<div class="terminal-box notranslate" translate="no">
				<div class="terminal-content notranslate" translate="no" spellcheck="false">
					{#if outputs.length > 0}
						<div class="terminal-line">{outputs.join('')}</div>
					{/if}

					{#if errorMessage}
						<Text tag="p" size="sm" variant="error">{errorMessage}</Text>
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

					{#if outputs.length === 0 && !pendingInputVar && !errorMessage && !isRunning}
						<div class="terminal-empty">{i18n.t('portugolRunner.emptyConsole')}</div>
					{/if}
				</div>
			</div>
		</Panel>
	</Stack>
</div>

<style>
	.portugol-console {
		height: 100%;
		min-height: 0;
	}

	.portugol-console.fill {
		width: 100%;
	}

	.terminal-box {
		color: var(--text-primary);
		font-family: var(--font-mono);
		font-size: var(--text-md);
		line-height: 1.45;
		overflow-y: auto;
		height: 100%;
		min-height: 0;
		padding: var(--space-md);
	}

	.terminal-content {
		display: flex;
		flex-direction: column;
		min-height: 100%;
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
		margin-top: var(--space-sm);
		border-top: var(--border-width) dashed var(--border-color);
		padding-top: var(--space-sm);
	}

	.input-form {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.terminal-text-input {
		flex: 1;
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--border-color);
		color: var(--text-primary);
		padding: var(--space-xs) var(--space-sm);
		font: inherit;
		border-radius: var(--radius-sm);
		outline: none;
	}

	.terminal-text-input:focus {
		border-color: var(--accent-primary);
	}
</style>
