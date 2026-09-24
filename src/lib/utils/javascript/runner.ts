export interface JavaScriptRunOptions {
	timeoutMs?: number;
	onOutput?: (text: string) => void;
	onSuccess?: () => void;
	onError?: (error: { message: string; line?: number }) => void;
}

export interface JavaScriptRunResult {
	outputs: string[];
	error: { message: string; line?: number } | null;
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

export function extractJsErrorLine(error: unknown, sourceCode: string): number {
	if (!error) return 0;
	const err = error as { stack?: string; message?: string; lineNumber?: number; line?: number };
	if (typeof err.lineNumber === 'number' && err.lineNumber > 0) return err.lineNumber;
	if (typeof err.line === 'number' && err.line > 0) return err.line;

	if (err.stack) {
		// Look for patterns like eval at <anonymous>:line:col or <anonymous>:line:col or blob:...:line:col
		const matches = Array.from(err.stack.matchAll(/(?:<anonymous>|blob:[^:]+):(\d+)(?::(\d+))?/gi));
		for (const match of matches) {
			const rawLine = parseInt(match[1], 10);
			if (!isNaN(rawLine) && rawLine > 0) {
				// AsyncFunction wrapper adds 1-2 lines of header. If rawLine <= total lines in code, use it.
				const totalLines = sourceCode.split('\n').length;
				if (rawLine <= totalLines) {
					return rawLine;
				}
				if (rawLine - 2 >= 1 && rawLine - 2 <= totalLines) {
					return rawLine - 2;
				}
			}
		}
	}
	return 0;
}

export function formatJsExecutionError(
	error: unknown,
	sourceCode: string
): { message: string; line: number } {
	const rawMessage = error instanceof Error ? error.message : String(error);
	const line = extractJsErrorLine(error, sourceCode);
	const cleanMessage = rawMessage.replace(/^Error:\s*/, '').trim();
	const displayMessage = line > 0 ? `Linha ${line}: ${cleanMessage}` : cleanMessage;

	return {
		message: displayMessage,
		line
	};
}

/**
 * Worker script content for sandboxed execution in the browser.
 */
const WORKER_SCRIPT = `
self.onmessage = async (e) => {
	const { id, code } = e.data;

	function formatArg(arg) {
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

	console.log = (...args) => {
		self.postMessage({ id, type: 'output', text: args.map(formatArg).join(' ') });
	};
	console.info = (...args) => {
		self.postMessage({ id, type: 'output', text: args.map(formatArg).join(' ') });
	};
	console.warn = (...args) => {
		self.postMessage({ id, type: 'output', text: '[AVISO] ' + args.map(formatArg).join(' ') });
	};
	console.error = (...args) => {
		self.postMessage({ id, type: 'output', text: '[ERRO] ' + args.map(formatArg).join(' ') });
	};

	try {
		const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
		const userFn = new AsyncFunction(code);
		const result = await userFn();
		if (result !== undefined) {
			self.postMessage({ id, type: 'output', text: '<- ' + formatArg(result) });
		}
		self.postMessage({ id, type: 'done' });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		let line = 0;
		if (err && err.stack) {
			const matches = Array.from(err.stack.matchAll(/(?:<anonymous>|blob:[^:]+):(\\d+)(?::(\\d+))?/gi));
			if (matches.length > 0) {
				const raw = parseInt(matches[0][1], 10);
				if (!isNaN(raw) && raw > 2) {
					line = raw - 2;
				} else if (!isNaN(raw) && raw >= 1) {
					line = raw;
				}
			}
		}
		self.postMessage({ id, type: 'error', message, line });
	}
};
`;

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
		if (this.onStopSettler) {
			const settler = this.onStopSettler;
			this.onStopSettler = null;
			settler({ outputs: [], error: null, stopped: true });
		}
	}

	async run(code: string, options: JavaScriptRunOptions = {}): Promise<JavaScriptRunResult> {
		this.stop();
		this.isStopped = false;
		const runId = ++this.activeRunId;
		const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
		const outputs: string[] = [];

		return new Promise<JavaScriptRunResult>((resolve) => {
			let settled = false;

			const finish = (result: JavaScriptRunResult) => {
				if (settled) return;
				settled = true;
				this.onStopSettler = null;
				this.stop();
				if (result.error) {
					options.onError?.(result.error);
				} else if (!result.stopped) {
					options.onSuccess?.();
				}
				resolve(result);
			};

			this.onStopSettler = finish;

			const handleOutput = (text: string) => {
				if (this.isStopped || settled) return;
				outputs.push(text);
				options.onOutput?.(text);
			};

			// Handle browser Web Worker execution
			if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
				try {
					const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
					this.workerUrl = URL.createObjectURL(blob);
					this.worker = new Worker(this.workerUrl);

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

					this.worker.onmessage = (e: MessageEvent) => {
						if (this.isStopped || settled || e.data.id !== runId) return;
						const data = e.data;
						if (data.type === 'output') {
							handleOutput(data.text);
						} else if (data.type === 'done') {
							finish({ outputs, error: null });
						} else if (data.type === 'error') {
							const formatted = formatJsExecutionError(data.message, code);
							if (data.line && data.line > 0) {
								formatted.line = data.line;
								formatted.message = `Linha ${data.line}: ${data.message.replace(/^Error:\s*/, '')}`;
							}
							finish({ outputs, error: formatted });
						}
					};

					this.worker.onerror = (err: ErrorEvent) => {
						if (this.isStopped || settled) return;
						const formatted = formatJsExecutionError(err.error || err.message, code);
						finish({ outputs, error: formatted });
					};

					this.worker.postMessage({ id: runId, code });
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

			const restoreConsole = () => {
				console.log = origLog;
				console.warn = origWarn;
				console.error = origError;
				console.info = origInfo;
			};

			try {
				const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
				const userFn = new AsyncFunction(code);
				Promise.race([
					userFn(),
					new Promise((_, reject) =>
						setTimeout(
							() =>
								reject(
									new Error(
										`Tempo limite de execução excedido (${(timeoutMs / 1000).toFixed(0)}s). Possível loop infinito.`
									)
								),
							timeoutMs
						)
					)
				])
					.then((result) => {
						restoreConsole();
						if (result !== undefined) {
							const text = `<- ${formatArg(result)}`;
							handleOutput(text);
						}
						finish({ outputs: capturedOutputs, error: null });
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
