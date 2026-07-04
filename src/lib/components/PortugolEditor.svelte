<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		EditorView,
		keymap,
		lineNumbers,
		gutter,
		GutterMarker,
		Decoration,
		placeholder as cmPlaceholder,
		ViewUpdate,
		highlightActiveLine
	} from '@codemirror/view';
	import {
		EditorState,
		StateEffect,
		StateField,
		RangeSet,
		RangeSetBuilder,
		Compartment,
		Transaction,
		EditorSelection
	} from '@codemirror/state';
	import { history, historyKeymap, indentWithTab, defaultKeymap } from '@codemirror/commands';
	import {
		indentUnit,
		syntaxHighlighting,
		HighlightStyle,
		StreamLanguage,
		StringStream
	} from '@codemirror/language';
	import { tags as t } from '@lezer/highlight';
	import {
		getPortugolEditorIndentColumns,
		getPortugolNextLineIndent,
		getPortugolPairEdit,
		PORTUGOL_EDITOR_CARET_COLOR
	} from '../utils/portugol/editor.js';

	let {
		code = $bindable(''),
		activeLine = 0,
		errorLine = 0,
		disabled = false,
		showLineNumbers = true,
		placeholder = 'Escreva seu código Portugol aqui...',
		autoCloseBrackets = true,
		autoCloseQuotes = true,
		lineWrapping = true,
		onsave
	} = $props<{
		code: string;
		activeLine?: number;
		errorLine?: number;
		disabled?: boolean;
		showLineNumbers?: boolean;
		placeholder?: string;
		autoCloseBrackets?: boolean;
		autoCloseQuotes?: boolean;
		lineWrapping?: boolean;
		onsave?: (isShortcut?: boolean) => void;
	}>();

	let editorContainer = $state<HTMLDivElement | null>(null);
	let view = $state<EditorView | null>(null);

	// Compartment to allow dynamic read-only toggling
	const readOnlyCompartment = new Compartment();
	const lineNumbersCompartment = new Compartment();
	const lineWrappingCompartment = new Compartment();

	// Effect to dispatch active line / error line highlights
	const highlightEffect = StateEffect.define<{ activeLine: number; errorLine: number }>();

	// Markers for gutter indicators
	class ActiveLineMarker extends GutterMarker {
		toDOM() {
			const span = document.createElement('span');
			span.className = 'active-indicator';
			span.textContent = '▶';
			span.style.color = 'var(--warning)';
			span.style.fontSize = '10px';
			span.style.fontWeight = 'bold';
			return span;
		}
	}

	class ErrorLineMarker extends GutterMarker {
		toDOM() {
			const span = document.createElement('span');
			span.className = 'error-indicator';
			span.textContent = '❌';
			span.style.color = 'var(--error)';
			span.style.fontSize = '10px';
			span.style.fontWeight = 'bold';
			return span;
		}
	}

	// State field to store gutter markers
	const lineMarkersField = StateField.define<RangeSet<GutterMarker>>({
		create() {
			return RangeSet.empty;
		},
		update(markers: RangeSet<GutterMarker>, tr: Transaction) {
			markers = markers.map(tr.changes);
			for (const e of tr.effects) {
				if (e.is(highlightEffect)) {
					const { activeLine: act, errorLine: err } = e.value;
					const builder = new RangeSetBuilder<GutterMarker>();

					if (err > 0) {
						try {
							const pos = tr.state.doc.line(err).from;
							builder.add(pos, pos, new ErrorLineMarker());
						} catch {
							// Ignora se a linha estiver fora dos limites do documento
						}
					}
					if (act > 0 && act !== err) {
						try {
							const pos = tr.state.doc.line(act).from;
							builder.add(pos, pos, new ActiveLineMarker());
						} catch {
							// Ignora se a linha estiver fora dos limites do documento
						}
					}
					return builder.finish();
				}
			}
			return markers;
		}
	});

	// State field to store line highlighting decorations
	const lineHighlightField = StateField.define<RangeSet<Decoration>>({
		create() {
			return Decoration.none;
		},
		update(decorations: RangeSet<Decoration>, tr: Transaction) {
			decorations = decorations.map(tr.changes);
			for (const e of tr.effects) {
				if (e.is(highlightEffect)) {
					const { activeLine: act, errorLine: err } = e.value;
					const builder = new RangeSetBuilder<Decoration>();

					if (err > 0) {
						try {
							const pos = tr.state.doc.line(err).from;
							builder.add(pos, pos, Decoration.line({ attributes: { class: 'cm-error-line' } }));
						} catch {
							// Ignora se a linha estiver fora dos limites do documento
						}
					}
					if (act > 0 && act !== err) {
						try {
							const pos = tr.state.doc.line(act).from;
							builder.add(pos, pos, Decoration.line({ attributes: { class: 'cm-active-line' } }));
						} catch {
							// Ignora se a linha estiver fora dos limites do documento
						}
					}
					return builder.finish();
				}
			}
			return decorations;
		},
		provide: (f: StateField<RangeSet<Decoration>>) => EditorView.decorations.from(f)
	});

	// Custom indicator gutter
	const indicatorGutter = gutter({
		class: 'cm-indicator-gutter',
		markers(v: EditorView) {
			return v.state.field(lineMarkersField);
		},
		initialSpacer: () => new ActiveLineMarker()
	});

	function getGutterExtensions() {
		return showLineNumbers ? [lineNumbers(), indicatorGutter] : [];
	}

	// Custom Portugol language syntax highlighter
	const portugolLanguage = StreamLanguage.define({
		token(stream: StringStream) {
			if (stream.eatSpace()) return null;

			// Comments
			if (stream.match('//')) {
				stream.skipToEnd();
				return 'comment';
			}

			// Strings
			if (stream.match(/^"[^"\\]*(?:\\.[^"\\]*)*"/)) return 'string';
			if (stream.match(/^'[^'\\]*(?:\\.[^'\\]*)*'/)) return 'string';

			// Numbers
			if (stream.match(/^\d+(?:\.\d+)?/)) return 'number';

			// Identifiers and Keywords
			if (
				stream.match(
					/^[a-zA-Z_áéíóúçãõâêîôûA-ZÁÉÍÓÚÇÃÕÂÊÎÔÛ][a-zA-Z0-9_áéíóúçãõâêîôûA-ZÁÉÍÓÚÇÃÕÂÊÎÔÛ]*/
				)
			) {
				const word = stream.current().toLowerCase();
				const keywords = new Set([
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
					'interrompa',
					'verdadeiro',
					'falso',
					'e',
					'ou',
					'xou',
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
					'repita',
					'escolha',
					'caso',
					'outrocaso',
					'fimescolha',
					'de',
					'ate',
					'até',
					'passo',
					'escreva',
					'escreval',
					'leia',
					'limpa',
					'limpatela',
					'mod',
					'div',
					'pi',
					'abs',
					'raizq',
					'pot',
					'quad',
					'int',
					'compr',
					'maiusc',
					'minusc',
					'copia',
					'pos',
					'asc',
					'carac',
					'numpcarac',
					'caracpnum',
					'rand',
					'randi',
					'log',
					'exp',
					'sen',
					'cos',
					'tan',
					'cotan',
					'arcsen',
					'arccos'
				]);
				if (keywords.has(word)) {
					return 'keyword';
				}
				return 'variableName';
			}

			stream.next();
			return null;
		},
		indent(_state: unknown, textAfter: string, cx: { state: EditorState }) {
			const doc = cx.state.doc;
			const pos = cx.state.selection.main.head;
			const line = doc.lineAt(pos);
			if (line.number <= 1) return 0;

			const prevLine = doc.line(line.number - 1);
			return getPortugolEditorIndentColumns(prevLine.text, textAfter);
		}
	});

	// Custom highlight theme styles matching MonsanUI tokens
	const portugolHighlightStyle = HighlightStyle.define([
		{ tag: t.keyword, color: 'var(--accent-primary)', fontWeight: 'bold' },
		{ tag: t.string, color: 'var(--success)' },
		{ tag: t.number, color: 'var(--warning)' },
		{ tag: t.comment, color: 'var(--text-secondary)', fontStyle: 'italic' },
		{ tag: t.variableName, color: 'var(--text-primary)' }
	]);

	function insertIndentedNewline(editorView: EditorView) {
		const range = editorView.state.selection.main;
		const line = editorView.state.doc.lineAt(range.from);
		const textBeforeCursor = editorView.state.sliceDoc(line.from, range.from);
		const indentSource = textBeforeCursor.trim() ? textBeforeCursor : line.text;
		const insert = `\n${getPortugolNextLineIndent(indentSource)}`;
		const cursor = range.from + insert.length;

		editorView.dispatch({
			changes: { from: range.from, to: range.to, insert },
			selection: EditorSelection.cursor(cursor),
			scrollIntoView: true,
			userEvent: 'input'
		});
		return true;
	}

	function insertEditorPair(
		editorView: EditorView,
		opening: string,
		closing = opening,
		skipClosing = opening === closing
	) {
		const range = editorView.state.selection.main;
		const selectedText = editorView.state.sliceDoc(range.from, range.to);
		const nextChar = editorView.state.sliceDoc(range.to, range.to + 1);
		const edit = getPortugolPairEdit(selectedText, nextChar, opening, closing, skipClosing);

		if (!edit.insert) {
			editorView.dispatch({
				selection: EditorSelection.cursor(range.to + edit.selectionStartOffset),
				scrollIntoView: true,
				userEvent: 'select'
			});
			return true;
		}

		const selectionStart = range.from + edit.selectionStartOffset;
		const selectionEnd = range.from + edit.selectionEndOffset;

		editorView.dispatch({
			changes: { from: range.from, to: range.to, insert: edit.insert },
			selection:
				selectionStart === selectionEnd
					? EditorSelection.cursor(selectionStart)
					: EditorSelection.range(selectionStart, selectionEnd),
			scrollIntoView: true,
			userEvent: 'input'
		});
		return true;
	}

	// Theme for CodeMirror container layout and design styles
	const portugolTheme = EditorView.theme(
		{
			'&': {
				height: '100%',
				fontFamily: 'var(--font-mono)',
				fontSize: 'var(--runner-font-size, 14px)',
				backgroundColor: 'var(--bg-primary)',
				color: 'var(--text-primary)',
				caretColor: PORTUGOL_EDITOR_CARET_COLOR
			},
			'.cm-scroller': {
				fontFamily: 'inherit',
				overflow: 'auto',
				caretColor: PORTUGOL_EDITOR_CARET_COLOR
			},
			'.cm-content': {
				fontFamily: 'inherit',
				padding: '12px 0',
				caretColor: PORTUGOL_EDITOR_CARET_COLOR
			},
			'.cm-line': {
				caretColor: PORTUGOL_EDITOR_CARET_COLOR
			},
			'.cm-gutters': {
				backgroundColor: 'var(--bg-secondary)',
				color: 'var(--text-secondary)',
				borderRight: 'var(--border-width) solid var(--border-color)',
				borderLeft: 'none',
				fontFamily: 'inherit',
				userSelect: 'none'
			},
			'.cm-gutter': {
				minWidth: '24px'
			},
			'.cm-indicator-gutter': {
				minWidth: '16px',
				paddingLeft: '4px'
			},
			'.cm-activeLine': {
				backgroundColor: 'rgba(224, 123, 57, 0.06) !important'
			},
			'.cm-active-line': {
				backgroundColor: 'rgba(224, 123, 57, 0.08) !important'
			},
			'.cm-error-line': {
				backgroundColor: 'rgba(155, 34, 38, 0.08) !important'
			},
			'.cm-cursor, .cm-dropCursor, .cm-content .cm-cursor, &.cm-focused .cm-cursor': {
				borderLeftColor: `${PORTUGOL_EDITOR_CARET_COLOR} !important`
			}
		},
		{ dark: false }
	);

	onMount(() => {
		if (editorContainer) {
			const state = EditorState.create({
				doc: code,
				extensions: [
					portugolTheme,
					syntaxHighlighting(portugolHighlightStyle),
					portugolLanguage,
					cmPlaceholder(placeholder),
					lineNumbersCompartment.of(getGutterExtensions()),
					highlightActiveLine(),
					lineMarkersField,
					lineHighlightField,
					history(),
					keymap.of([
						{
							key: 'Mod-s',
							run() {
								if (onsave) {
									onsave(true);
									return true;
								}
								return false;
							}
						},
						{
							key: 'Enter',
							run: insertIndentedNewline
						},
						{
							key: '"',
							run: (editorView) => {
								if (!autoCloseQuotes) return false;
								return insertEditorPair(editorView, '"');
							}
						},
						{
							key: '(',
							run: (editorView) => {
								if (!autoCloseBrackets) return false;
								return insertEditorPair(editorView, '(', ')', false);
							}
						},
						{
							key: ')',
							run(editorView) {
								if (!autoCloseBrackets) return false;
								const range = editorView.state.selection.main;
								const nextChar = editorView.state.sliceDoc(range.to, range.to + 1);
								if (range.empty && nextChar === ')') {
									editorView.dispatch({
										selection: EditorSelection.cursor(range.to + 1),
										scrollIntoView: true,
										userEvent: 'select'
									});
									return true;
								}
								return false;
							}
						},
						{
							key: 'Mod-d',
							run(view) {
								let changes = [];
								for (let range of view.state.selection.ranges) {
									let line = view.state.doc.lineAt(range.head);
									changes.push({
										from: line.to,
										insert: '\n' + line.text
									});
								}
								view.dispatch({
									changes,
									scrollIntoView: true
								});
								return true;
							}
						},
						...defaultKeymap,
						...historyKeymap,
						indentWithTab
					]),
					indentUnit.of('\t'),
					lineWrappingCompartment.of(lineWrapping ? EditorView.lineWrapping : []),
					EditorView.updateListener.of((update: ViewUpdate) => {
						if (update.docChanged) {
							code = update.state.doc.toString();
						}
					}),
					readOnlyCompartment.of(EditorState.readOnly.of(disabled))
				]
			});

			view = new EditorView({
				state,
				parent: editorContainer
			});

			// Dispatch initial highlights
			view.dispatch({
				effects: highlightEffect.of({ activeLine, errorLine })
			});
		}
	});

	onDestroy(() => {
		if (view) {
			view.destroy();
		}
	});

	// Reactive update for code content
	$effect(() => {
		if (view && code !== view.state.doc.toString()) {
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: code }
			});
		}
	});

	// Reactive update for disabled (read-only) state
	$effect(() => {
		if (view) {
			view.dispatch({
				effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(disabled))
			});
		}
	});

	// Reactive update for line number visibility
	$effect(() => {
		if (view) {
			view.dispatch({
				effects: lineNumbersCompartment.reconfigure(getGutterExtensions())
			});
		}
	});

	// Reactive update for line wrapping
	$effect(() => {
		if (view) {
			view.dispatch({
				effects: lineWrappingCompartment.reconfigure(lineWrapping ? EditorView.lineWrapping : [])
			});
		}
	});

	// Reactive update for line indicators
	$effect(() => {
		if (view) {
			view.dispatch({
				effects: highlightEffect.of({ activeLine, errorLine })
			});
		}
	});
</script>

<div class="portugol-editor-container" class:disabled>
	<div class="editor-wrapper" bind:this={editorContainer}></div>
</div>

<style>
	.portugol-editor-container {
		display: flex;
		flex-direction: row;
		font-family: var(--font-mono);
		font-size: var(--runner-font-size, 14px);
		line-height: 1.45;
		background: var(--bg-primary);
		color: var(--text-primary);
		border: var(--border-width) solid var(--border-color);
		border-radius: var(--radius-lg);
		overflow: hidden;
		height: 100%;
		min-height: 0;
		position: relative;
	}

	.portugol-editor-container.disabled {
		opacity: 0.8;
	}

	.editor-wrapper {
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	:global(.cm-editor) {
		height: 100%;
	}
</style>
