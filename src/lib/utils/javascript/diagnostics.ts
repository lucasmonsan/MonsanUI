import { javascriptLanguage } from '@codemirror/lang-javascript';

function getLineNumber(source: string, pos: number): number {
	return source.slice(0, pos).split('\n').length;
}

/**
 * Statically analyzes JavaScript source code using Lezer AST to detect syntax errors
 * before instrumenting or running the code.
 */
export function findJsSyntaxError(code: string): { message: string; line: number } | null {
	if (!code || !code.trim()) return null;

	try {
		const tree = javascriptLanguage.parser.parse(code);
		const cursor = tree.cursor();

		do {
			if (cursor.name === '⚠') {
				const from = cursor.from;
				const line = getLineNumber(code, from);
				const parent = cursor.node.parent?.name;

				let message = 'Estrutura sintática incompleta ou caractere inesperado.';
				if (parent === 'String') {
					message =
						'Texto entre aspas não foi fechado. Verifique se há aspas abertas sem o fechamento correspondente.';
				} else if (parent === 'ParenthesizedExpression' || parent === 'ArgList') {
					message = 'Expressão ou lista de argumentos entre parênteses não foi fechada com ")".';
				} else if (parent === 'ParamList') {
					message = 'Lista de parâmetros da função não foi fechada com ")".';
				} else if (parent === 'Block') {
					message = 'Bloco de comandos iniciado com "{" não foi fechado com "}".';
				} else if (parent === 'ArrayExpression') {
					message = 'Lista (array) iniciada com "[" não foi fechada com "]".';
				} else if (parent === 'ObjectExpression') {
					message =
						'Objeto iniciado com "{" não foi fechado com "}" ou possui propriedades mal formadas.';
				} else if (parent === 'VariableDeclaration') {
					message = 'Declaração de variável incompleta ou com atribuição inválida.';
				}

				return { line, message };
			}
		} while (cursor.next());

		return null;
	} catch {
		return null;
	}
}

/**
 * Translates raw JavaScript engine runtime errors into clear, didactic Portuguese messages
 * describing the nature of the issue without giving away the exact solution.
 */
