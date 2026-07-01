import { visualgReferenceItems } from './reference.js';

export type PortugolCodeTokenKind = 'plain' | 'keyword' | 'string' | 'number' | 'comment';

export interface PortugolCodeToken {
	kind: PortugolCodeTokenKind;
	text: string;
}

const extraKeywords = ['verdadeiro', 'falso', 'nao', 'não'];

const portugolKeywords = new Set(
	visualgReferenceItems
		.flatMap((item) => [item.name, ...(item.aliases ?? [])])
		.concat(extraKeywords)
		.map((name) => name.toLowerCase())
);

const tokenPattern = /\/\/.*|"(?:[^"\\]|\\.)*"|\b\d+(?:\.\d+)?\b|[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*/g;

function classifyPortugolToken(text: string): PortugolCodeTokenKind {
	if (text.startsWith('//')) return 'comment';
	if (text.startsWith('"')) return 'string';
	if (/^\d+(?:\.\d+)?$/.test(text)) return 'number';
	if (portugolKeywords.has(text.toLowerCase())) return 'keyword';
	return 'plain';
}

export function tokenizePortugolCode(code: string): PortugolCodeToken[] {
	if (!code) return [];

	const tokens: PortugolCodeToken[] = [];
	let cursor = 0;
	for (const match of code.matchAll(tokenPattern)) {
		const index = match.index ?? 0;
		if (index > cursor) {
			tokens.push({ kind: 'plain', text: code.slice(cursor, index) });
		}
		tokens.push({ kind: classifyPortugolToken(match[0]), text: match[0] });
		cursor = index + match[0].length;
	}
	if (cursor < code.length) {
		tokens.push({ kind: 'plain', text: code.slice(cursor) });
	}
	return tokens;
}
