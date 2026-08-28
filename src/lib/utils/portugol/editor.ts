import {
	getPortugolStructureGuides as resolvePortugolStructureGuides,
	type PortugolStructureGuide
} from './indentation.js';

export type { PortugolStructureGuide } from './indentation.js';

const BLOCK_OPENERS = [
	/\b(var|inicio|entao|então|faca|faça|repita|outrocaso)\s*$/i,
	/^\s*(escolha|caso)\b/i
];

const BLOCK_CLOSERS =
	/^\s*([})]|\b(fimse|fimenquanto|fimpara|fimescolha|fimalgoritmo|senao|senão|caso|outrocaso)\b)/i;

export const PORTUGOL_EDITOR_CARET_COLOR = 'var(--text-primary)';

export interface PortugolPairEdit {
	insert: string;
	selectionStartOffset: number;
	selectionEndOffset: number;
}

export function getPortugolStructureGuides(source: string): PortugolStructureGuide[] {
	return resolvePortugolStructureGuides(source);
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
	if (/^\s*fimescolha\b/i.test(textAfter)) {
		return Math.max(0, columns - 8);
	}
	if (closesPortugolBlock(textAfter)) {
		columns = Math.max(0, columns - 4);
	}
	return columns;
}
