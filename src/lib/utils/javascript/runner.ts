import { javascriptLanguage } from '@codemirror/lang-javascript';
import { instrumentJsCode } from './instrument.js';
import {
	findJsSyntaxError,
	translateJsErrorMessage,
	extractJsErrorLine,
	formatJsExecutionError
} from './diagnostics.js';

export { findJsSyntaxError, translateJsErrorMessage, extractJsErrorLine, formatJsExecutionError };

export interface JavaScriptRunOptions {
	timeoutMs?: number;
	isStepMode?: boolean;
	onOutput?: (text: string) => void;
	onClear?: () => void;
	onPrompt?: (message: string, reply: (value: string) => void) => void;
	onStep?: (line: number, variables: Record<string, { value: unknown; type: string }>) => void;
	onVariables?: (variables: Record<string, { value: unknown; type: string }>) => void;
	onSuccess?: () => void;
	onError?: (error: { message: string; line?: number }) => void;
}

export interface JavaScriptRunResult {
	outputs: string[];
	error: { message: string; line?: number } | null;
	variables?: Record<string, { value: unknown; type: string }>;
	stopped?: boolean;
}

const DEFAULT_TIMEOUT_MS = 5000;

function formatArg(arg: unknown): string {
	if (arg === null) return 'null';
	if (arg === undefined) return 'undefined';
	if (typeof arg === 'object') {
		try {
			return JSON.stringify(arg, null, 2);
		} catch {
			return String(arg);
		}
	}
	return String(arg);
}

export function formatVar(val: unknown): { value: unknown; type: string } {
	if (val === null) return { value: 'null', type: 'null' };
	if (val === undefined) return { value: undefined, type: 'undefined' };
	if (Array.isArray(val)) {
		try {
			return { value: JSON.stringify(val), type: 'array' };
		} catch {
			return { value: String(val), type: 'array' };
		}
	}
	const t = typeof val;
	if (t === 'string') return { value: val, type: 'string' };
	if (t === 'number') return { value: val, type: 'number' };
	if (t === 'boolean') return { value: val ? 'true' : 'false', type: 'boolean' };
	if (t === 'function') return { value: '[Função]', type: 'function' };
	if (t === 'object') {
		try {
			return { value: JSON.stringify(val), type: 'object' };
		} catch {
			return { value: String(val), type: 'object' };
		}
	}
	return { value: String(val), type: t };
}

/**
 * Transforms standard synchronous `prompt(...)` and `window.prompt(...)` calls into
 * `await __crocode_prompt(...)` so students can write standard JavaScript syntax.
 * Also marks enclosing functions as `async` if they aren't already.
 */
export function transformJsForPrompt(code: string): string {
	try {
		const tree = javascriptLanguage.parser.parse(code);
		const cursor = tree.cursor();
		const replacements: Array<{ from: number; to: number; text: string }> = [];
		const asyncFuncPositions = new Set<number>();

		do {
			if (cursor.name === 'CallExpression') {
				const sub = cursor.node.firstChild;
				const isPrompt =
					sub &&
					((sub.name === 'VariableName' && code.slice(sub.from, sub.to) === 'prompt') ||
						(sub.name === 'MemberExpression' && code.slice(sub.from, sub.to) === 'window.prompt'));

				if (isPrompt) {
					replacements.push({ from: cursor.from, to: sub.to, text: 'await __crocode_prompt' });

					let parent = cursor.node.parent;
					while (parent) {
						if (
							parent.name === 'FunctionDeclaration' ||
							parent.name === 'FunctionExpression' ||
							parent.name === 'ArrowFunction'
						) {
							const text = code.slice(parent.from, parent.to);
							if (!text.startsWith('async')) {
								asyncFuncPositions.add(parent.from);
							}
							break;
						}
						parent = parent.parent;
					}
				}
			}
		} while (cursor.next());

		for (const pos of asyncFuncPositions) {
			replacements.push({ from: pos, to: pos, text: 'async ' });
		}

		replacements.sort((a, b) => b.from - a.from);

		let result = code;
		for (const rep of replacements) {
			result = result.slice(0, rep.from) + rep.text + result.slice(rep.to);
		}

		return result;
	} catch {
		return code;
	}
}

