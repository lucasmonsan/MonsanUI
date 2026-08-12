const BLOCK_OPENERS = [/\b(var|inicio|entao|então|faca|faça|repita|escolha|caso|outrocaso)\s*$/i];

const BLOCK_CLOSERS =
	/^\s*([})]|\b(fimse|fimenquanto|fimpara|fimescolha|fimalgoritmo|senao|senão|outrocaso)\b)/i;

export const PORTUGOL_EDITOR_CARET_COLOR = 'var(--text-primary)';

export interface PortugolPairEdit {
	insert: string;
	selectionStartOffset: number;
	selectionEndOffset: number;
}

export interface PortugolStructureGuide {
	startLine: number;
	endLine: number;
	indentColumns: number;
	indentOffset: number;
	type: 'algorithm' | 'if' | 'while' | 'for' | 'repeat' | 'switch';
}

type PortugolStructureType = PortugolStructureGuide['type'];

const STRUCTURE_OPENERS: Array<{
	pattern: RegExp;
	type: PortugolStructureType;
	closer: string;
}> = [
	{ pattern: /^algoritmo\b/i, type: 'algorithm', closer: 'fimalgoritmo' },
	{ pattern: /^se\b/i, type: 'if', closer: 'fimse' },
	{ pattern: /^enquanto\b/i, type: 'while', closer: 'fimenquanto' },
	{ pattern: /^para\b/i, type: 'for', closer: 'fimpara' },
	{ pattern: /^repita\b/i, type: 'repeat', closer: 'ate' },
	{ pattern: /^escolha\b/i, type: 'switch', closer: 'fimescolha' }
];

function stripPortugolStringsAndComments(line: string) {
	let value = '';
	let quote: '"' | "'" | null = null;
	let escaped = false;

	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];
		const next = line[index + 1];
		if (quote) {
			if (!escaped && char === quote) quote = null;
			escaped = !escaped && char === '\\';
			value += ' ';
			continue;
		}
		if (char === '/' && next === '/') break;
		if (char === '"' || char === "'") {
			quote = char;
			value += ' ';
			continue;
		}
		value += char;
	}

	return value.trim().toLocaleLowerCase('pt-BR');
}

function getPortugolLineIndentation(line: string) {
	const indent = line.match(/^[\t ]*/)?.[0] ?? '';
	return {
		columns: getPortugolIndentColumns(indent),
		offset: indent.length
	};
}

function isBranchLine(type: PortugolStructureType, content: string) {
	if (type === 'if') return /^(senao|senão)\b/i.test(content);
	if (type === 'switch') return /^(caso|outrocaso)\b/i.test(content);
	return false;
}

function isAlgorithmSection(content: string) {
	return /^(var|inicio)\b/i.test(content);
}

function hasConsistentStructureIndentation(
	lines: readonly string[],
	startLine: number,
	endLine: number,
	type: PortugolStructureType,
	indentColumns: number
) {
	const closingIndent = getPortugolLineIndentation(lines[endLine - 1]);
	if (closingIndent.columns !== indentColumns) return false;

	for (let lineNumber = startLine + 1; lineNumber < endLine; lineNumber += 1) {
		const content = stripPortugolStringsAndComments(lines[lineNumber - 1]);
		if (!content) continue;

		const indent = getPortugolLineIndentation(lines[lineNumber - 1]);
		if (type === 'algorithm' && isAlgorithmSection(content)) {
			if (indent.columns !== indentColumns) return false;
			continue;
		}
		if (type === 'if' && isBranchLine(type, content)) {
			if (indent.columns !== indentColumns) return false;
			continue;
		}
		if (indent.columns <= indentColumns) return false;
	}

	return true;
}

/**
 * Resolves Visualg block pairs with consistent indentation. The editor uses
 * the resulting line ranges to draw physical connectors in the code surface;
 * incomplete, malformed or misindented structures deliberately stay unpaired
 * so we never imply valid code.
 */
export function getPortugolStructureGuides(source: string): PortugolStructureGuide[] {
	type OpenStructure = {
		startLine: number;
		indentColumns: number;
		indentOffset: number;
		type: PortugolStructureType;
		closer: string;
	};

	const stack: OpenStructure[] = [];
	const guides: PortugolStructureGuide[] = [];
	const lines = source.split(/\r?\n/);

	for (const [index, line] of lines.entries()) {
		const content = stripPortugolStringsAndComments(line);
		if (!content) continue;
		const lineNumber = index + 1;
		const indentation = getPortugolLineIndentation(line);
		const closer = content.match(/^([a-záéíóúâêîôûç]+)/i)?.[1];
		const current = stack.at(-1);

		if (current && closer === current.closer) {
			stack.pop();
			if (
				hasConsistentStructureIndentation(
					lines,
					current.startLine,
					lineNumber,
					current.type,
					current.indentColumns
				)
			) {
				guides.push({
					startLine: current.startLine,
					endLine: lineNumber,
					indentColumns: current.indentColumns,
					indentOffset: current.indentOffset,
					type: current.type
				});
			}
			continue;
		}

		const opener = STRUCTURE_OPENERS.find((candidate) => candidate.pattern.test(content));
		if (!opener) continue;
		stack.push({
			startLine: lineNumber,
			indentColumns: indentation.columns,
			indentOffset: indentation.offset,
			type: opener.type,
			closer: opener.closer
		});
	}

	return guides.sort(
		(left, right) => left.startLine - right.startLine || left.indentColumns - right.indentColumns
	);
}

export function getPortugolLineIndent(text: string) {
	return text.match(/^[\t ]*/)?.[0] ?? '';
}

export function getPortugolIndentColumns(indent: string) {
	let columns = 0;
	for (const char of indent) {
		columns += char === '\t' ? 4 : 1;
	}
	return columns;
}

export function opensPortugolBlock(text: string) {
	const trimmed = text.trim().toLowerCase();
	return BLOCK_OPENERS.some((pattern) => pattern.test(trimmed));
}

export function closesPortugolBlock(text: string) {
	return BLOCK_CLOSERS.test(text.trim().toLowerCase());
}

export function getPortugolNextLineIndent(textBeforeCursor: string) {
	const currentIndent = getPortugolLineIndent(textBeforeCursor);
	return opensPortugolBlock(textBeforeCursor) ? `${currentIndent}\t` : currentIndent;
}

export function getPortugolPairEdit(
	selectedText: string,
	nextChar: string,
	opening: string,
	closing = opening,
	skipClosing = opening === closing
): PortugolPairEdit {
	if (skipClosing && !selectedText && nextChar === closing) {
		return {
			insert: '',
			selectionStartOffset: 1,
			selectionEndOffset: 1
		};
	}

	if (selectedText) {
		return {
			insert: `${opening}${selectedText}${closing}`,
			selectionStartOffset: 1,
			selectionEndOffset: selectedText.length + 1
		};
	}

	return {
		insert: `${opening}${closing}`,
		selectionStartOffset: 1,
		selectionEndOffset: 1
	};
}

export function getPortugolEditorIndentColumns(previousLineText: string, textAfter: string) {
	let columns = getPortugolIndentColumns(getPortugolLineIndent(previousLineText));
	if (opensPortugolBlock(previousLineText)) {
		columns += 4;
	}
	if (closesPortugolBlock(textAfter)) {
		columns = Math.max(0, columns - 4);
	}
	return columns;
}