export function translateJsErrorMessage(rawMessage: string): string {
	const clean = rawMessage
		.replace(/^([a-zA-Z]+Error:\s*|Uncaught\s+[a-zA-Z]+Error:\s*|Uncaught\s+)/i, '')
		.trim();

	// 1. ReferenceError
	let match = clean.match(/^([a-zA-Z0-9_$]+) is not defined/i);
	if (match) {
		return `O identificador '${match[1]}' foi utilizado, mas não foi declarado ou não existe neste escopo.`;
	}

	match = clean.match(/Cannot access '([^']+)' before initialization/i);
	if (match) {
		return `A variável '${match[1]}' foi acessada antes de ser declarada (inicializada). No JavaScript, variáveis 'let' e 'const' só podem ser usadas após sua declaração.`;
	}

	// 2. TypeError - const reassignment
	if (/Assignment to constant variable/i.test(clean)) {
		return 'Tentativa de reatribuir valor a uma constante ("const"). Constantes não podem ter seu valor alterado após a criação.';
	}

	// 3. TypeError - reading property of null/undefined
	match =
		clean.match(/Cannot read propert(?:ies|y) of (undefined|null)(?: \(reading '([^']+)'\))?/i) ||
		clean.match(/Cannot read property '([^']+)' of (undefined|null)/i);
	if (match) {
		const prop = match[2] || match[1] || '';
		const isNull = /null/i.test(clean);
		const valType = isNull ? 'nulo (null)' : 'indefinido (undefined)';
		return prop
			? `Tentativa de acessar a propriedade '${prop}' a partir de um valor ${valType}.`
			: `Tentativa de acessar propriedade a partir de um valor ${valType}.`;
	}

	// 4. TypeError - setting property of null/undefined
	match = clean.match(
		/Cannot set propert(?:ies|y) of (undefined|null)(?: \(setting '([^']+)'\))?/i
	);
	if (match) {
		const prop = match[2] || '';
		const isNull = /null/i.test(clean);
		const valType = isNull ? 'nulo (null)' : 'indefinido (undefined)';
		return prop
			? `Tentativa de atribuir a propriedade '${prop}' em um valor ${valType}.`
			: `Tentativa de atribuir propriedade em um valor ${valType}.`;
	}

	// 5. TypeError - not a function
	match = clean.match(/^([a-zA-Z0-9_$.]+) is not a function/i);
	if (match) {
		return `O elemento '${match[1]}' foi chamado com '()', mas não é uma função executável.`;
	}

	// 6. TypeError - not iterable
	match = clean.match(/^([a-zA-Z0-9_$.]+) is not iterable/i);
	if (match) {
		return `O elemento '${match[1]}' não pode ser percorrido em um laço de repetição porque não é uma lista (array) ou valor iterável.`;
	}

	// 7. RangeError - recursion / stack
	if (/Maximum call stack size exceeded/i.test(clean)) {
		return 'Estouro de pilha de execução: uma função chamou a si mesma repetidamente sem condição de término (recursão infinita).';
	}
	if (/Invalid array length/i.test(clean)) {
		return 'Tamanho inválido especificado para a criação de uma lista (array).';
	}

	// 8. SyntaxError variants
	match = clean.match(/Unexpected identifier (?:'([^']+)'|([a-zA-Z0-9_$]+))/i);
	if (match) {
		const id = match[1] || match[2];
		return `Identificador inesperado '${id}'. Geralmente indica falta de uma vírgula, operador ou delimitador antes dele.`;
	}

	match = clean.match(/Unexpected token (?:'([^']+)'|(\S+))/i);
	if (match) {
		const token = match[1] || match[2];
		return `Símbolo ou caractere inesperado '${token}'. Verifique se há parênteses, chaves ou delimitadores fora de lugar.`;
	}

	if (/Unexpected end of input/i.test(clean)) {
		return 'O código terminou de forma inesperada. Verifique se todas as chaves "{", parênteses "(" ou aspas foram devidamente fechadas.';
	}

	if (/Missing initializer in const declaration/i.test(clean)) {
		return 'Toda constante declarada com "const" precisa receber um valor inicial obrigatório na sua criação.';
	}

	if (/Identifier '([^']+)' has already been declared/i.test(clean)) {
		const idMatch = clean.match(/Identifier '([^']+)' has already been declared/i);
		return `O identificador '${idMatch?.[1] || ''}' já foi declarado anteriormente neste mesmo escopo.`;
	}

	if (/Invalid left-hand side in assignment/i.test(clean)) {
		return 'Destino de atribuição inválido. O lado esquerdo de "=" deve ser uma variável onde o valor possa ser armazenado.';
	}

	if (/Invalid or unexpected token/i.test(clean)) {
		return 'Caractere inválido ou não reconhecido no código (verifique se há aspas abertas sem fechar ou caracteres especiais inválidos).';
	}

	return clean;
}

/**
 * Extracts line number from runtime error stack or line properties.
 */
export function extractJsErrorLine(error: unknown, sourceCode: string): number {
	if (!error) return 0;
	const err = error as { stack?: string; message?: string; lineNumber?: number; line?: number };
	if (typeof err.lineNumber === 'number' && err.lineNumber > 0) return err.lineNumber;
	if (typeof err.line === 'number' && err.line > 0) return err.line;

	if (err.stack) {
		const matches = Array.from(err.stack.matchAll(/(?:<anonymous>|blob:[^:]+):(\d+)(?::(\d+))?/gi));
		for (const match of matches) {
			const rawLine = parseInt(match[1], 10);
			if (!isNaN(rawLine) && rawLine > 0) {
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

/**
 * Formats a JavaScript execution error with line number and didactic explanation.
 */
export function formatJsExecutionError(
	error: unknown,
	sourceCode: string
): { message: string; line: number } {
	const rawMessage = error instanceof Error ? error.message : String(error);
	let line = extractJsErrorLine(error, sourceCode);

	// If line could not be determined from the runtime stack, check for static syntax error
	if (line === 0) {
		const syntaxErr = findJsSyntaxError(sourceCode);
		if (syntaxErr) {
			line = syntaxErr.line;
		}
	}

	const translated = translateJsErrorMessage(rawMessage);
	const displayMessage = line > 0 ? `Linha ${line}: ${translated}` : translated;

	return {
		message: displayMessage,
		line
	};
}
