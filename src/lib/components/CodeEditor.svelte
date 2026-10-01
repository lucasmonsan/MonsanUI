<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		EditorView,
		keymap,
		lineNumbers,
		gutter,
		GutterMarker,
		Decoration,
		ViewPlugin,
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
		type Transaction,
		EditorSelection
	} from '@codemirror/state';
	import { history, historyKeymap, indentWithTab, defaultKeymap } from '@codemirror/commands';
	import {
		indentUnit,
		syntaxHighlighting,
		HighlightStyle,
		StreamLanguage,
		StringStream,
		foldKeymap,
		foldService,
		foldEffect,
		unfoldEffect,
		foldedRanges,
		codeFolding,
		syntaxTree
	} from '@codemirror/language';
	import { javascript } from '@codemirror/lang-javascript';
	import { tags as t } from '@lezer/highlight';
	import {
		getPortugolEditorIndentColumns,
		getPortugolNextLineIndent,
		getPortugolPairEdit,
		getPortugolStructureGuides,
		PORTUGOL_EDITOR_CARET_COLOR
	} from '../utils/portugol/editor.js';

	export interface CodeEditorProps {
		code: string;
		language?: 'portugol' | 'javascript';
		activeLine?: number;
		followActiveLine?: boolean;
		errorLine?: number;
		disabled?: boolean;
		showLineNumbers?: boolean;
		placeholder?: string;
		autoCloseBrackets?: boolean;
		autoCloseQuotes?: boolean;
		lineWrapping?: boolean;
		onsave?: (isShortcut?: boolean) => void;
		height?: string;
	}

	let {
		code = $bindable(''),
		language = 'portugol',
		activeLine = 0,
		followActiveLine = false,
		errorLine = 0,
		disabled = false,
		showLineNumbers = true,
		placeholder = '',
		autoCloseBrackets = true,
		autoCloseQuotes = true,
		lineWrapping = true,
		onsave,
		height = '100%'
	}: CodeEditorProps = $props();

	let editorContainer = $state<HTMLDivElement | null>(null);
	let view = $state<EditorView | null>(null);
	let structureGuideFrame: number | null = null;
	let structureGuidePaths = $state<Array<{ key: string; d: string }>>([]);
	let structureGuideOverlaySize = $state({ width: 0, height: 0 });

	const readOnlyCompartment = new Compartment();
	const lineNumbersCompartment = new Compartment();
	const lineWrappingCompartment = new Compartment();
	const languageCompartment = new Compartment();
	const placeholderCompartment = new Compartment();

	const portugolFoldRanges = new WeakMap<
		EditorState['doc'],
		Map<number, { from: number; to: number }>
	>();

	const highlightEffect = StateEffect.define<{ activeLine: number; errorLine: number }>();

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

	class FoldMarker extends GutterMarker {
		private readonly folded: boolean;

		constructor(folded: boolean) {
			super();
			this.folded = folded;
		}

		eq(other: FoldMarker) {
			return other.folded === this.folded;
		}

		toDOM() {
			const span = document.createElement('span');
			span.className = 'portugol-fold-indicator';
			const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			icon.setAttribute('viewBox', '0 0 12 12');
			icon.setAttribute('aria-hidden', 'true');
			icon.setAttribute('focusable', 'false');
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', this.folded ? 'M 4 2 L 8 6 L 4 10' : 'M 2 4 L 6 8 L 10 4');
			path.setAttribute('fill', 'none');
			path.setAttribute('stroke', 'currentColor');
			path.setAttribute('stroke-linecap', 'round');
			path.setAttribute('stroke-linejoin', 'round');
			path.setAttribute('stroke-width', '1.5');
			icon.append(path);
			span.append(icon);
			return span;
		}
	}

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

	const indicatorGutter = gutter({
		class: 'cm-indicator-gutter',
		markers(v: EditorView) {
			return v.state.field(lineMarkersField);
		},
		lineMarker(editorView, line, markers) {
			const range = getPortugolFoldRange(editorView.state, line.from);
			if (
				!range ||
				markers.some(
					(marker) => marker instanceof ActiveLineMarker || marker instanceof ErrorLineMarker
				)
			) {
				return null;
			}
			return new FoldMarker(isPortugolFolded(editorView.state, range));
		},
		lineMarkerChange(update) {
			return foldedRanges(update.startState) !== foldedRanges(update.state);
		},
		initialSpacer: () => new FoldMarker(false),
		domEventHandlers: {
			click(editorView, line) {
				const range = getPortugolFoldRange(editorView.state, line.from);
				if (!range) return false;

				editorView.dispatch({
					effects: isPortugolFolded(editorView.state, range)
						? unfoldEffect.of(range)
						: foldEffect.of(range)
				});
				return true;
			}
		}
	});

	function getGutterExtensions() {
		return showLineNumbers ? [lineNumbers(), indicatorGutter] : [];
	}

	function getPortugolFoldRange(state: EditorState, lineStart: number) {
		const cached = portugolFoldRanges.get(state.doc)?.get(lineStart);
		if (cached) return cached;

		const startLine = state.doc.lineAt(lineStart);
		const startText = startLine.text.trim().toLowerCase();
		let targetCloser: RegExp | null = null;

		if (startText.startsWith('algoritmo')) {
			targetCloser = /^\s*fimalgoritmo\b/i;
		} else if (
			startText.startsWith('se ') ||
			/^(se\b|se\(|.*\bentao\b|.*\bentão\b)/i.test(startText)
		) {
			targetCloser = /^\s*fimse\b/i;
		} else if (
			startText.startsWith('enquanto ') ||
			/^(enquanto\b|.*\bfaca\b|.*\bfaça\b)/i.test(startText)
		) {
			targetCloser = /^\s*fimenquanto\b/i;
		} else if (
			startText.startsWith('para ') ||
			/^(para\b|.*\bfaca\b|.*\bfaça\b)/i.test(startText)
		) {
			targetCloser = /^\s*fimpara\b/i;
		} else if (startText.startsWith('escolha ') || /^\s*escolha\b/i.test(startText)) {
			targetCloser = /^\s*fimescolha\b/i;
		} else if (
			startText.startsWith('funcao') ||
			startText.startsWith('função') ||
			startText.startsWith('procedimento')
		) {
			targetCloser = /^\s*(fimfuncao|fimfunção|fimprocedimento)\b/i;
		}

		if (!targetCloser) return null;

		let depth = 1;
		for (let lineNum = startLine.number + 1; lineNum <= state.doc.lines; lineNum++) {
			const currentLine = state.doc.line(lineNum);
			const text = currentLine.text.trim().toLowerCase();

			if (startText.startsWith('algoritmo') && text.startsWith('algoritmo')) depth++;
			else if (startText.startsWith('se ') && text.startsWith('se ')) depth++;
			else if (startText.startsWith('enquanto ') && text.startsWith('enquanto ')) depth++;
			else if (startText.startsWith('para ') && text.startsWith('para ')) depth++;
			else if (startText.startsWith('escolha ') && text.startsWith('escolha ')) depth++;

			if (targetCloser.test(text)) {
				depth--;
				if (depth === 0) {
					const range = { from: startLine.to, to: currentLine.to };
					let map = portugolFoldRanges.get(state.doc);
					if (!map) {
						map = new SvelteMap();
						portugolFoldRanges.set(state.doc, map);
					}
					map.set(lineStart, range);
					return range;
				}
			}
		}

		return null;
	}

	function isPortugolFolded(state: EditorState, range: { from: number; to: number }) {
		let folded = false;
		foldedRanges(state).between(range.from, range.to, (from, to) => {
			if (from === range.from && to === range.to) {
				folded = true;
			}
		});
		return folded;
	}

	function createHiddenFoldPlaceholder() {
		const span = document.createElement('span');
		span.className = 'portugol-fold-placeholder';
		return span;
	}

	const portugolLanguage = StreamLanguage.define({
		token(stream: StringStream) {
			if (stream.eatSpace()) return null;

			if (stream.match('//')) {
				stream.skipToEnd();
				return 'comment';
			}

			if (stream.match(/^"[^"\\]*(?:\\.[^"\\]*)*"/)) return 'string';
			if (stream.match(/^'[^'\\]*(?:\\.[^'\\]*)*'/)) return 'string';

			if (stream.match(/^\d+(?:\.\d+)?/)) return 'number';

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
					'numpcarac'
				]);
				if (keywords.has(word)) return 'keyword';
				return 'variableName';
			}

			if (stream.match(/^(<-|:=|<=|>=|<>|!=|==|\+|-|\*|\/|=|<|>)/)) {
				return 'operator';
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

	const codeHighlightStyle = HighlightStyle.define([
		{ tag: t.keyword, color: 'var(--accent-primary)', fontWeight: 'bold' },
		{ tag: t.string, color: 'var(--success)' },
		{ tag: t.number, color: 'var(--warning)' },
		{ tag: t.comment, color: 'var(--text-secondary)', fontStyle: 'italic' },
		{ tag: t.variableName, color: 'var(--text-primary)' },
		{ tag: t.function(t.variableName), color: 'var(--accent-primary)' },
		{ tag: t.propertyName, color: 'var(--text-primary)' },
		{ tag: t.operator, color: 'var(--text-secondary)' },
		{ tag: t.bool, color: 'var(--warning)', fontWeight: 'bold' }
	]);

	function insertIndentedNewline(editorView: EditorView) {
		if (language === 'javascript') {
			return false; // CodeMirror handles default indent for JS
		}
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

	function handleClosingChar(editorView: EditorView, char: string) {
		if (!autoCloseBrackets && !autoCloseQuotes) return false;
		const range = editorView.state.selection.main;
		const nextChar = editorView.state.sliceDoc(range.to, range.to + 1);
		if (range.empty && nextChar === char) {
			editorView.dispatch({
				selection: EditorSelection.cursor(range.to + 1),
				scrollIntoView: true,
				userEvent: 'select'
			});
			return true;
		}
		return false;
	}

	const jsBuiltinKeywordDeco = Decoration.mark({ class: 'cm-js-builtin-keyword' });
	const jsBuiltinMethodDeco = Decoration.mark({ class: 'cm-js-builtin-method' });

	const jsBuiltinKeywords = new Set([
		'console',
		'prompt',
		'alert',
		'confirm',
		'Math',
		'Number',
		'String',
		'Boolean',
		'parseInt',
		'parseFloat',
		'Array',
		'Object',
		'NaN',
		'Infinity'
	]);

	const jsBuiltinMethods = new Set([
		'log',
		'warn',
		'error',
		'info',
		'clear',
		'floor',
		'round',
		'ceil',
		'abs',
		'random',
		'sqrt',
		'pow',
		'min',
		'max',
		'trunc'
	]);

	function buildJsBuiltinsDecorations(view: EditorView): RangeSet<Decoration> {
		const builder = new RangeSetBuilder<Decoration>();
		const tree = syntaxTree(view.state);
		const ranges =
			view.visibleRanges.length > 0 ? view.visibleRanges : [{ from: 0, to: view.state.doc.length }];
		for (const { from, to } of ranges) {
			tree.iterate({
				from,
				to,
				enter: (node) => {
					if (node.name === 'VariableName') {
						const text = view.state.sliceDoc(node.from, node.to);
						if (jsBuiltinKeywords.has(text)) {
							builder.add(node.from, node.to, jsBuiltinKeywordDeco);
						}
					} else if (node.name === 'PropertyName') {
						const text = view.state.sliceDoc(node.from, node.to);
						if (jsBuiltinMethods.has(text)) {
							builder.add(node.from, node.to, jsBuiltinMethodDeco);
						}
					}
				}
			});
		}
		return builder.finish();
	}

	const jsBuiltinsHighlighter = ViewPlugin.fromClass(
		class {
			decorations: RangeSet<Decoration>;
			constructor(view: EditorView) {
				this.decorations = buildJsBuiltinsDecorations(view);
			}
			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					this.decorations = buildJsBuiltinsDecorations(update.view);
				}
			}
		},
		{
			decorations: (v) => v.decorations
		}
	);

	function getLanguageExtension(lang: 'portugol' | 'javascript') {
		if (lang === 'javascript') {
			return [javascript(), jsBuiltinsHighlighter];
		}
		return [
			portugolLanguage,
			foldService.of((state, lineStart) => getPortugolFoldRange(state, lineStart))
		];
	}

	function getEffectivePlaceholder() {
		if (placeholder) return placeholder;
		return language === 'javascript'
			? '// Escreva seu código JavaScript aqui...'
			: 'Escreva seu código Portugol aqui...';
	}

	const codeEditorTheme = EditorView.theme(
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
				scrollbarWidth: 'none',
				caretColor: PORTUGOL_EDITOR_CARET_COLOR
			},
			'& .cm-scroller::-webkit-scrollbar': {
				display: 'none'
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
			'.cm-indicator-gutter .cm-gutterElement': {
				position: 'relative',
				width: '16px'
			},
			'.cm-indicator-gutter .portugol-fold-indicator': {
				position: 'absolute',
				left: '0',
				top: 'calc((1em - 10px) / 2)',
				width: '10px',
				height: '10px',
				color: 'var(--text-secondary)',
				cursor: 'pointer'
			},
			'.cm-indicator-gutter .portugol-fold-indicator svg': {
				display: 'block',
				width: '10px',
				height: '10px',
				overflow: 'visible'
			},
			'.cm-indicator-gutter .active-indicator, .cm-indicator-gutter .error-indicator': {
				position: 'absolute',
				right: '0'
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
			},
			'.cm-js-builtin-keyword': {
				color: 'var(--accent-primary)',
				fontWeight: 'bold'
			},
			'.cm-js-builtin-method': {
				color: 'var(--accent-primary)',
				fontWeight: '600'
			}
		},
		{ dark: false }
	);

	function renderStructureGuides() {
		if (!view || language !== 'portugol') {
			structureGuidePaths = [];
			return;
		}

		const scroller = view.scrollDOM;
		const scrollerRect = scroller.getBoundingClientRect();
		structureGuideOverlaySize = {
			width: Math.max(scroller.scrollWidth, scroller.clientWidth),
			height: Math.max(scroller.scrollHeight, scroller.clientHeight)
		};

		const guides = getPortugolStructureGuides(view.state.doc.toString());
		const nextPaths: Array<{ key: string; d: string }> = [];

		for (const guide of guides) {
			try {
				const startLine = view.state.doc.line(guide.startLine);
				const endLine = view.state.doc.line(guide.endLine);
				const startCoords = view.coordsAtPos(startLine.from);
				const endCoords = view.coordsAtPos(endLine.from);
				if (!startCoords || !endCoords) continue;

				const charWidth = 8.4;
				const indentX =
					startCoords.left -
					scrollerRect.left +
					scroller.scrollLeft +
					guide.indentColumns * charWidth +
					4;
				const startY = startCoords.bottom - scrollerRect.top + scroller.scrollTop;
				const endY = endCoords.top - scrollerRect.top + scroller.scrollTop;

				if (endY > startY + 4) {
					nextPaths.push({
						key: `${guide.startLine}:${guide.endLine}:${guide.indentColumns}`,
						d: `M ${indentX} ${startY} L ${indentX} ${endY}`
					});
				}
			} catch {
				// Ignore coordinates error during rapid editing
			}
		}

		structureGuidePaths = nextPaths;
	}

	function queueStructureGuideRender() {
		if (structureGuideFrame !== null) {
			window.cancelAnimationFrame(structureGuideFrame);
		}
		if (typeof window !== 'undefined') {
			structureGuideFrame = window.requestAnimationFrame(() => {
				structureGuideFrame = null;
				renderStructureGuides();
			});
		}
	}

	onMount(() => {
		if (editorContainer) {
			const state = EditorState.create({
				doc: code,
				extensions: [
					codeEditorTheme,
					syntaxHighlighting(codeHighlightStyle),
					languageCompartment.of(getLanguageExtension(language)),
					codeFolding({ placeholderDOM: createHiddenFoldPlaceholder }),
					placeholderCompartment.of(cmPlaceholder(getEffectivePlaceholder())),
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
							key: "'",
							run: (editorView) => {
								if (!autoCloseQuotes) return false;
								return insertEditorPair(editorView, "'");
							}
						},
						{
							key: '`',
							run: (editorView) => {
								if (!autoCloseQuotes || language !== 'javascript') return false;
								return insertEditorPair(editorView, '`');
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
							run: (editorView) => handleClosingChar(editorView, ')')
						},
						{
							key: '{',
							run: (editorView) => {
								if (!autoCloseBrackets) return false;
								return insertEditorPair(editorView, '{', '}', false);
							}
						},
						{
							key: '}',
							run: (editorView) => handleClosingChar(editorView, '}')
						},
						{
							key: '[',
							run: (editorView) => {
								if (!autoCloseBrackets) return false;
								return insertEditorPair(editorView, '[', ']', false);
							}
						},
						{
							key: ']',
							run: (editorView) => handleClosingChar(editorView, ']')
						},
						{
							key: 'Mod-d',
							run(editorView) {
								const changes = [];
								for (const range of editorView.state.selection.ranges) {
									const line = editorView.state.doc.lineAt(range.head);
									changes.push({
										from: line.to,
										insert: '\n' + line.text
									});
								}
								editorView.dispatch({
									changes,
									scrollIntoView: true
								});
								return true;
							}
						},
						...defaultKeymap,
						...historyKeymap,
						...foldKeymap,
						indentWithTab
					]),
					indentUnit.of('\t'),
					EditorView.editorAttributes.of({
						class: 'notranslate',
						translate: 'no',
						spellcheck: 'false',
						autocorrect: 'off',
						autocapitalize: 'off'
					}),
					EditorView.contentAttributes.of({
						class: 'notranslate',
						translate: 'no',
						spellcheck: 'false',
						autocorrect: 'off',
						autocapitalize: 'off'
					}),
					lineWrappingCompartment.of(lineWrapping ? EditorView.lineWrapping : []),
					EditorView.updateListener.of((update: ViewUpdate) => {
						if (update.docChanged) {
							code = update.state.doc.toString();
						}
						if (update.docChanged || update.viewportChanged || update.geometryChanged) {
							queueStructureGuideRender();
						}
					}),
					readOnlyCompartment.of(EditorState.readOnly.of(disabled))
				]
			});

			view = new EditorView({
				state,
				parent: editorContainer
			});

			view.dispatch({
				effects: highlightEffect.of({ activeLine, errorLine })
			});
			view.scrollDOM.addEventListener('scroll', queueStructureGuideRender);
			queueStructureGuideRender();
		}
	});

	onDestroy(() => {
		if (structureGuideFrame !== null) {
			window.cancelAnimationFrame(structureGuideFrame);
		}
		view?.scrollDOM.removeEventListener('scroll', queueStructureGuideRender);
		if (view) {
			view.destroy();
		}
	});

	$effect(() => {
		if (view && code !== view.state.doc.toString()) {
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: code }
			});
		}
	});

	$effect(() => {
		if (view) {
			view.dispatch({
				effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(disabled))
			});
		}
	});

	$effect(() => {
		if (view) {
			view.dispatch({
				effects: languageCompartment.reconfigure(getLanguageExtension(language))
			});
			queueStructureGuideRender();
		}
	});

	$effect(() => {
		if (view) {
			view.dispatch({
				effects: placeholderCompartment.reconfigure(cmPlaceholder(getEffectivePlaceholder()))
			});
		}
	});

	$effect(() => {
		if (view) {
			view.dispatch({
				effects: lineNumbersCompartment.reconfigure(getGutterExtensions())
			});
		}
	});

	$effect(() => {
		if (view) {
			view.dispatch({
				effects: lineWrappingCompartment.reconfigure(lineWrapping ? EditorView.lineWrapping : [])
			});
		}
	});

	$effect(() => {
		if (view) {
			const effects: Array<StateEffect<unknown>> = [highlightEffect.of({ activeLine, errorLine })];

			if (followActiveLine && activeLine > 0) {
				try {
					const position = view.state.doc.line(activeLine).from;
					effects.push(EditorView.scrollIntoView(position, { y: 'center' }));
				} catch {
					// Ignora se a linha estiver fora dos limites do documento
				}
			}

			view.dispatch({
				effects
			});
		}
	});
</script>

<div class="portugol-editor-container notranslate" class:disabled style:height translate="no">
	<div class="editor-wrapper notranslate" bind:this={editorContainer} translate="no">
		{#if language === 'portugol'}
			<svg
				class="portugol-structure-overlay"
				aria-hidden="true"
				viewBox={`0 0 ${structureGuideOverlaySize.width} ${structureGuideOverlaySize.height}`}
			>
				{#each structureGuidePaths as path (path.key)}
					<path class="portugol-structure-guide-path" d={path.d}></path>
				{/each}
			</svg>
		{/if}
	</div>
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
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 0;
		overflow: hidden;
	}

	:global(.cm-editor) {
		height: 100%;
	}

	.portugol-structure-overlay {
		position: absolute;
		inset: 0;
		z-index: 4;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: visible;
	}

	:global(.portugol-structure-guide-path) {
		fill: none;
		stroke: var(--accent-primary);
		stroke: color-mix(in srgb, var(--accent-primary) 64%, transparent);
		stroke-linecap: round;
		stroke-width: 1.5;
	}
</style>
