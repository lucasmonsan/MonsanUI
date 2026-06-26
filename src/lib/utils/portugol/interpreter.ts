export type TokenType =
	| 'PROGRAM'
	| 'FUNCTION'
	| 'TYPE'
	| 'IF'
	| 'ELSE'
	| 'WHILE'
	| 'FOR'
	| 'RETURN'
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
					} else if (lowerId === 'verdadeiro') {
						tokens.push({ type: 'TRUE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'falso') {
						tokens.push({ type: 'FALSE', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'e') {
						tokens.push({ type: 'AND', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'ou') {
						tokens.push({ type: 'OR', value: id, line: startLine, column: startCol });
					} else if (lowerId === 'nao' || lowerId === 'não') {
						tokens.push({ type: 'NOT', value: id, line: startLine, column: startCol });
					} else if (
						['inteiro', 'real', 'caractere', 'caracter', 'logico', 'cadeia'].includes(lowerId)
					) {
						const normalizedType = lowerId === 'caractere' ? 'caracter' : lowerId;
						tokens.push({ type: 'TYPE', value: normalizedType, line: startLine, column: startCol });
					} else {
						tokens.push({ type: 'IDENTIFIER', value: id, line: startLine, column: startCol });
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
					} else if (lowerId === 'nao' || lowerId === 'não') {
						tokens.push({ type: 'NOT', value: id, line: startLine, column: startCol });
					} else {
						tokens.push({ type: 'IDENTIFIER', value: id, line: startLine, column: startCol });
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
	| ForNode
	| ReturnNode
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
			this.consume('RBRACE', "Esperado '}' no fim do programa");
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
		this.consume('RBRACE', "Esperado '}'");
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
		while (this.match('OR')) {
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

		const statements: ASTNode[] = [];
		while (!this.check('FIMALGORITMO') && !this.isAtEnd()) {
			if (this.match('SEMICOLON')) continue;
			statements.push(this.parseVisualgStatement());
		}

		this.consume('FIMALGORITMO', "Esperado palavra-chave 'fimalgoritmo'");

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
		if (t.type === 'FOR') {
			return this.parseVisualgFor();
		}

		const expr = this.parseExpression();
		return expr;
	}

	private parseVisualgIf(): IfNode {
		const ifToken = this.consume('IF', "Esperado 'se'");
		const condition = this.parseExpression();
		this.consume('ENTAO', "Esperado 'entao' após a condição do 'se'");

		const thenStatements: ASTNode[] = [];
		while (!this.check('ELSE') && !this.check('FIMSE') && !this.isAtEnd()) {
			thenStatements.push(this.parseVisualgStatement());
		}

		const thenBranch: BlockNode = {
			type: 'Block',
			statements: thenStatements,
			line: ifToken.line
		};

		let elseBranch: ASTNode | undefined;
		if (this.match('ELSE')) {
			const elseStatements: ASTNode[] = [];
			while (!this.check('FIMSE') && !this.isAtEnd()) {
				elseStatements.push(this.parseVisualgStatement());
			}
			elseBranch = {
				type: 'Block',
				statements: elseStatements,
				line: ifToken.line
			};
		}

		this.consume('FIMSE', "Esperado 'fimse' para fechar o bloco 'se'");

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
		this.consume('FACA', "Esperado 'faca' após a condição do 'enquanto'");

		const bodyStatements: ASTNode[] = [];
		while (!this.check('FIMENQUANTO') && !this.isAtEnd()) {
			bodyStatements.push(this.parseVisualgStatement());
		}
		this.consume('FIMENQUANTO', "Esperado 'fimenquanto' para fechar o bloco 'enquanto'");

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

		this.consume('FACA', "Esperado 'faca' antes do bloco de comandos do 'para'");

		const bodyStatements: ASTNode[] = [];
		while (!this.check('FIMPARA') && !this.isAtEnd()) {
			bodyStatements.push(this.parseVisualgStatement());
		}
		this.consume('FIMPARA', "Esperado 'fimpara' para fechar o bloco 'para'");

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
	private parent?: Environment;

	constructor(parent?: Environment) {
		this.parent = parent;
	}

	public define(name: string, value: unknown) {
		this.values.set(name, value);
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
			this.values.set(name, value);
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

	public getVariables(): Record<string, unknown> {
		const vars: Record<string, unknown> = {};
		// Mescla escopos recursivamente (mais interno sobrescreve externo se mesmo nome)
		if (this.parent) {
			Object.assign(vars, this.parent.getVariables());
		}
		for (const [k, v] of this.values.entries()) {
			vars[k] = v;
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
				this.globalEnv.define(decl.name, value);
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
			throw err;
		}
	}

	private *executeFunction(func: FunctionDeclNode, args: unknown[], outerEnv: Environment) {
		const env = new Environment(outerEnv);

		// Vincula parâmetros
		for (let i = 0; i < func.params.length; i++) {
			env.define(func.params[i].name, args[i]);
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
				env.define(node.name, value);
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
					yield* this.execute(node.body, env);
				}
				break;
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
					yield* this.execute(node.body, forEnv);
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
				return env.get(node.name, node.line);
			case 'Binary': {
				const left = yield* this.evaluate(node.left, env);
				const right = yield* this.evaluate(node.right, env);
				switch (node.operator) {
					case '+':
						if (typeof left === 'string' || typeof right === 'string') {
							return String(left) + String(right);
						}
						return (left as number) + (right as number);
					case '-':
						return (left as number) - (right as number);
					case '*':
						return (left as number) * (right as number);
					case '/':
						if (right === 0) {
							throw new Error(`Erro em Tempo de Execução na linha ${node.line}: Divisão por zero.`);
						}
						return (left as number) / (right as number);
					case '%':
						return (left as number) % (right as number);
					case '==':
					case '=':
						return left === right;
					case '!=':
					case '<>':
						return left !== right;
					case '<':
						return (left as number) < (right as number);
					case '>':
						return (left as number) > (right as number);
					case '<=':
						return (left as number) <= (right as number);
					case '>=':
						return (left as number) >= (right as number);
					case 'e':
						return !!((left as boolean) && (right as boolean));
					case 'ou':
						return !!((left as boolean) || (right as boolean));
					default:
						throw new Error(`Operador binário inválido '${node.operator}' na linha ${node.line}`);
				}
			}
			case 'Unary': {
				const right = yield* this.evaluate(node.right, env);
				switch (node.operator) {
					case '-':
						return -(right as number);
					case 'nao':
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
			const currentVal = env.get(varName, node.line);
			// Yielda um evento de entrada solicitando o dado ao usuário.
			// O runner interceptará isso, mostrará a tela de entrada e chamará .next(valor) para prosseguir
			const input = yield { type: 'read', variable: varName };
			// Faz o parse do input correspondente ao tipo original
			let parsedInput: unknown = input;
			if (typeof currentVal === 'number') {
				parsedInput = Number(input);
				if (isNaN(parsedInput as number)) parsedInput = 0;
			} else if (typeof currentVal === 'boolean') {
				parsedInput = input === 'verdadeiro' || input === 'true';
			}
			env.assign(varName, parsedInput, node.line);
			return;
		}

		if (lowerCallee === 'limpa') {
			this.outputs = [];
			yield { type: 'clear' };
			return;
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