/**
 * Builds the Worker script content for sandboxed execution in the browser.
 * Inlining the user code inside an async IIFE eliminates calls to new Function() or eval(),
 * ensuring strict CSP compliance without triggering 'call to Function() blocked by CSP'.
 */
export function buildWorkerScript(
	code: string,
	id: number,
	isStepMode = false
): { script: string; headerLineCount: number } {
	const transformedCode = instrumentJsCode(code);
	const headerLines = [
		'function formatArg(arg) {',
		'  if (arg === null) return "null";',
		'  if (arg === undefined) return "undefined";',
		'  if (typeof arg === "object") {',
		'    try { return JSON.stringify(arg, null, 2); } catch { return String(arg); }',
		'  }',
		'  return String(arg);',
		'}',
		'function formatVar(val) {',
		'  if (val === null) return { value: "null", type: "null" };',
		'  if (val === undefined) return { value: undefined, type: "undefined" };',
		'  if (Array.isArray(val)) {',
		'    try { return { value: JSON.stringify(val), type: "array" }; }',
		'    catch { return { value: String(val), type: "array" }; }',
		'  }',
		'  const t = typeof val;',
		'  if (t === "string") return { value: val, type: "string" };',
		'  if (t === "number") return { value: val, type: "number" };',
		'  if (t === "boolean") return { value: val ? "true" : "false", type: "boolean" };',
		'  if (t === "function") return { value: "[Função]", type: "function" };',
		'  if (t === "object") {',
		'    try { return { value: JSON.stringify(val), type: "object" }; }',
		'    catch { return { value: String(val), type: "object" }; }',
		'  }',
		'  return { value: String(val), type: t };',
		'}',
		'console.log = (...args) => { self.postMessage({ id: ' +
			id +
			', type: "output", text: args.map(formatArg).join(" ") }); };',
		'console.info = (...args) => { self.postMessage({ id: ' +
			id +
			', type: "output", text: args.map(formatArg).join(" ") }); };',
		'console.warn = (...args) => { self.postMessage({ id: ' +
			id +
			', type: "output", text: "[AVISO] " + args.map(formatArg).join(" ") }); };',
		'console.error = (...args) => { self.postMessage({ id: ' +
			id +
			', type: "output", text: "[ERRO] " + args.map(formatArg).join(" ") }); };',
		'console.clear = () => { self.postMessage({ id: ' + id + ', type: "clear" }); };',
		'let __promptCounter = 0;',
		'const __pendingPrompts = new Map();',
		'let __stepResolver = null;',
		'let __isStepMode = ' + (isStepMode ? 'true' : 'false') + ';',
		'let __latestVariables = {};',
		'self.onmessage = (e) => {',
		'  if (e.data && e.data.type === "prompt_reply") {',
		'    const resolver = __pendingPrompts.get(e.data.promptId);',
		'    if (resolver) {',
		'      __pendingPrompts.delete(e.data.promptId);',
		'      resolver(e.data.value !== undefined ? String(e.data.value) : "");',
		'    }',
		'  } else if (e.data && e.data.type === "step_next") {',
		'    if (__stepResolver) {',
		'      const r = __stepResolver;',
		'      __stepResolver = null;',
		'      r();',
		'    }',
		'  } else if (e.data && e.data.type === "step_continue") {',
		'    __isStepMode = false;',
		'    if (__stepResolver) {',
		'      const r = __stepResolver;',
		'      __stepResolver = null;',
		'      r();',
		'    }',
		'  }',
		'};',
		'function __crocode_prompt(msg) {',
		'  const promptId = ++__promptCounter;',
		'  return new Promise((resolve) => {',
		'    __pendingPrompts.set(promptId, resolve);',
		'    self.postMessage({ id: ' +
			id +
			', type: "prompt", promptId, message: msg !== undefined ? String(msg) : "" });',
		'  });',
		'}',
		'const prompt = __crocode_prompt;',
		'async function __crocode_step(line, rawVars) {',
		'  const formatted = {};',
		'  for (const k of Object.keys(rawVars)) {',
		'    formatted[k] = formatVar(rawVars[k]);',
		'  }',
		'  __latestVariables = formatted;',
		'  if (__isStepMode && line > 0) {',
		'    self.postMessage({ id: ' + id + ', type: "step", line, variables: formatted });',
		'    await new Promise((resolve) => {',
		'      __stepResolver = resolve;',
		'    });',
		'  } else if (line === 0) {',
		'    self.postMessage({ id: ' + id + ', type: "variables", variables: formatted });',
		'  }',
		'}',
		'function __crocode_record_vars(rawVars) {',
		'  for (const k of Object.keys(rawVars)) {',
		'    __latestVariables[k] = formatVar(rawVars[k]);',
		'  }',
		'}',
		'(async () => {'
	];

	const footer = [
		'})().then((result) => {',
		'  if (result !== undefined) {',
		'    self.postMessage({ id: ' + id + ', type: "output", text: "<- " + formatArg(result) });',
		'  }',
		'  self.postMessage({ id: ' + id + ', type: "done", variables: __latestVariables });',
		'}).catch((err) => {',
		'  const message = err instanceof Error ? err.message : String(err);',
		'  let line = 0;',
		'  if (err && err.stack) {',
		'    const matches = Array.from(err.stack.matchAll(/(?:blob:[^:]+):(\\d+)(?::(\\d+))?/gi));',
		'    if (matches.length > 0) {',
		'      const raw = parseInt(matches[0][1], 10);',
		'      if (!isNaN(raw) && raw > ' + headerLines.length + ') {',
		'        line = raw - ' + headerLines.length + ';',
		'      }',
		'    }',
		'  }',
		'  self.postMessage({ id: ' + id + ', type: "error", message, line });',
		'});'
	].join('\n');

	return {
		script: headerLines.join('\n') + '\n' + transformedCode + '\n' + footer,
		headerLineCount: headerLines.length
	};
}

