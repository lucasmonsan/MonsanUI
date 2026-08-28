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

export type PortugolIndentationCheck = {
	ok: boolean;
	line?: number;
	expected?: number;
	actual?: number;
	errorMsg?: string;
};

export function stripPortugolStringsAndComments(line: string) {
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

function getIndentation(line: string) {
	const indent = line.match(/^[\t ]*/)?.[0] ?? '';
	let columns = 0;
	for (const char of indent) columns += char === '\t' ? 4 : 1;
	return { columns, offset: indent.length };
}

function isBranchLine(type: PortugolStructureType, content: string) {
	if (type === 'if') return /^(senao|senão)\b/i.test(content);
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
	indentColumns: number,
	directBranchLines: ReadonlySet<number>
) {
	if (getIndentation(lines[endLine - 1]).columns !== indentColumns) return false;

	for (let lineNumber = startLine + 1; lineNumber < endLine; lineNumber += 1) {
		const content = stripPortugolStringsAndComments(lines[lineNumber - 1]);
		if (!content) continue;

		const indent = getIndentation(lines[lineNumber - 1]);
		if (type === 'algorithm' && isAlgorithmSection(content)) {
			if (indent.columns !== indentColumns) return false;
			continue;
		}
		if (directBranchLines.has(lineNumber)) {
			if (indent.columns !== indentColumns) return false;
			continue;
		}
		if (indent.columns <= indentColumns) return false;
	}

	return true;
}

export function getPortugolStructureGuides(source: string): PortugolStructureGuide[] {
	type OpenStructure = {
		startLine: number;
		indentColumns: number;
		indentOffset: number;
		type: PortugolStructureType;
		closer: string;
		directBranchLines: Set<number>;
	};

	const stack: OpenStructure[] = [];
	const guides: PortugolStructureGuide[] = [];
	const lines = source.split(/\r?\n/);

	for (const [index, line] of lines.entries()) {
		const content = stripPortugolStringsAndComments(line);
		if (!content) continue;
		const lineNumber = index + 1;
		const indentation = getIndentation(line);
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
					current.indentColumns,
					current.directBranchLines
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

		if (current?.type === 'if' && isBranchLine(current.type, content)) {
			current.directBranchLines.add(lineNumber);
			continue;
		}

		const opener = STRUCTURE_OPENERS.find((candidate) => candidate.pattern.test(content));
		if (!opener) continue;
		stack.push({
			startLine: lineNumber,
			indentColumns: indentation.columns,
			indentOffset: indentation.offset,
			type: opener.type,
			closer: opener.closer,
			directBranchLines: new Set()
		});
	}

	return guides.sort(
		(left, right) => left.startLine - right.startLine || left.indentColumns - right.indentColumns
	);
}

/** Strict execution guard. The guide renderer deliberately consumes only the
 * valid pair from its own structure, so an unrelated formatting error does not
 * hide a useful connector elsewhere in the document. */
export function checkPortugolIndentation(code: string): PortugolIndentationCheck {
	const lines = code.split(/\r?\n/);
	let expected = 0;
	const switchIndents: number[] = [];
	let usesTabs = false;
	let usesSpaces = false;
	for (const line of lines) {
		if (line.startsWith('\t')) usesTabs = true;
		else if (line.startsWith(' ')) usesSpaces = true;
	}

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index];
		const lower = stripPortugolStringsAndComments(line);
		if (!lower) continue;
		const isSwitchCase = lower.startsWith('caso') || lower.startsWith('outrocaso');
		const isSwitchCloser = lower === 'fimescolha';

		if (isSwitchCase && switchIndents.length > 0) {
			expected = switchIndents.at(-1)! + 1;
		} else if (isSwitchCloser && switchIndents.length > 0) {
			expected = switchIndents.pop()!;
		} else if (
			lower.startsWith('fimalgoritmo') ||
			lower === 'var' ||
			lower === 'inicio' ||
			lower === 'fimse' ||
			lower === 'fimenquanto' ||
			lower === 'fimpara' ||
			lower === 'ate' ||
			lower === '}' ||
			lower.startsWith('senao') ||
			lower.startsWith('senão')
		) {
			if (lower.startsWith('fimalgoritmo') || lower === 'var' || lower === 'inicio') {
				expected = 0;
			} else {
				expected = Math.max(0, expected - 1);
			}
		}

		let actual = 0;
		if (usesTabs) {
			while (actual < line.length && line[actual] === '\t') actual += 1;
		} else if (usesSpaces) {
			while (actual < line.length && line[actual] === ' ') actual += 1;
			actual = Math.floor(actual / 4);
		}

		if (actual !== expected) {
			const indentCharName = usesTabs ? 'TABs' : 'espaços (múltiplos de 4)';
			return {
				ok: false,
				line: index + 1,
				expected,
				actual,
				errorMsg: `Erro de Formatação na linha ${index + 1}: Indentação incorreta. Esperado ${expected} ${indentCharName}, obtido ${actual}.`
			};
		}

		if (lower.startsWith('escolha')) {
			switchIndents.push(expected);
			expected += 1;
		} else if (isSwitchCase && switchIndents.length > 0) {
			expected = switchIndents.at(-1)! + 2;
		} else if (
			lower.startsWith('algoritmo') ||
			lower === 'var' ||
			lower === 'inicio' ||
			lower.endsWith('{') ||
			lower.endsWith('entao') ||
			lower.endsWith('então') ||
			lower.endsWith('faca') ||
			lower.endsWith('faça') ||
			lower === 'repita' ||
			lower.startsWith('senao') ||
			lower.startsWith('senão')
		) {
			expected += 1;
		}
	}

	return { ok: true };
}
