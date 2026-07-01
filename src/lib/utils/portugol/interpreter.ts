export type TokenType =
	| 'PROGRAM'
	| 'FUNCTION'
	| 'TYPE'
	| 'IF'
	| 'ELSE'
	| 'WHILE'
	| 'FOR'
	| 'RETURN'
	| 'BREAK'
	| 'TRUE'
	| 'FALSE'
	| 'IDENTIFIER'
	| 'NUMBER'
	| 'STRING'
	| 'CHAR'
	| 'ASSIGN'
	| 'PLUS'
	| 'MINUS'
	| 'STAR'
	| 'SLASH'
	| 'PERCENT'
	| 'EQ'
	| 'NEQ'
	| 'LT'
	| 'GT'
	| 'LTE'
	| 'GTE'
	| 'AND'
	| 'OR'
	| 'XOR'
	| 'NOT'
	| 'LBRACE'
	| 'RBRACE'
	| 'LPAREN'
	| 'RPAREN'
	| 'COMMA'
	| 'SEMICOLON'
	| 'ALGORITMO'
	| 'VAR'
	| 'INICIO'
	| 'FIMALGORITMO'
	| 'FIMSE'
	| 'FIMENQUANTO'
	| 'FIMPARA'
	| 'ENTAO'
	| 'FACA'
	| 'REPITA'
	| 'ESCOLHA'
	| 'CASO'
	| 'OUTROCASO'
	| 'FIMESCOLHA'
	| 'DE'
	| 'ATE'
	| 'PASSO'
	| 'COLON'
	| 'EOF';

export interface Token {
	type: TokenType;
	value: string;
	line: number;
	column: number;
}

export class Lexer {
	private input: string;
	private pos = 0;
	private line = 1;
	private column = 1;

	constructor(input: string) {
		this.input = input;
	}

	private peek(): string {
		return this.pos >= this.input.length ? '' : this.input[this.pos];
	}

	private advance(): string {
		const char = this.peek();
		this.pos++;
		if (char === '\n') {
			this.line++;
			this.column = 1;
		} else {
			this.column++;
		}
		return char;
	}

	private isValidIdentifier(id: string): boolean {
		return /^[A-Za-z_][A-Za-z0-9_]*$/.test(id);
	}

	private pushIdentifierToken(tokens: Token[], value: string, line: number, column: number) {
		if (!this.isValidIdentifier(value)) {
			throw new Error(
				`Erro Léxico: Identificador inválido '${value}' na linha ${line}, coluna ${column}. Use apenas letras sem acento, números e _.`
			);
		}
		tokens.push({ type: 'IDENTIFIER', value, line, column });
	}