/**
 * Executes JavaScript code in an isolated Web Worker (in browser) or via async function fallback (in test/Node environments).
 */
export class JavaScriptRunnerSession {
	private worker: Worker | null = null;
	private workerUrl: string | null = null;
	private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
	private activeRunId = 0;
	private isStopped = false;
	private onStopSettler: ((result: JavaScriptRunResult) => void) | null = null;
	private nodeStepResolver: (() => void) | null = null;
	private nodeIsStepMode = false;

	step(): void {
		if (this.worker) {
			this.worker.postMessage({ type: 'step_next' });
		} else if (this.nodeStepResolver) {
			const r = this.nodeStepResolver;
			this.nodeStepResolver = null;
			r();
		}
	}

	continue(): void {
		if (this.worker) {
			this.worker.postMessage({ type: 'step_continue' });
		} else {
			this.nodeIsStepMode = false;
			if (this.nodeStepResolver) {
				const r = this.nodeStepResolver;
				this.nodeStepResolver = null;
				r();
			}
		}
	}

	stop(): void {
		this.isStopped = true;
		if (this.timeoutTimer) {
			clearTimeout(this.timeoutTimer);
			this.timeoutTimer = null;
		}
		if (this.worker) {
			this.worker.terminate();
			this.worker = null;
		}
		if (this.workerUrl) {
			URL.revokeObjectURL(this.workerUrl);
			this.workerUrl = null;
		}
		if (this.nodeStepResolver) {
			const r = this.nodeStepResolver;
			this.nodeStepResolver = null;
			r();
		}
		if (this.onStopSettler) {
			const settler = this.onStopSettler;
			this.onStopSettler = null;
			settler({ outputs: [], error: null, stopped: true });
		}
	}

