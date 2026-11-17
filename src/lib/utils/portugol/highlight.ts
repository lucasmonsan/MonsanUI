import { visualgReferenceItems } from './reference.js';
import { javascriptReferenceItems } from '../javascript/reference.js';

export type CodeTokenKind = 'plain' | 'keyword' | 'string' | 'number' | 'comment';
export type PortugolCodeTokenKind = CodeTokenKind;

export interface CodeToken {
	kind: CodeTokenKind;
	text: string;
}
export type PortugolCodeToken = CodeToken;

const extraKeywords = ['verdadeiro', 'falso', 'nao', 'não'];

const portugolKeywords = new Set(
	visualgReferenceItems
		.flatMap((item) => [item.name, ...(item.aliases ?? [])])
		.concat(extraKeywords)
		.map((name) => name.toLowerCase())
);

const tokenPattern = /\/\/.*|"(?:[^"\\]|\\.)*"|\b\d+(?:\.\d+)?\b|[A-Za-zÀ-ÿ_][A-Za-zÀ-ÿ0-9_]*/g;

function classifyPortugolToken(text: string): CodeTokenKind {
	if (text.startsWith('//')) return 'comment';
	if (text.startsWith('"')) return 'string';
	if (/^\d+(?:\.\d+)?$/.test(text)) return 'number';
	if (portugolKeywords.has(text.toLowerCase())) return 'keyword';
	return 'plain';
}

export function tokenizePortugolCode(code: string): CodeToken[] {
	if (!code) return [];

	const tokens: CodeToken[] = [];
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

const jsExtraKeywords = [
	'const',
	'let',
	'var',
	'function',
	'return',
	'if',
	'else',
	'switch',
	'case',
	'default',
	'break',
	'continue',
	'for',
	'while',
	'do',
	'new',
	'typeof',
	'async',
	'await',
	'true',
	'false',
	'null',
	'undefined',
	'Math',
	'Number',
	'String',
	'Boolean',
	'parseInt',
	'parseFloat',
	'prompt',
	'console'
];

const jsKeywords = new Set(
	javascriptReferenceItems
		.flatMap((item) => [item.name, ...(item.aliases ?? [])])
		.concat(jsExtraKeywords)
		.map((name) => name.toLowerCase())
);

const jsTokenPattern =
	/\/\/.*|\/\*[\s\S]*?\*\/|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|[A-Za-z_$][A-Za-z0-9_$]*/g;

function classifyJsToken(text: string): CodeTokenKind {
	if (text.startsWith('//') || text.startsWith('/*')) return 'comment';
	if (text.startsWith('"') || text.startsWith("'") || text.startsWith('`')) return 'string';
	if (/^\d+(?:\.\d+)?$/.test(text)) return 'number';
	if (jsKeywords.has(text.toLowerCase())) return 'keyword';
	return 'plain';
}

export function tokenizeJsCode(code: string): CodeToken[] {
	if (!code) return [];

	const tokens: CodeToken[] = [];
	let cursor = 0;
	for (const match of code.matchAll(jsTokenPattern)) {
		const index = match.index ?? 0;
		if (index > cursor) {
			tokens.push({ kind: 'plain', text: code.slice(cursor, index) });
		}
		tokens.push({ kind: classifyJsToken(match[0]), text: match[0] });
		cursor = index + match[0].length;
	}
	if (cursor < code.length) {
		tokens.push({ kind: 'plain', text: code.slice(cursor) });
	}
	return tokens;
}

const htmlTokenPattern =
	/<!--[\s\S]*?-->|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|<\/?[A-Za-z0-9-]+|(?:\/?>)|\b\d+(?:\.\d+)?(?:px|rem|em|%)?\b|[A-Za-z_][A-Za-z0-9_-]*(?==)/g;

function classifyHtmlToken(text: string): CodeTokenKind {
	if (text.startsWith('<!--')) return 'comment';
	if (text.startsWith('"') || text.startsWith("'")) return 'string';
	if (/^\d/.test(text)) return 'number';
	if (text.startsWith('<') || text === '>' || text === '/>') return 'keyword';
	if (text.endsWith('=')) return 'keyword';
	return 'plain';
}

export function tokenizeHtmlCode(code: string): CodeToken[] {
	if (!code) return [];

	const tokens: CodeToken[] = [];
	let cursor = 0;
	for (const match of code.matchAll(htmlTokenPattern)) {
		const index = match.index ?? 0;
		if (index > cursor) {
			tokens.push({ kind: 'plain', text: code.slice(cursor, index) });
		}
		tokens.push({ kind: classifyHtmlToken(match[0]), text: match[0] });
		cursor = index + match[0].length;
	}
	if (cursor < code.length) {
		tokens.push({ kind: 'plain', text: code.slice(cursor) });
	}
	return tokens;
}

const cssTokenPattern =
	/\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b|[A-Za-z_-][A-Za-z0-9_-]*(?=\s*:)|[:;{},]/g;

function classifyCssToken(text: string): CodeTokenKind {
	if (text.startsWith('/*')) return 'comment';
	if (text.startsWith('"') || text.startsWith("'")) return 'string';
	if (/^\d/.test(text) || text.startsWith('#')) return 'number';
	if (text.endsWith(':') || text === '{' || text === '}' || text === ';') return 'keyword';
	return 'plain';
}

export function tokenizeCssCode(code: string): CodeToken[] {
	if (!code) return [];
	const tokens: CodeToken[] = [];
	let cursor = 0;
	for (const match of code.matchAll(cssTokenPattern)) {
		const index = match.index ?? 0;
		if (index > cursor) {
			tokens.push({ kind: 'plain', text: code.slice(cursor, index) });
		}
		tokens.push({ kind: classifyCssToken(match[0]), text: match[0] });
		cursor = index + match[0].length;
	}
	if (cursor < code.length) {
		tokens.push({ kind: 'plain', text: code.slice(cursor) });
	}
	return tokens;
}

export function tokenizeCode(
	code: string,
	language: 'portugol' | 'javascript' | 'html' | 'css' = 'portugol'
): CodeToken[] {
	if (language === 'html') return tokenizeHtmlCode(code);
	if (language === 'css') return tokenizeCssCode(code);
	return language === 'javascript' ? tokenizeJsCode(code) : tokenizePortugolCode(code);
}