	public tokenize(): Token[] {
		const isVisualg = /algoritmo|fimalgoritmo/i.test(this.input);
		const tokens: Token[] = [];
		while (this.pos < this.input.length) {
			const char = this.peek();

			if (/\s/.test(char)) {
				this.advance();
				continue;
			}

			// Comments
			if (char === '/' && this.input[this.pos + 1] === '/') {
				while (this.peek() !== '\n' && this.peek() !== '') {
					this.advance();
				}
				continue;
			}
			if (char === '/' && this.input[this.pos + 1] === '*') {
				this.advance(); // /
				this.advance(); // *
				while (!(this.peek() === '*' && this.input[this.pos + 1] === '/') && this.peek() !== '') {
					this.advance();
				}
				if (this.peek() !== '') {
					this.advance(); // *
					this.advance(); // /
				}
				continue;
			}

			// Strings
			if (char === '"') {
				const startLine = this.line;
				const startCol = this.column;
				this.advance(); // "
				let str = '';
				while (this.peek() !== '"' && this.peek() !== '') {
					str += this.advance();
				}
				if (this.peek() === '') {
					throw new Error(`Erro Léxico: Cadeia de caracteres não fechada na linha ${startLine}`);
				}
				this.advance(); // "
				tokens.push({ type: 'STRING', value: str, line: startLine, column: startCol });
				continue;
			}

			// Chars
			if (char === "'") {
				const startLine = this.line;
				const startCol = this.column;
				this.advance(); // '
				let ch = '';
				if (this.peek() !== "'") {
					ch = this.advance();
				}
				if (this.peek() !== "'") {
					throw new Error(`Erro Léxico: Caracter não fechado na linha ${startLine}`);
				}
				this.advance(); // '
				tokens.push({ type: 'CHAR', value: ch, line: startLine, column: startCol });
				continue;
			}

			// Operators & Delimiters
			const twoChar = char + (this.input[this.pos + 1] || '');

			// Visualg specific double char tokens
			if (isVisualg && twoChar === '<-') {
				tokens.push({ type: 'ASSIGN', value: '<-', line: this.line, column: this.column });
				this.advance();
				this.advance();
				continue;
			}
			if (isVisualg && twoChar === '<>') {
				tokens.push({ type: 'NEQ', value: '<>', line: this.line, column: this.column });
				this.advance();
				this.advance();
				continue;
			}

			if (twoChar === '==') {
				tokens.push({ type: 'EQ', value: '==', line: this.line, column: this.column });
				this.advance();
				this.advance();
				continue;
			}
			if (twoChar === '!=') {
				tokens.push({ type: 'NEQ', value: '!=', line: this.line, column: this.column });
				this.advance();
				this.advance();
				continue;
			}
			if (twoChar === '<=') {
				tokens.push({ type: 'LTE', value: '<=', line: this.line, column: this.column });
				this.advance();
				this.advance();
				continue;
			}
			if (twoChar === '>=') {
				tokens.push({ type: 'GTE', value: '>=', line: this.line, column: this.column });
				this.advance();
				this.advance();
				continue;
			}

			// Single character tokens
			if (char === '=') {
				if (isVisualg) {
					// Em Visualg, o caractere '=' é comparação de igualdade. Atribuição é '<-'.
					tokens.push({ type: 'EQ', value: '=', line: this.line, column: this.column });
				} else {
					tokens.push({ type: 'ASSIGN', value: '=', line: this.line, column: this.column });
				}
				this.advance();
				continue;
			}
			if (isVisualg && char === ':') {
				tokens.push({ type: 'COLON', value: ':', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '+') {
				tokens.push({ type: 'PLUS', value: '+', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '-') {
				tokens.push({ type: 'MINUS', value: '-', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '*') {
				tokens.push({ type: 'STAR', value: '*', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '/') {
				tokens.push({ type: 'SLASH', value: '/', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '%') {
				tokens.push({ type: 'PERCENT', value: '%', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '<') {
				tokens.push({ type: 'LT', value: '<', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '>') {
				tokens.push({ type: 'GT', value: '>', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '{') {
				tokens.push({ type: 'LBRACE', value: '{', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '}') {
				tokens.push({ type: 'RBRACE', value: '}', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === '(') {
				tokens.push({ type: 'LPAREN', value: '(', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === ')') {
				tokens.push({ type: 'RPAREN', value: ')', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === ',') {
				tokens.push({ type: 'COMMA', value: ',', line: this.line, column: this.column });
				this.advance();
				continue;
			}
			if (char === ';') {
				tokens.push({ type: 'SEMICOLON', value: ';', line: this.line, column: this.column });
				this.advance();
				continue;
			}

			// Numbers
			if (/\d/.test(char)) {
				const startLine = this.line;
				const startCol = this.column;
				let num = '';
				while (/\d/.test(this.peek())) {
					num += this.advance();
				}
				if (this.peek() === '.') {
					num += this.advance(); // .
					while (/\d/.test(this.peek())) {
						num += this.advance();
					}
				}
				tokens.push({ type: 'NUMBER', value: num, line: startLine, column: startCol });
				continue;
			}

			// Identifiers & Keywords
			if (/[a-zA-Z_À-ÿ]/.test(char)) {
				const startLine = this.line;
				const startCol = this.column;
				let id = '';
				while (/[a-zA-Z0-9_À-ÿ]/.test(this.peek())) {
					id += this.advance();
				}

				const lowerId = id.toLowerCase();
				if (isVisualg) {
					if (lowerId === 'algoritmo') {
						tokens.push({ type: 'ALGORITMO', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'var') {
						tokens.push({ type: 'VAR', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'inicio') {
						tokens.push({ type: 'INICIO', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'fimalgoritmo') {
						tokens.push({ type: 'FIMALGORITMO', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'fimse') {
						tokens.push({ type: 'FIMSE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'fimenquanto') {
						tokens.push({ type: 'FIMENQUANTO', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'fimpara') {
						tokens.push({ type: 'FIMPARA', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'entao' || lowerId === 'então') {
						tokens.push({ type: 'ENTAO', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'faca' || lowerId === 'faça') {
						tokens.push({ type: 'FACA', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'repita') {
						tokens.push({ type: 'REPITA', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'escolha') {
						tokens.push({ type: 'ESCOLHA', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'caso') {
						tokens.push({ type: 'CASO', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'outrocaso') {
						tokens.push({ type: 'OUTROCASO', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'fimescolha') {
						tokens.push({ type: 'FIMESCOLHA', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'de') {
						tokens.push({ type: 'DE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'ate' || lowerId === 'até') {
						tokens.push({ type: 'ATE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'passo') {
						tokens.push({ type: 'PASSO', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'se') {
						tokens.push({ type: 'IF', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'senao' || lowerId === 'senão') {
						tokens.push({ type: 'ELSE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'enquanto') {
						tokens.push({ type: 'WHILE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'para') {
						tokens.push({ type: 'FOR', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'retorne') {
						tokens.push({ type: 'RETURN', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'interrompa') {
						tokens.push({ type: 'BREAK', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'verdadeiro') {
						tokens.push({ type: 'TRUE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'falso') {
						tokens.push({ type: 'FALSE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'e') {
						tokens.push({ type: 'AND', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'ou') {
						tokens.push({ type: 'OR', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'xou') {
						tokens.push({ type: 'XOR', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'nao' || lowerId === 'não') {
						tokens.push({ type: 'NOT', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'mod') {
						const nextNonWhitespace = this.input.slice(this.pos).match(/^\s*(.)/)?.[1];
						if (nextNonWhitespace === '(') {
							this.pushIdentifierToken(tokens, id, startLine, startCol);
						} else {
							tokens.push({ type: 'PERCENT', value: '%', line: startLine, column: startCol });
						}
					} else if (
						['inteiro', 'real', 'caractere', 'caracter', 'logico', 'cadeia'].includes(lowerId)
					) {
						const normalizedType = lowerId === 'caractere' ? 'caracter' : lowerId;
						tokens.push({ type: 'TYPE', value: normalizedType, line: startLine, column: startCol });
					} else {
						this.pushIdentifierToken(tokens, id, startLine, startCol);
					}
				} else {
					// Portugol Studio
					if (lowerId === 'programa') {
						tokens.push({ type: 'PROGRAM', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'funcao' || lowerId === 'função') {
						tokens.push({ type: 'FUNCTION', value: id, line: startLine, column: startCol });
					} else if (['inteiro', 'real', 'caracter', 'logico', 'cadeia'].includes(lowerId)) {
						tokens.push({ type: 'TYPE', value: lowerId, line: startLine, column: startCol });
					} else if (lowerId === 'se') {
						tokens.push({ type: 'IF', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'senao' || lowerId === 'senão') {
						tokens.push({ type: 'ELSE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'enquanto') {
						tokens.push({ type: 'WHILE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'para') {
						tokens.push({ type: 'FOR', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'retorne') {
						tokens.push({ type: 'RETURN', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'verdadeiro') {
						tokens.push({ type: 'TRUE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'falso') {
						tokens.push({ type: 'FALSE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'e') {
						tokens.push({ type: 'AND', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'ou') {
						tokens.push({ type: 'OR', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'xou') {
						tokens.push({ type: 'XOR', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'nao' || lowerId === 'não') {
						tokens.push({ type: 'NOT', value: id, line: startLine, column: startCol });
					} else {
						this.pushIdentifierToken(tokens, id, startLine, startCol);
					}
				}
				continue;
			}

			throw new Error(
				`Erro Léxico: Caracter inválido '${char}' na linha ${this.line}, coluna ${this.column}`
			);
		}

		tokens.push({ type: 'EOF', value: '', line: this.line, column: this.column });
		return tokens;
	}
}

// AST Nodes
export type ASTNode =
	| ProgramNode
	| FunctionDeclNode
	| VarDeclNode
	| BlockNode
	| AssignNode
	| IfNode
	| WhileNode
	| RepeatNode
	| SwitchNode
	| ForNode
	| ReturnNode
	| BreakNode
	| CallNode
	| BinaryNode
	| UnaryNode
	| LiteralNode
	| IdentifierNode;

export interface ProgramNode {
	type: 'Program';
	declarations: (FunctionDeclNode | VarDeclNode)[];
	line: number;
}

export interface FunctionDeclNode {
	type: 'FunctionDecl';
	name: string;
	returnType: string;
	params: { type: string; name: string }[];
	body: BlockNode;
	line: number;
}

export interface VarDeclNode {
	type: 'VarDecl';
	varType: string;
	name: string;
	initializer?: ASTNode;
	line: number;
}

export interface BlockNode {
	type: 'Block';
	statements: ASTNode[];
	line: number;
}

export interface AssignNode {
	type: 'Assign';
	name: string;
	value: ASTNode;
	line: number;
}

export interface IfNode {
	type: 'If';
	condition: ASTNode;
	thenBranch: ASTNode;
	elseBranch?: ASTNode;
	line: number;
}

export interface WhileNode {
	type: 'While';
	condition: ASTNode;
	body: ASTNode;
	line: number;
}

export interface RepeatNode {
	type: 'Repeat';
	body: ASTNode;
	condition: ASTNode;
	line: number;
}

export interface SwitchNode {
	type: 'Switch';
	discriminant: ASTNode;
	cases: { test: ASTNode; body: BlockNode; line: number }[];
	defaultBody?: BlockNode;
	line: number;
}

export interface ForNode {
	type: 'For';
	initializer?: ASTNode;
	condition?: ASTNode;
	update?: ASTNode;
	body: ASTNode;
	line: number;
}

export interface ReturnNode {
	type: 'Return';
	value?: ASTNode;
	line: number;
}

export interface BreakNode {
	type: 'Break';
	line: number;
}

export interface CallNode {
	type: 'Call';
	callee: string;
	args: ASTNode[];
	line: number;
}

export interface BinaryNode {
	type: 'Binary';
	left: ASTNode;
	operator: string;
	right: ASTNode;
	line: number;
}

export interface UnaryNode {
	type: 'Unary';
	operator: string;
	right: ASTNode;
	line: number;
}

export interface LiteralNode {
	type: 'Literal';
	value: string | number | boolean | null;
	valueType: 'inteiro' | 'real' | 'cadeia' | 'caracter' | 'logico';
	line: number;
}

export interface IdentifierNode {
	type: 'Identifier';
	name: string;
	line: number;
}

export class Parser {
	private tokens: Token[];
	private current = 0;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
	}

	private peek(): Token {
		return this.tokens[this.current];
	}

	private isAtEnd(): boolean {
		return this.peek().type === 'EOF';
	}

	private check(type: TokenType): boolean {
		if (this.isAtEnd()) return false;
		return this.peek().type === type;
	}

	private advance(): Token {
		if (!this.isAtEnd()) this.current++;
		return this.tokens[this.current - 1];
	}

	private match(...types: TokenType[]): boolean {
		for (const type of types) {
			if (this.check(type)) {
				this.advance();
				return true;
			}
		}
		return false;
	}

	private consume(type: TokenType, message: string): Token {
		if (this.check(type)) return this.advance();
		const t = this.peek();
		throw new Error(
			`Erro de Sintaxe na linha ${t.line}, coluna ${t.column}: ${message} (encontrado '${t.value}')`
		);
	}

	private assertVisualgBlockStartsOnNextLine(openingToken: Token, keyword: string) {
		const next = this.peek();
		if (!this.isAtEnd() && next.line === openingToken.line) {
			throw new Error(
				`Erro de Sintaxe na linha ${openingToken.line}: Depois de '${keyword}', comece o bloco na próxima linha.`
			);
		}
	}

	private assertVisualgStatementLine(previousLine: number | undefined, nextToken: Token) {
		if (previousLine !== undefined && nextToken.line === previousLine) {
			throw new Error(
				`Erro de Sintaxe na linha ${nextToken.line}: Cada comando deve ficar em sua própria linha.`
			);
		}
	}

	private parseVisualgStatementListUntil(...terminators: TokenType[]): ASTNode[] {
		const statements: ASTNode[] = [];
		let previousLine: number | undefined;

		while (!terminators.some((type) => this.check(type)) && !this.isAtEnd()) {
			if (this.match('SEMICOLON')) continue;
			this.assertVisualgStatementLine(previousLine, this.peek());
			const statement = this.parseVisualgStatement();
			statements.push(statement);
			previousLine = statement.line;
		}

		if (!this.isAtEnd()) {
			this.assertVisualgStatementLine(previousLine, this.peek());
		}

		return statements;
	}

	public parse(): ProgramNode {
		if (this.check('ALGORITMO')) {
			return this.parseVisualg();
		}

		let line = 1;
		const declarations: (FunctionDeclNode | VarDeclNode)[] = [];

		if (this.check('PROGRAM')) {
			const progToken = this.consume('PROGRAM', "Esperado palavra-chave 'programa'");
			line = progToken.line;
			this.consume('LBRACE', "Esperado '{' após 'programa'");
			while (!this.check('RBRACE') && !this.isAtEnd()) {
				declarations.push(this.parseDeclaration());
			}
			this.consume(
				'RBRACE',
				`Esperado '}' para fechar o bloco 'programa' iniciado na linha ${progToken.line}`
			);
		} else {
			// Permite escrever funções diretamente sem a casca "programa" para simplicidade
			while (!this.isAtEnd()) {
				declarations.push(this.parseDeclaration());
			}
		}

		return { type: 'Program', declarations, line };
	}

	private parseDeclaration(): FunctionDeclNode | VarDeclNode {
		const t = this.peek();
		if (t.type === 'FUNCTION') {
			return this.parseFunctionDeclaration();
		} else if (t.type === 'TYPE') {
			return this.parseVariableDeclaration();
		}
		throw new Error(
			`Erro de Sintaxe na linha ${t.line}: Esperado declaração de variável ou função.`
		);
	}

	private parseFunctionDeclaration(): FunctionDeclNode {
		const funcToken = this.consume('FUNCTION', "Esperado 'funcao'");
		let returnType = 'vazio';
		if (this.check('TYPE')) {
			returnType = this.advance().value;
		}

		const nameToken = this.consume('IDENTIFIER', 'Esperado identificador do nome da função');
		this.consume('LPAREN', "Esperado '(' após o nome da função");

		const params: { type: string; name: string }[] = [];
		if (!this.check('RPAREN')) {
			do {
				const pTypeToken = this.consume('TYPE', 'Esperado tipo do parâmetro');
				const pNameToken = this.consume('IDENTIFIER', 'Esperado nome do parâmetro');
				params.push({ type: pTypeToken.value, name: pNameToken.value });
			} while (this.match('COMMA'));
		}

		this.consume('RPAREN', "Esperado ')' após os parâmetros");
		const body = this.parseBlock();

		return {
			type: 'FunctionDecl',
			name: nameToken.value,
			returnType,
			params,
			body,
			line: funcToken.line
		};
	}

	private parseVariableDeclaration(): VarDeclNode {
		const typeToken = this.consume('TYPE', 'Esperado tipo da variável');
		const nameToken = this.consume('IDENTIFIER', 'Esperado nome da variável');

		let initializer: ASTNode | undefined;
		if (this.match('ASSIGN')) {
			initializer = this.parseExpression();
		}

		// Consome ponto e vírgula se houver (opcional)
		this.match('SEMICOLON');

		return {
			type: 'VarDecl',
			varType: typeToken.value,
			name: nameToken.value,
			initializer,
			line: typeToken.line
		};
	}

	private parseBlock(): BlockNode {
		const braceToken = this.consume('LBRACE', "Esperado '{'");
		const statements: ASTNode[] = [];
		while (!this.check('RBRACE') && !this.isAtEnd()) {
			statements.push(this.parseStatement());
		}
		this.consume('RBRACE', `Esperado '}' para fechar o bloco iniciado na linha ${braceToken.line}`);
		return { type: 'Block', statements, line: braceToken.line };
	}

	private parseStatement(): ASTNode {
		const t = this.peek();
		if (t.type === 'LBRACE') {
			return this.parseBlock();
		}
		if (t.type === 'TYPE') {
			return this.parseVariableDeclaration();
		}
		if (t.type === 'IF') {
			return this.parseIfStatement();
		}
		if (t.type === 'WHILE') {
			return this.parseWhileStatement();
		}
		if (t.type === 'FOR') {
			return this.parseForStatement();
		}
		if (t.type === 'RETURN') {
			return this.parseReturnStatement();
		}

		// Caso contrário, é uma atribuição ou chamada de função
		const expr = this.parseExpression();
		this.match('SEMICOLON'); // consome ponto e vírgula opcional

		// Se a expressão for uma atribuição ou chamada, retorna ela mesma como statement
		return expr;
	}

	private parseIfStatement(): IfNode {
		const ifToken = this.consume('IF', "Esperado 'se'");
		this.consume('LPAREN', "Esperado '(' após 'se'");
		const condition = this.parseExpression();
		this.consume('RPAREN', "Esperado ')' após a condição do 'se'");

		const thenBranch = this.parseStatement();
		let elseBranch: ASTNode | undefined;
		if (this.match('ELSE')) {
			elseBranch = this.parseStatement();
		}

		return {
			type: 'If',
			condition,
			thenBranch,
			elseBranch,
			line: ifToken.line
		};
	}

	private parseWhileStatement(): WhileNode {
		const whileToken = this.consume('WHILE', "Esperado 'enquanto'");
		this.consume('LPAREN', "Esperado '(' após 'enquanto'");
		const condition = this.parseExpression();
		this.consume('RPAREN', "Esperado ')' após a condição");
		const body = this.parseStatement();

		return {
			type: 'While',
			condition,
			body,
			line: whileToken.line
		};
	}

	private parseForStatement(): ForNode {
		const forToken = this.consume('FOR', "Esperado 'para'");
		this.consume('LPAREN', "Esperado '(' após 'para'");

		let initializer: ASTNode | undefined;
		if (!this.check('SEMICOLON')) {
			if (this.check('TYPE')) {
				initializer = this.parseVariableDeclaration();
			} else {
				initializer = this.parseExpression();
			}
		} else {
			this.advance(); // consome o ponto e vírgula
		}

		let condition: ASTNode | undefined;
		if (!this.check('SEMICOLON')) {
			condition = this.parseExpression();
		}
		this.consume('SEMICOLON', "Esperado ';' na seção de condição do 'para'");

		let update: ASTNode | undefined;
		if (!this.check('RPAREN')) {
			update = this.parseExpression();
		}
		this.consume('RPAREN', "Esperado ')' após o cabeçalho do 'para'");

		const body = this.parseStatement();

		return {
			type: 'For',
			initializer,
			condition,
			update,
			body,
			line: forToken.line
		};
	}

	private parseReturnStatement(): ReturnNode {
		const returnToken = this.consume('RETURN', "Esperado 'retorne'");
		let value: ASTNode | undefined;
		if (!this.check('SEMICOLON') && !this.check('RBRACE')) {
			value = this.parseExpression();
		}
		this.match('SEMICOLON');
		return { type: 'Return', value, line: returnToken.line };
	}

	private parseExpression(): ASTNode {
		return this.parseAssignment();
	}

	private parseAssignment(): ASTNode {
		const expr = this.parseOr();

		if (this.match('ASSIGN')) {
			const equalsToken = this.tokens[this.current - 1];
			const value = this.parseAssignment();

			if (expr.type === 'Identifier') {
				return {
					type: 'Assign',
					name: expr.name,
					value,
					line: equalsToken.line
				};
			}
			throw new Error(
				`Erro de Sintaxe na linha ${equalsToken.line}: Destino da atribuição inválido.`
			);
		}

		return expr;
	}

	private parseOr(): ASTNode {
		let expr = this.parseAnd();
		while (this.match('OR', 'XOR')) {
			const op = this.tokens[this.current - 1];
			const right = this.parseAnd();
			expr = { type: 'Binary', left: expr, operator: op.value, right, line: op.line };
		}
		return expr;
	}

	private parseAnd(): ASTNode {
		let expr = this.parseEquality();
		while (this.match('AND')) {
			const op = this.tokens[this.current - 1];
			const right = this.parseEquality();
			expr = { type: 'Binary', left: expr, operator: op.value, right, line: op.line };
		}
		return expr;
	}

	private parseEquality(): ASTNode {
		let expr = this.parseComparison();
		while (this.match('EQ', 'NEQ')) {
			const op = this.tokens[this.current - 1];
			const right = this.parseComparison();
			expr = { type: 'Binary', left: expr, operator: op.value, right, line: op.line };
		}
		return expr;
	}

	private parseComparison(): ASTNode {
		let expr = this.parseTerm();
		while (this.match('LT', 'GT', 'LTE', 'GTE')) {
			const op = this.tokens[this.current - 1];
			const right = this.parseTerm();
			expr = { type: 'Binary', left: expr, operator: op.value, right, line: op.line };
		}
		return expr;
	}

	private parseTerm(): ASTNode {
		let expr = this.parseFactor();
		while (this.match('PLUS', 'MINUS')) {
			const op = this.tokens[this.current - 1];
			const right = this.parseFactor();
			expr = { type: 'Binary', left: expr, operator: op.value, right, line: op.line };
		}
		return expr;
	}

	private parseFactor(): ASTNode {
		let expr = this.parseUnary();
		while (this.match('STAR', 'SLASH', 'PERCENT')) {
			const op = this.tokens[this.current - 1];
			const right = this.parseUnary();
			expr = { type: 'Binary', left: expr, operator: op.value, right, line: op.line };
		}
		return expr;
	}

	private parseUnary(): ASTNode {
		if (this.match('MINUS', 'NOT')) {
			const op = this.tokens[this.current - 1];
			const right = this.parseUnary();
			return { type: 'Unary', operator: op.value, right, line: op.line };
		}
		return this.parsePrimary();
	}

	private parsePrimary(): ASTNode {
		const t = this.peek();

		if (this.match('FALSE')) {
			return { type: 'Literal', value: false, valueType: 'logico', line: t.line };
		}
		if (this.match('TRUE')) {
			return { type: 'Literal', value: true, valueType: 'logico', line: t.line };
		}
		if (this.match('NUMBER')) {
			const val = Number(t.value);
			const isReal = t.value.includes('.');
			return {
				type: 'Literal',
				value: val,
				valueType: isReal ? 'real' : 'inteiro',
				line: t.line
			};
		}
		if (this.match('STRING')) {
			return { type: 'Literal', value: t.value, valueType: 'cadeia', line: t.line };
		}
		if (this.match('CHAR')) {
			return { type: 'Literal', value: t.value, valueType: 'caracter', line: t.line };
		}

		if (this.match('IDENTIFIER')) {
			const name = t.value;
			// Chamada de função
			if (this.match('LPAREN')) {
				const args: ASTNode[] = [];
				if (!this.check('RPAREN')) {
					do {
						args.push(this.parseExpression());
					} while (this.match('COMMA'));
				}
				this.consume('RPAREN', "Esperado ')' após argumentos");
				return { type: 'Call', callee: name, args, line: t.line };
			}
			return { type: 'Identifier', name, line: t.line };
		}

		if (this.match('LPAREN')) {
			const expr = this.parseExpression();
			this.consume('RPAREN', "Esperado ')'");
			return expr;
		}

		throw new Error(
			`Erro de Sintaxe na linha ${t.line}: Expressão esperada, encontrado '${t.value}'`
		);
	}

	// ==========================================
	// Visualg Dialect Parser Extensions
	// ==========================================

	private parseVisualg(): ProgramNode {
		const declarations: (FunctionDeclNode | VarDeclNode)[] = [];

		const algoToken = this.consume('ALGORITMO', "Esperado palavra-chave 'algoritmo'");
		const line = algoToken.line;

		// Nome do algoritmo opcional
		if (this.check('STRING') || this.check('IDENTIFIER')) {
			this.advance();
		}

		// Seção de declaração de variáveis
		if (this.match('VAR')) {
			while (!this.check('INICIO') && !this.isAtEnd()) {
				// Ignora quebras de linha/semicolons soltos
				if (this.match('SEMICOLON')) continue;
				declarations.push(...this.parseVisualgVarDecls());
			}
		}

		this.consume('INICIO', "Esperado palavra-chave 'inicio'");

		const statements = this.parseVisualgStatementListUntil('FIMALGORITMO');

		this.consume(
			'FIMALGORITMO',
			`Esperado 'fimalgoritmo' para fechar o algoritmo iniciado na linha ${algoToken.line}`
		);

		// Embrulha os statements em uma função principal 'inicio()'
		const mainFunc: FunctionDeclNode = {
			type: 'FunctionDecl',
			name: 'inicio',
			returnType: 'vazio',
			params: [],
			body: {
				type: 'Block',
				statements,
				line: algoToken.line
			},
			line: algoToken.line
		};

		declarations.push(mainFunc);

		return { type: 'Program', declarations, line };
	}

	private parseVisualgVarDecls(): VarDeclNode[] {
		const ids: Token[] = [];
		do {
			ids.push(this.consume('IDENTIFIER', 'Esperado identificador de variável'));
		} while (this.match('COMMA'));

		this.consume('COLON', "Esperado ':' após identificadores de variáveis");
		const typeToken = this.consume('TYPE', 'Esperado tipo da variável');

		return ids.map((id) => ({
			type: 'VarDecl',
			varType: typeToken.value,
			name: id.value,
			line: id.line
		}));
	}

	private parseVisualgStatement(): ASTNode {
		const t = this.peek();

		if (t.type === 'VAR') {
			throw new Error(
				`Erro na linha ${t.line}: Declarações de variáveis devem estar no bloco 'var'.`
			);
		}
		if (t.type === 'IF') {
			return this.parseVisualgIf();
		}
		if (t.type === 'WHILE') {
			return this.parseVisualgWhile();
		}
		if (t.type === 'REPITA') {
			return this.parseVisualgRepeat();
		}
		if (t.type === 'ESCOLHA') {
			return this.parseVisualgSwitch();
		}
		if (t.type === 'FOR') {
			return this.parseVisualgFor();
		}
		if (t.type === 'BREAK') {
			const breakToken = this.advance();
			return { type: 'Break', line: breakToken.line };
		}

		const expr = this.parseExpression();
		return expr;
	}

	private parseVisualgIf(): IfNode {
		const ifToken = this.consume('IF', "Esperado 'se'");
		const condition = this.parseExpression();
		const thenToken = this.consume('ENTAO', "Esperado 'entao' após a condição do 'se'");
		this.assertVisualgBlockStartsOnNextLine(thenToken, thenToken.value);

		const thenStatements = this.parseVisualgStatementListUntil('ELSE', 'FIMSE');

		const thenBranch: BlockNode = {
			type: 'Block',
			statements: thenStatements,
			line: ifToken.line
		};

		let elseBranch: ASTNode | undefined;
		if (this.check('ELSE')) {
			const elseToken = this.advance();
			this.assertVisualgBlockStartsOnNextLine(elseToken, elseToken.value);
			const elseStatements = this.parseVisualgStatementListUntil('FIMSE');
			elseBranch = {
				type: 'Block',
				statements: elseStatements,
				line: ifToken.line
			};
		}

		this.consume(
			'FIMSE',
			`Esperado 'fimse' para fechar o bloco 'se' iniciado na linha ${ifToken.line}`
		);

		return {
			type: 'If',
			condition,
			thenBranch,
			elseBranch,
			line: ifToken.line
		};
	}

	private parseVisualgWhile(): WhileNode {
		const whileToken = this.consume('WHILE', "Esperado 'enquanto'");
		const condition = this.parseExpression();
		const doToken = this.consume('FACA', "Esperado 'faca' após a condição do 'enquanto'");
		this.assertVisualgBlockStartsOnNextLine(doToken, doToken.value);

		const bodyStatements = this.parseVisualgStatementListUntil('FIMENQUANTO');
		this.consume(
			'FIMENQUANTO',
			`Esperado 'fimenquanto' para fechar o loop 'enquanto' iniciado na linha ${whileToken.line}`
		);

		const body: BlockNode = {
			type: 'Block',
			statements: bodyStatements,
			line: whileToken.line
		};

		return {
			type: 'While',
			condition,
			body,
			line: whileToken.line
		};
	}

	private parseVisualgRepeat(): RepeatNode {
		const repeatToken = this.consume('REPITA', "Esperado 'repita'");
		this.assertVisualgBlockStartsOnNextLine(repeatToken, repeatToken.value);

		const bodyStatements = this.parseVisualgStatementListUntil('ATE');
		this.consume(
			'ATE',
			`Esperado 'ate' para fechar o loop 'repita' iniciado na linha ${repeatToken.line}`
		);
		const condition = this.parseExpression();

		const body: BlockNode = {
			type: 'Block',
			statements: bodyStatements,
			line: repeatToken.line
		};

		return {
			type: 'Repeat',
			body,
			condition,
			line: repeatToken.line
		};
	}

	private parseVisualgSwitch(): SwitchNode {
		const switchToken = this.consume('ESCOLHA', "Esperado 'escolha'");
		const discriminant = this.parseExpression();
		this.assertVisualgBlockStartsOnNextLine(switchToken, switchToken.value);

		const cases: SwitchNode['cases'] = [];
		let defaultBody: BlockNode | undefined;

		while (!this.check('FIMESCOLHA') && !this.isAtEnd()) {
			if (this.check('CASO')) {
				const caseToken = this.advance();
				const test = this.parseExpression();
				this.assertVisualgBlockStartsOnNextLine(caseToken, caseToken.value);
				const bodyStatements = this.parseVisualgStatementListUntil(
					'CASO',
					'OUTROCASO',
					'FIMESCOLHA'
				);
				cases.push({
					test,
					body: { type: 'Block', statements: bodyStatements, line: caseToken.line },
					line: caseToken.line
				});
				continue;
			}

			if (this.check('OUTROCASO')) {
				const defaultToken = this.advance();
				this.assertVisualgBlockStartsOnNextLine(defaultToken, defaultToken.value);
				const bodyStatements = this.parseVisualgStatementListUntil('FIMESCOLHA');
				defaultBody = { type: 'Block', statements: bodyStatements, line: defaultToken.line };
				continue;
			}

			const token = this.peek();
			throw new Error(
				`Erro de Sintaxe na linha ${token.line}: Esperado 'caso', 'outrocaso' ou 'fimescolha' no bloco 'escolha'.`
			);
		}

		this.consume(
			'FIMESCOLHA',
			`Esperado 'fimescolha' para fechar o bloco 'escolha' iniciado na linha ${switchToken.line}`
		);

		return {
			type: 'Switch',
			discriminant,
			cases,
			defaultBody,
			line: switchToken.line
		};
	}

	private parseVisualgFor(): ForNode {
		const forToken = this.consume('FOR', "Esperado 'para'");
		const idToken = this.consume('IDENTIFIER', "Esperado identificador na inicialização do 'para'");
		this.consume('DE', "Esperado 'de' após identificador");
		const startExpr = this.parseExpression();
		this.consume('ATE', "Esperado 'ate' após a expressão inicial");
		const endExpr = this.parseExpression();

		let stepExpr: ASTNode = {
			type: 'Literal',
			value: 1,
			valueType: 'inteiro',
			line: forToken.line
		};

		if (this.match('PASSO')) {
			stepExpr = this.parseExpression();
		}

		const doToken = this.consume('FACA', "Esperado 'faca' antes do bloco de comandos do 'para'");
		this.assertVisualgBlockStartsOnNextLine(doToken, doToken.value);

		const bodyStatements = this.parseVisualgStatementListUntil('FIMPARA');
		this.consume(
			'FIMPARA',
			`Esperado 'fimpara' para fechar o loop 'para' iniciado na linha ${forToken.line}`
		);

		// Transpila a lógica do loop para a estrutura AST do clássico ForNode
		const initializer: AssignNode = {
			type: 'Assign',
			name: idToken.value,
			value: startExpr,
			line: forToken.line
		};

		const condition: BinaryNode = {
			type: 'Binary',
			left: { type: 'Identifier', name: idToken.value, line: forToken.line },
			operator: '<=',
			right: endExpr,
			line: forToken.line
		};

		const update: AssignNode = {
			type: 'Assign',
			name: idToken.value,
			value: {
				type: 'Binary',
				left: { type: 'Identifier', name: idToken.value, line: forToken.line },
				operator: '+',
				right: stepExpr,
				line: forToken.line
			},
			line: forToken.line
		};

		const body: BlockNode = {
			type: 'Block',
			statements: bodyStatements,
			line: forToken.line
		};

		return {
			type: 'For',
			initializer,
			condition,
			update,
			body,
			line: forToken.line
		};
	}
}

// Environment Scope
export class Environment {
	private values = new Map<string, unknown>();
	private types = new Map<string, string>();
	private parent?: Environment;

	constructor(parent?: Environment) {
		this.parent = parent;
	}

	public define(name: string, value: unknown, varType?: string) {
		if (varType) {
			this.types.set(name, varType);
		}
		this.values.set(name, this.coerceValue(name, value));
	}

	public get(name: string, line: number): unknown {
		if (this.values.has(name)) {
			return this.values.get(name);
		}
		if (this.parent) {
			return this.parent.get(name, line);
		}
		throw new Error(
			`Erro em Tempo de Execução na linha ${line}: Variável '${name}' não foi declarada.`
		);
	}

	public assign(name: string, value: unknown, line: number) {
		if (this.values.has(name)) {
			this.values.set(name, this.coerceValue(name, value));
			return;
		}
		if (this.parent) {
			this.parent.assign(name, value, line);
			return;
		}
		throw new Error(
			`Erro em Tempo de Execução na linha ${line}: Variável '${name}' não declarada.`
		);
	}

	public getType(name: string): string | undefined {
		if (this.types.has(name)) {
			return this.types.get(name);
		}
		if (this.parent) {
			return this.parent.getType(name);
		}
		return undefined;
	}

	private coerceValue(name: string, value: unknown): unknown {
		if (value === undefined) return value;

		const type = this.getType(name);
		switch (type) {
			case 'inteiro': {
				const parsed = Number(value);
				return Number.isNaN(parsed) ? 0 : Math.trunc(parsed);
			}
			case 'real': {
				const parsed = Number(value);
				return Number.isNaN(parsed) ? 0 : parsed;
			}
			case 'logico': {
				if (typeof value === 'boolean') return value;
				const normalized = String(value).trim().toLowerCase();
				return normalized === 'verdadeiro' || normalized === 'true';
			}
			case 'caracter':
			case 'caractere':
				return String(value).charAt(0);
			case 'cadeia':
				return String(value);
			default:
				return value;
		}
	}

	public getVariables(): Record<string, { value: unknown; type: string }> {
		const vars: Record<string, { value: unknown; type: string }> = {};
		if (this.parent) {
			Object.assign(vars, this.parent.getVariables());
		}
		for (const [k, v] of this.values.entries()) {
			const type = this.getType(k) || 'desconhecido';
			vars[k] = { value: v, type };
		}
		return vars;
	}
}

// Custom runtime exception to handle returns in AST interpreter generator
class ReturnException {
	public value: unknown;
	constructor(value: unknown) {
		this.value = value;
	}
}

class BreakException {
	public line: number;
	constructor(line: number) {
		this.line = line;
	}
}

// AST Tree-Walking Interpreter using JavaScript Generator
export class Interpreter {
	private globalEnv = new Environment();
	private functions = new Map<string, FunctionDeclNode>();
	private outputs: string[] = [];
	private debugMode = false;

	constructor(debugMode = false) {
		this.debugMode = debugMode;
	}

	public getOutputs(): string[] {
		return this.outputs;
	}

	public clearOutputs() {
		this.outputs = [];
	}

	private runtimeType(value: unknown): string {
		if (value === undefined || value === null) return 'vazio';
		if (typeof value === 'number') return 'numero';
		if (typeof value === 'string') return 'texto';
		if (typeof value === 'boolean') return 'logico';
		return typeof value;
	}

	private assertNumberOperands(operator: string, left: unknown, right: unknown, line: number) {
		if (typeof left !== 'number' || typeof right !== 'number') {
			throw new Error(
				`Erro em Tempo de Execução na linha ${line}: O operador '${operator}' espera valores numéricos.`
			);
		}
	}

	private assertBooleanOperands(operator: string, left: unknown, right: unknown, line: number) {
		if (typeof left !== 'boolean' || typeof right !== 'boolean') {
			throw new Error(
				`Erro em Tempo de Execução na linha ${line}: O operador '${operator}' espera valores lógicos.`
			);
		}
	}

	private assertEqualityOperands(operator: string, left: unknown, right: unknown, line: number) {
		const leftType = this.runtimeType(left);
		const rightType = this.runtimeType(right);
		if (leftType !== rightType) {
			throw new Error(
				`Erro em Tempo de Execução na linha ${line}: Não é possível comparar ${leftType} com ${rightType} usando '${operator}'.`
			);
		}
	}

	private expectArgCount(
		callee: string,
		actual: number,
		expected: number | number[],
		line: number
	) {
		const validCounts = Array.isArray(expected) ? expected : [expected];
		if (!validCounts.includes(actual)) {
			const expectedText =
				validCounts.length === 1 ? String(validCounts[0]) : validCounts.join(' ou ');
			throw new Error(
				`Erro na linha ${line}: Função '${callee}' espera ${expectedText} argumento(s), recebeu ${actual}.`
			);
		}
	}

	private requireNumberArg(
		callee: string,
		value: unknown,
		argNumber: number,
		line: number
	): number {
		if (typeof value !== 'number') {
			throw new Error(
				`Erro na linha ${line}: Função '${callee}' espera argumento ${argNumber} numérico.`
			);
		}
		return value;
	}

	private requireTextArg(callee: string, value: unknown, argNumber: number, line: number): string {
		if (typeof value !== 'string') {
			throw new Error(
				`Erro na linha ${line}: Função '${callee}' espera argumento ${argNumber} textual.`
			);
		}
		return value;
	}

	private getRandomBounds(
		callee: string,
		args: unknown[],
		line: number,
		options: { allowZeroArgs: boolean; integer: boolean }
	) {
		this.expectArgCount(callee, args.length, options.allowZeroArgs ? [0, 1, 2] : [1, 2], line);

		const min = args.length === 2 ? this.requireNumberArg(callee, args[0], 1, line) : 0;
		const max =
			args.length === 0
				? 1
				: this.requireNumberArg(callee, args.length === 2 ? args[1] : args[0], args.length, line);
		const lower = options.integer ? Math.trunc(min) : min;
		const upper = options.integer ? Math.trunc(max) : max;

		if (upper <= lower) {
			throw new Error(
				`Erro na linha ${line}: Função '${callee}' espera limite superior maior que o inferior.`
			);
		}

		return { lower, upper };
	}

	private *evaluateArgs(node: CallNode, env: Environment): Generator<unknown, unknown[], unknown> {
		const values: unknown[] = [];
		for (const arg of node.args) {
			values.push(yield* this.evaluate(arg, env));
		}
		return values;
	}

	// Generator execution entry point
	public *run(program: ProgramNode) {
		this.globalEnv = new Environment();
		this.functions.clear();
		this.outputs = [];

		// Primeiro, registra funções e variáveis globais
		for (const decl of program.declarations) {
			if (decl.type === 'FunctionDecl') {
				this.functions.set(decl.name, decl);
			} else if (decl.type === 'VarDecl') {
				const value = decl.initializer
					? yield* this.evaluate(decl.initializer, this.globalEnv)
					: undefined;
				this.globalEnv.define(decl.name, value, decl.varType);
			}
		}

		// Executa a funcao 'inicio'
		const mainFunc = this.functions.get('inicio');
		if (!mainFunc) {
			// Se não houver função 'inicio', executa as declarações diretamente
			return;
		}

		try {
			yield* this.executeFunction(mainFunc, [], this.globalEnv);
		} catch (err) {
			if (err instanceof ReturnException) {
				return err.value;
			}
			if (err instanceof BreakException) {
				throw new Error(
					`Erro em Tempo de Execução na linha ${err.line}: 'interrompa' só pode ser usado dentro de um laço.`,
					{ cause: err }
				);
			}
			throw err;
		}
	}

	private *executeFunction(func: FunctionDeclNode, args: unknown[], outerEnv: Environment) {
		const env = new Environment(outerEnv);

		// Vincula parâmetros
		for (let i = 0; i < func.params.length; i++) {
			env.define(func.params[i].name, args[i], func.params[i].type);
		}

		yield* this.executeBlock(func.body, env);
	}

	private *executeBlock(block: BlockNode, env: Environment) {
		for (const stmt of block.statements) {
			yield* this.execute(stmt, env);
		}
	}

	private *execute(node: ASTNode, env: Environment): Generator<unknown, void, unknown> {
		if (this.debugMode && node.line) {
			// Yielda o estado atual para o debugger visual pausar e destacar a linha
			yield {
				type: 'step',
				line: node.line,
				variables: env.getVariables()
			};
		}

		switch (node.type) {
			case 'Block':
				yield* this.executeBlock(node, env);
				break;
			case 'VarDecl': {
				const value = node.initializer ? yield* this.evaluate(node.initializer, env) : undefined;
				env.define(node.name, value, node.varType);
				break;
			}
			case 'Assign': {
				const value = yield* this.evaluate(node.value, env);
				env.assign(node.name, value, node.line);
				break;
			}
			case 'If': {
				const cond = yield* this.evaluate(node.condition, env);
				if (cond) {
					yield* this.execute(node.thenBranch, env);
				} else if (node.elseBranch) {
					yield* this.execute(node.elseBranch, env);
				}
				break;
			}
			case 'While':
				while (yield* this.evaluate(node.condition, env)) {
					try {
						yield* this.execute(node.body, env);
					} catch (err) {
						if (err instanceof BreakException) break;
						throw err;
					}
				}
				break;
			case 'Repeat':
				do {
					try {
						yield* this.execute(node.body, env);
					} catch (err) {
						if (err instanceof BreakException) break;
						throw err;
					}
				} while (!(yield* this.evaluate(node.condition, env)));
				break;
			case 'Switch': {
				const discriminant = yield* this.evaluate(node.discriminant, env);
				let matched = false;
				for (const caseNode of node.cases) {
					const test = yield* this.evaluate(caseNode.test, env);
					this.assertEqualityOperands('caso', discriminant, test, caseNode.line);
					if (discriminant === test) {
						yield* this.execute(caseNode.body, env);
						matched = true;
						break;
					}
				}
				if (!matched && node.defaultBody) {
					yield* this.execute(node.defaultBody, env);
				}
				break;
			}
			case 'For': {
				const forEnv = new Environment(env);
				if (node.initializer) {
					yield* this.execute(node.initializer, forEnv);
				}
				while (true) {
					if (node.condition) {
						const cond = yield* this.evaluate(node.condition, forEnv);
						if (!cond) break;
					}
					try {
						yield* this.execute(node.body, forEnv);
					} catch (err) {
						if (err instanceof BreakException) break;
						throw err;
					}
					if (node.update) {
						yield* this.execute(node.update, forEnv);
					}
				}
				break;
			}
			case 'Return': {
				const val = node.value ? yield* this.evaluate(node.value, env) : undefined;
				throw new ReturnException(val);
			}
			case 'Break':
				throw new BreakException(node.line);
			case 'Call':
				yield* this.evaluateCall(node, env);
				break;
			default:
				// Expressões soltas tratadas como avaliações simples
				yield* this.evaluate(node, env);
				break;
		}
	}

	private *evaluate(node: ASTNode, env: Environment): Generator<unknown, unknown, unknown> {
		switch (node.type) {
			case 'Literal':
				return node.value;
			case 'Identifier':
				if (node.name.toLowerCase() === 'pi') {
					return Math.PI;
				}
				return env.get(node.name, node.line);
			case 'Binary': {
				const left = yield* this.evaluate(node.left, env);
				const right = yield* this.evaluate(node.right, env);
				switch (node.operator) {
					case '+':
						if (typeof left === 'string' || typeof right === 'string') {
							return String(left) + String(right);
						}
						this.assertNumberOperands(node.operator, left, right, node.line);
						return (left as number) + (right as number);
					case '-':
						this.assertNumberOperands(node.operator, left, right, node.line);
						return (left as number) - (right as number);
					case '*':
						this.assertNumberOperands(node.operator, left, right, node.line);
						return (left as number) * (right as number);
					case '/':
						this.assertNumberOperands(node.operator, left, right, node.line);
						if (right === 0) {
							throw new Error(`Erro em Tempo de Execução na linha ${node.line}: Divisão por zero.`);
						}
						return (left as number) / (right as number);
					case '%':
						this.assertNumberOperands(node.operator, left, right, node.line);
						return (left as number) % (right as number);
					case '==':
					case '=':
						this.assertEqualityOperands(node.operator, left, right, node.line);
						return left === right;
					case '!=':
					case '<>':
						this.assertEqualityOperands(node.operator, left, right, node.line);
						return left !== right;
					case '<':
						this.assertNumberOperands(node.operator, left, right, node.line);
						return (left as number) < (right as number);
					case '>':
						this.assertNumberOperands(node.operator, left, right, node.line);
						return (left as number) > (right as number);
					case '<=':
						this.assertNumberOperands(node.operator, left, right, node.line);
						return (left as number) <= (right as number);
					case '>=':
						this.assertNumberOperands(node.operator, left, right, node.line);
						return (left as number) >= (right as number);
					case 'e':
						this.assertBooleanOperands(node.operator, left, right, node.line);
						return !!((left as boolean) && (right as boolean));
					case 'ou':
						this.assertBooleanOperands(node.operator, left, right, node.line);
						return !!((left as boolean) || (right as boolean));
					case 'xou':
						this.assertBooleanOperands(node.operator, left, right, node.line);
						return (left as boolean) !== (right as boolean);
					default:
						throw new Error(`Operador binário inválido '${node.operator}' na linha ${node.line}`);
				}
			}
			case 'Unary': {
				const right = yield* this.evaluate(node.right, env);
				switch (node.operator) {
					case '-':
						if (typeof right !== 'number') {
							throw new Error(
								`Erro em Tempo de Execução na linha ${node.line}: O operador '-' espera valor numérico.`
							);
						}
						return -(right as number);
					case 'nao':
						if (typeof right !== 'boolean') {
							throw new Error(
								`Erro em Tempo de Execução na linha ${node.line}: O operador 'nao' espera valor lógico.`
							);
						}
						return !(right as boolean);
					default:
						throw new Error(`Operador unário inválido '${node.operator}' na linha ${node.line}`);
				}
			}
			case 'Call':
				return yield* this.evaluateCall(node, env);
			default:
				throw new Error(`Nó inválido na árvore de expressões: ${node.type}`);
		}
	}

	private *evaluateCall(node: CallNode, env: Environment): Generator<unknown, unknown, unknown> {
		// Funções embutidas
		const lowerCallee = node.callee.toLowerCase();
		if (lowerCallee === 'escreva' || lowerCallee === 'escreval') {
			const outputs: string[] = [];
			for (const arg of node.args) {
				const val = yield* this.evaluate(arg, env);
				outputs.push(val === undefined ? 'vazio' : String(val));
			}
			if (lowerCallee === 'escreval') {
				outputs.push('\n');
			}
			const printed = outputs.join('');
			this.outputs.push(printed);
			// Yielda um evento de saída para o terminal UI atualizar
			yield { type: 'write', value: printed };
			return;
		}

		if (lowerCallee === 'leia') {
			if (node.args.length !== 1 || node.args[0].type !== 'Identifier') {
				throw new Error(
					`Erro na linha ${node.line}: O comando 'leia' deve receber exatamente um identificador.`
				);
			}
			const varName = (node.args[0] as IdentifierNode).name;
			// Verifica se a variável existe antes de solicitar input
			env.get(varName, node.line);
			// Yielda um evento de entrada solicitando o dado ao usuário.
			// O runner interceptará isso, mostrará a tela de entrada e chamará .next(valor) para prosseguir
			const input = yield { type: 'read', variable: varName };
			env.assign(varName, input, node.line);
			return;
		}

		if (lowerCallee === 'limpa' || lowerCallee === 'limpatela') {
			this.outputs = [];
			yield { type: 'clear' };
			return;
		}

		if (lowerCallee === 'mod') {
			this.expectArgCount(node.callee, node.args.length, 2, node.line);
			const args = yield* this.evaluateArgs(node, env);
			return (
				this.requireNumberArg(node.callee, args[0], 1, node.line) %
				this.requireNumberArg(node.callee, args[1], 2, node.line)
			);
		}

		if (['abs', 'raizq', 'quad', 'int'].includes(lowerCallee)) {
			this.expectArgCount(node.callee, node.args.length, 1, node.line);
			const [value] = yield* this.evaluateArgs(node, env);
			const numberValue = this.requireNumberArg(node.callee, value, 1, node.line);
			if (lowerCallee === 'abs') return Math.abs(numberValue);
			if (lowerCallee === 'raizq') return Math.sqrt(numberValue);
			if (lowerCallee === 'quad') return numberValue * numberValue;
			return Math.trunc(numberValue);
		}

		if (lowerCallee === 'pot') {
			this.expectArgCount(node.callee, node.args.length, 2, node.line);
			const args = yield* this.evaluateArgs(node, env);
			return Math.pow(
				this.requireNumberArg(node.callee, args[0], 1, node.line),
				this.requireNumberArg(node.callee, args[1], 2, node.line)
			);
		}

		if (['compr', 'maiusc', 'minusc'].includes(lowerCallee)) {
			this.expectArgCount(node.callee, node.args.length, 1, node.line);
			const [value] = yield* this.evaluateArgs(node, env);
			const text = this.requireTextArg(node.callee, value, 1, node.line);
			if (lowerCallee === 'compr') return text.length;
			if (lowerCallee === 'maiusc') return text.toUpperCase();
			return text.toLowerCase();
		}

		if (lowerCallee === 'copia') {
			this.expectArgCount(node.callee, node.args.length, 3, node.line);
			const args = yield* this.evaluateArgs(node, env);
			const text = this.requireTextArg(node.callee, args[0], 1, node.line);
			const start = Math.trunc(this.requireNumberArg(node.callee, args[1], 2, node.line));
			const count = Math.trunc(this.requireNumberArg(node.callee, args[2], 3, node.line));
			return text.slice(Math.max(0, start - 1), Math.max(0, start - 1) + Math.max(0, count));
		}

		if (lowerCallee === 'pos') {
			this.expectArgCount(node.callee, node.args.length, 2, node.line);
			const args = yield* this.evaluateArgs(node, env);
			const needle = this.requireTextArg(node.callee, args[0], 1, node.line);
			const text = this.requireTextArg(node.callee, args[1], 2, node.line);
			const index = text.indexOf(needle);
			return index === -1 ? 0 : index + 1;
		}

		if (lowerCallee === 'rand' || lowerCallee === 'randi') {
			const args = yield* this.evaluateArgs(node, env);
			const { lower, upper } = this.getRandomBounds(node.callee, args, node.line, {
				allowZeroArgs: lowerCallee === 'rand',
				integer: lowerCallee === 'randi'
			});
			const value = lower + Math.random() * (upper - lower);
			return lowerCallee === 'randi' ? Math.floor(value) : value;
		}

		// Função do usuário
		const func = this.functions.get(node.callee);
		if (!func) {
			throw new Error(`Erro na linha ${node.line}: Função '${node.callee}' não foi declarada.`);
		}

		if (func.params.length !== node.args.length) {
			throw new Error(
				`Erro na linha ${node.line}: Número incorreto de argumentos para a função '${node.callee}'. Esperado ${func.params.length}, recebido ${node.args.length}.`
			);
		}

		const evaluatedArgs: unknown[] = [];
		for (const arg of node.args) {
			evaluatedArgs.push(yield* this.evaluate(arg, env));
		}

		try {
			yield* this.executeFunction(func, evaluatedArgs, this.globalEnv);
		} catch (err) {
			if (err instanceof ReturnException) {
				return err.value;
			}
			throw err;
		}
		return undefined;
	}
}

// AST Semantic Analyzer / Validator
export class SemanticValidator {
	private scopes: Set<string>[] = [];

	constructor() {}

	private pushScope() {
		this.scopes.push(new Set());
	}

	private popScope() {
		this.scopes.pop();
	}

	private declare(name: string) {
		if (this.scopes.length === 0) {
			this.pushScope();
		}
		const current = this.scopes[this.scopes.length - 1];
		current.add(name);
	}

	private isDeclared(name: string): boolean {
		for (let i = this.scopes.length - 1; i >= 0; i--) {
			if (this.scopes[i].has(name)) {
				return true;
			}
		}
		return false;
	}

	public validate(program: ProgramNode) {
		this.scopes = [];
		this.pushScope(); // Global scope

		// Primeiro, registra variáveis globais
		for (const decl of program.declarations) {
			if (decl.type === 'VarDecl') {
				this.declare(decl.name);
			}
		}

		// Valida funções
		for (const decl of program.declarations) {
			if (decl.type === 'FunctionDecl') {
				this.validateFunction(decl);
			}
		}
	}

	private validateFunction(func: FunctionDeclNode) {
		this.pushScope(); // Escopo da função
		for (const param of func.params) {
			this.declare(param.name);
		}
		this.validateNode(func.body);
		this.popScope();
	}

	private validateNode(node: ASTNode) {
		switch (node.type) {
			case 'Block':
				for (const stmt of node.statements) {
					this.validateNode(stmt);
				}
				break;
			case 'VarDecl':
				if (node.initializer) {
					this.validateNode(node.initializer);
				}
				this.declare(node.name);
				break;
			case 'Assign':
				if (!this.isDeclared(node.name)) {
					throw new Error(
						`Erro de Semântica na linha ${node.line}: A variável '${node.name}' não foi declarada.`
					);
				}
				this.validateNode(node.value);
				break;
			case 'If':
				this.validateNode(node.condition);
				this.validateNode(node.thenBranch);
				if (node.elseBranch) {
					this.validateNode(node.elseBranch);
				}
				break;
			case 'While':
				this.validateNode(node.condition);
				this.validateNode(node.body);
				break;
			case 'For':
				this.pushScope();
				if (node.initializer) this.validateNode(node.initializer);
				if (node.condition) this.validateNode(node.condition);
				if (node.update) this.validateNode(node.update);
				this.validateNode(node.body);
				this.popScope();
				break;
			case 'Return':
				if (node.value) {
					this.validateNode(node.value);
				}
				break;
			case 'Call': {
				const lowerCallee = node.callee.toLowerCase();
				if (lowerCallee === 'leia') {
					if (node.args.length !== 1 || node.args[0].type !== 'Identifier') {
						throw new Error(
							`Erro na linha ${node.line}: O comando 'leia' deve receber exatamente um identificador.`
						);
					}
					const varName = (node.args[0] as IdentifierNode).name;
					if (!this.isDeclared(varName)) {
						throw new Error(
							`Erro de Semântica na linha ${node.line}: A variável '${varName}' não foi declarada.`
						);
					}
				} else {
					for (const arg of node.args) {
						this.validateNode(arg);
					}
				}
				break;
			}
			case 'Binary':
				this.validateNode(node.left);
				this.validateNode(node.right);
				break;
			case 'Unary':
				this.validateNode(node.right);
				break;
			case 'Identifier':
				if (!this.isDeclared(node.name)) {
					throw new Error(
						`Erro de Semântica na linha ${node.line}: A variável '${node.name}' não foi declarada.`
					);
				}
				break;
			case 'Literal':
				break;
		}
	}
}

// Identation Checker
export function checkIndentation(code: string): {
	ok: boolean;
	line?: number;
	expected?: number;
	actual?: number;
	errorMsg?: string;
} {
	const lines = code.split('\n');
	let expected = 0;

	// Detect if tabs or spaces are primarily used
	let usesTabs = false;
	let usesSpaces = false;
	for (const line of lines) {
		if (line.startsWith('\t')) usesTabs = true;
		else if (line.startsWith(' ')) usesSpaces = true;
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();
		if (!trimmed) continue; // Skip empty lines

		const lower = trimmed.toLowerCase();

		// Reduce indent level if block closer
		if (
			lower.startsWith('fimalgoritmo') ||
			lower === 'var' ||
			lower === 'inicio' ||
			lower === 'fimse' ||
			lower === 'fimenquanto' ||
			lower === 'fimpara' ||
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

		// Count actual indent levels
		let actual = 0;
		if (usesTabs) {
			let j = 0;
			while (j < line.length && line[j] === '\t') {
				actual++;
				j++;
			}
		} else if (usesSpaces) {
			let j = 0;
			while (j < line.length && line[j] === ' ') {
				actual++;
				j++;
			}
			actual = Math.floor(actual / 4);
		}

		if (actual !== expected) {
			const indentCharName = usesTabs ? 'TABs' : 'espaços (múltiplos de 4)';
			return {
				ok: false,
				line: i + 1,
				expected,
				actual,
				errorMsg: `Erro de Formatação na linha ${i + 1}: Indentação incorreta. Esperado ${expected} ${indentCharName}, obtido ${actual}.`
			};
		}

		// Increase indent level for subsequent lines if block opener
		if (
			lower.startsWith('algoritmo') ||
			lower === 'var' ||
			lower === 'inicio' ||
			lower.endsWith('{') ||
			lower.endsWith('entao') ||
			lower.endsWith('então') ||
			lower.endsWith('faca') ||
			lower.endsWith('faça') ||
			lower.startsWith('senao') ||
			lower.startsWith('senão')
		) {
			expected++;
		}
	}

	return { ok: true };
}