	async run(code: string, options: JavaScriptRunOptions = {}): Promise<JavaScriptRunResult> {
		this.stop();
		this.isStopped = false;

		const syntaxError = findJsSyntaxError(code);
		if (syntaxError) {
			const error = {
				message: `Linha ${syntaxError.line}: ${syntaxError.message}`,
				line: syntaxError.line
			};
			options.onError?.(error);
			return Promise.resolve({ outputs: [], error });
		}

		const runId = ++this.activeRunId;
		const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
		const isStepMode = options.isStepMode ?? false;
		const outputs: string[] = [];

		return new Promise<JavaScriptRunResult>((resolve) => {
			let settled = false;

			const finish = (result: JavaScriptRunResult) => {
				if (settled) return;
				settled = true;
				if (this.timeoutTimer) {
					clearTimeout(this.timeoutTimer);
					this.timeoutTimer = null;
				}
				if (this.activeRunId === runId) {
					if (this.worker) {
						this.worker.terminate();
						this.worker = null;
					}
					if (this.workerUrl) {
						URL.revokeObjectURL(this.workerUrl);
						this.workerUrl = null;
					}
				}
				if (result.error) {
					options.onError?.(result.error);
				} else {
					options.onSuccess?.();
				}
				resolve(result);
			};

			this.onStopSettler = finish;

			const resetTimeout = () => {
				if (this.timeoutTimer) {
					clearTimeout(this.timeoutTimer);
					this.timeoutTimer = null;
				}
				if (timeoutMs > 0) {
					this.timeoutTimer = setTimeout(() => {
						if (!settled && this.activeRunId === runId) {
							finish({
								outputs,
								error: {
									message: `Tempo limite de execução excedido (${(timeoutMs / 1000).toFixed(0)}s). Possível loop infinito.`
								}
							});
						}
					}, timeoutMs);
				}
			};

			const handleOutput = (text: string) => {
				if (this.isStopped || settled) return;
				outputs.push(text);
				options.onOutput?.(text);
			};

			// Handle browser Web Worker execution
			if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
				try {
					const { script, headerLineCount } = buildWorkerScript(code, runId, isStepMode);
					const blob = new Blob([script], { type: 'application/javascript' });
					this.workerUrl = URL.createObjectURL(blob);
					this.worker = new Worker(this.workerUrl);

					resetTimeout();

					this.worker.onmessage = (e: MessageEvent) => {
						if (this.isStopped || settled || e.data.id !== runId) return;
						const data = e.data;
						if (data.type === 'output') {
							handleOutput(data.text);
						} else if (data.type === 'clear') {
							outputs.length = 0;
							options.onClear?.();
						} else if (data.type === 'step') {
							if (this.timeoutTimer) {
								clearTimeout(this.timeoutTimer);
								this.timeoutTimer = null;
							}
							options.onStep?.(data.line, data.variables || {});
						} else if (data.type === 'variables') {
							options.onVariables?.(data.variables || {});
						} else if (data.type === 'prompt') {
							if (this.timeoutTimer) {
								clearTimeout(this.timeoutTimer);
								this.timeoutTimer = null;
							}
							if (options.onPrompt) {
								options.onPrompt(data.message || '', (value: string) => {
									if (this.isStopped || settled) return;
									resetTimeout();
									this.worker?.postMessage({
										type: 'prompt_reply',
										promptId: data.promptId,
										value
									});
								});
							} else {
								resetTimeout();
								this.worker?.postMessage({
									type: 'prompt_reply',
									promptId: data.promptId,
									value: ''
								});
							}
						} else if (data.type === 'done') {
							if (data.variables) {
								options.onVariables?.(data.variables);
							}
							finish({ outputs, error: null, variables: data.variables });
						} else if (data.type === 'error') {
							const formatted = formatJsExecutionError(data.message, code);
							if (data.line && data.line > 0) {
								formatted.line = data.line;
								formatted.message = `Linha ${data.line}: ${translateJsErrorMessage(data.message)}`;
							}
							finish({ outputs, error: formatted });
						}
					};

					this.worker.onerror = (err: ErrorEvent) => {
						if (this.isStopped || settled) return;
						const rawMsg = err.message || 'Erro ao executar script';
						const formatted = formatJsExecutionError(rawMsg, code);
						if (
							typeof err.lineno === 'number' &&
							err.lineno > headerLineCount &&
							formatted.line === 0
						) {
							formatted.line = err.lineno - headerLineCount;
							formatted.message = `Linha ${formatted.line}: ${translateJsErrorMessage(rawMsg)}`;
						}
						finish({ outputs, error: formatted });
					};

					return;
				} catch {
					// Fall through to fallback
				}
			}

			// Fallback (e.g. Node / unit tests without Worker support)
			const capturedOutputs: string[] = [];
			const origLog = console.log;
			const origWarn = console.warn;
			const origError = console.error;
			const origInfo = console.info;
			const origClear = console.clear;

			console.log = (...args: unknown[]) => {
				if (this.isStopped) return;
				const text = args.map(formatArg).join(' ');
				capturedOutputs.push(text);
				handleOutput(text);
			};
			console.info = (...args: unknown[]) => {
				if (this.isStopped) return;
				const text = args.map(formatArg).join(' ');
				capturedOutputs.push(text);
				handleOutput(text);
			};
			console.warn = (...args: unknown[]) => {
				if (this.isStopped) return;
				const text = `[AVISO] ${args.map(formatArg).join(' ')}`;
				capturedOutputs.push(text);
				handleOutput(text);
			};
			console.error = (...args: unknown[]) => {
				if (this.isStopped) return;
				const text = `[ERRO] ${args.map(formatArg).join(' ')}`;
				capturedOutputs.push(text);
				handleOutput(text);
			};
			console.clear = () => {
				if (this.isStopped) return;
				capturedOutputs.length = 0;
				outputs.length = 0;
				options.onClear?.();
			};

			const restoreConsole = () => {
				console.log = origLog;
				console.warn = origWarn;
				console.error = origError;
				console.info = origInfo;
				console.clear = origClear;
			};

			resetTimeout();

			try {
				const transformed = instrumentJsCode(code);
				const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
				const promptFn = (msg?: unknown) => {
					if (this.isStopped) return Promise.resolve('');
					const message = msg !== undefined ? String(msg) : '';
					if (this.timeoutTimer) {
						clearTimeout(this.timeoutTimer);
						this.timeoutTimer = null;
					}
					return new Promise<string>((res) => {
						if (options.onPrompt) {
							options.onPrompt(message, (val) => {
								if (this.isStopped) return res('');
								resetTimeout();
								res(String(val));
							});
						} else {
							resetTimeout();
							res('');
						}
					});
				};

				this.nodeIsStepMode = isStepMode;
				let nodeLatestVariables: Record<string, { value: unknown; type: string }> = {};

				const stepFn = async (line: number, rawVars: Record<string, unknown>) => {
					if (this.isStopped) return;
					const formatted: Record<string, { value: unknown; type: string }> = {};
					for (const k of Object.keys(rawVars)) {
						formatted[k] = formatVar(rawVars[k]);
					}
					nodeLatestVariables = formatted;
					if (this.nodeIsStepMode && line > 0) {
						if (this.timeoutTimer) {
							clearTimeout(this.timeoutTimer);
							this.timeoutTimer = null;
						}
						options.onStep?.(line, formatted);
						await new Promise<void>((res) => {
							this.nodeStepResolver = res;
						});
						resetTimeout();
					} else if (line === 0) {
						options.onVariables?.(formatted);
					}
				};

				const recordFn = (rawVars: Record<string, unknown>) => {
					for (const k of Object.keys(rawVars)) {
						nodeLatestVariables[k] = formatVar(rawVars[k]);
					}
				};

				const userFn = new AsyncFunction(
					'__crocode_prompt',
					'prompt',
					'__crocode_step',
					'__crocode_record_vars',
					transformed
				);
				userFn(promptFn, promptFn, stepFn, recordFn)
					.then((result: unknown) => {
						restoreConsole();
						if (result !== undefined) {
							const text = `<- ${formatArg(result)}`;
							handleOutput(text);
						}
						options.onVariables?.(nodeLatestVariables);
						finish({ outputs: capturedOutputs, error: null, variables: nodeLatestVariables });
					})
					.catch((err: unknown) => {
						restoreConsole();
						const formatted = formatJsExecutionError(err, code);
						finish({ outputs: capturedOutputs, error: formatted });
					});
			} catch (err: unknown) {
				restoreConsole();
				const formatted = formatJsExecutionError(err, code);
				finish({ outputs: capturedOutputs, error: formatted });
			}
		});
	}
}
