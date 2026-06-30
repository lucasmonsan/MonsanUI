import {
	Lexer,
	Parser,
	Interpreter,
	SemanticValidator,
	checkIndentation
} from '../dist/utils/portugol/interpreter.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function assertEquals(actual, expected, message) {
	if (actual !== expected) {
		throw new Error(
			`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
		);
	}
}

console.log('Running Portugol Lexer tests...');
{
	const lexer = new Lexer(`
		programa {
			funcao inicio() {
				inteiro x = 10
				escreva("Valor: ", x)
			}
		}
	`);
	const tokens = lexer.tokenize();
	assert(tokens.length > 0, 'Should return tokens');
	assertEquals(tokens[0].type, 'PROGRAM');
	assertEquals(tokens[1].type, 'LBRACE');
}

console.log('Running Portugol Parser tests...');
{
	const lexer = new Lexer(`
		programa {
			funcao inicio() {
				inteiro x = 10
				se (x == 10) {
					escreva("sucesso")
				} senao {
					escreva("falha")
				}
			}
		}
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	assertEquals(ast.type, 'Program');
	assertEquals(ast.declarations.length, 1);
	assertEquals(ast.declarations[0].type, 'FunctionDecl');
	assertEquals(ast.declarations[0].name, 'inicio');
}

console.log('Running Portugol Interpreter Execution tests...');
{
	const lexer = new Lexer(`
		programa {
			funcao inicio() {
				inteiro x = 5
				inteiro y = 2
				inteiro soma = x + y
				escreva("Soma: ", soma)
			}
		}
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const interpreter = new Interpreter(false);
	const gen = interpreter.run(ast);

	// Executa o gerador até o final
	let result = gen.next();
	while (!result.done) {
		result = gen.next();
	}

	const outputs = interpreter.getOutputs();
	assertEquals(outputs.length, 1);
	assertEquals(outputs[0], 'Soma: 7');
}

console.log('Running Portugol Interpreter Step/Debug tests...');
{
	const lexer = new Lexer(`
		programa {
			funcao inicio() {
				inteiro a = 1
				inteiro b = 2
			}
		}
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const interpreter = new Interpreter(true); // debugMode = true
	const gen = interpreter.run(ast);

	const steps = [];
	let result = gen.next();
	while (!result.done) {
		if (result.value && result.value.type === 'step') {
			steps.push(result.value);
		}
		result = gen.next();
	}

	// Deve ter yieldado passos nas linhas das variáveis
	assert(steps.length >= 2, 'Should yield debug steps');
	// Passo 1: linha do "inteiro a = 1" (linha 4)
	assertEquals(steps[0].line, 4);
	// Passo 2: linha do "inteiro b = 2" (linha 5)
	assertEquals(steps[1].line, 5);
}

console.log('Running Portugol Interpreter I/O (leia) tests...');
{
	const lexer = new Lexer(`
		programa {
			funcao inicio() {
				inteiro idade = 0
				escreva("digite: ")
				leia(idade)
				escreva("Idade mais 5: ", idade + 5)
			}
		}
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const interpreter = new Interpreter(false);
	const gen = interpreter.run(ast);

	let result = gen.next();
	let readYieldFound = false;

	while (!result.done) {
		const val = result.value;
		if (val && val.type === 'read') {
			assertEquals(val.variable, 'idade');
			readYieldFound = true;
			// Fornece o input simulado
			result = gen.next('25');
		} else {
			result = gen.next();
		}
	}

	assert(readYieldFound, 'Should prompt for input via leia');
	const outputs = interpreter.getOutputs();
	assertEquals(outputs.length, 2);
	assertEquals(outputs[0], 'digite: ');
	assertEquals(outputs[1], 'Idade mais 5: 30');
}

{
	const lexer = new Lexer(`
		programa {
			funcao inicio() {
				inteiro idade = 0
				real preco = 0.0
				cadeia nome = ""
				caracter inicial = ""
				logico ativo = falso

				leia(idade)
				leia(preco)
				leia(nome)
				leia(inicial)
				leia(ativo)

				escreva(idade + 1, "|", preco + 0.5, "|", nome + 1, "|", inicial, "|")
				se (ativo) {
					escreva("sim")
				} senao {
					escreva("nao")
				}
			}
		}
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const interpreter = new Interpreter(false);
	const gen = interpreter.run(ast);
	const inputs = ['14.9', '14.5', '14', 'Lucas', 'verdadeiro'];

	let result = gen.next();
	while (!result.done) {
		const val = result.value;
		result = val && val.type === 'read' ? gen.next(inputs.shift()) : gen.next();
	}

	const outputs = interpreter.getOutputs();
	assertEquals(outputs.length, 2);
	assertEquals(outputs[0], '15|15|141|L|');
	assertEquals(outputs[1], 'sim');
}

console.log('Running Visualg Dialect Execution tests...');
{
	const lexer = new Lexer(`
		algoritmo "Nome"
		var

		inicio
			escreval("Lucas Monsan")
		fimalgoritmo
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const interpreter = new Interpreter(false);
	const gen = interpreter.run(ast);
	let result = gen.next();
	while (!result.done) {
		result = gen.next();
	}
	const outputs = interpreter.getOutputs();
	assertEquals(outputs.length, 1);
	assertEquals(outputs[0], 'Lucas Monsan\n');
}

{
	const lexer = new Lexer(`
		algoritmo "Calculo"
		var
			a, b : inteiro
			resultado : real
		inicio
			a <- 10
			b <- 3
			resultado <- a / b
			se resultado > 3 entao
				escreva("resultado maior que 3: ", resultado)
			senao
				escreva("resultado menor: ", resultado)
			fimse
		fimalgoritmo
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const interpreter = new Interpreter(false);
	const gen = interpreter.run(ast);
	let result = gen.next();
	while (!result.done) {
		result = gen.next();
	}
	const outputs = interpreter.getOutputs();
	assertEquals(outputs.length, 1);
	assertEquals(outputs[0], 'resultado maior que 3: 3.3333333333333335');
}

console.log('Running Visualg leia undeclared variable check...');
{
	const lexer = new Lexer(`
		algoritmo "ErroLeia"
		var
		inicio
			leia(nome)
		fimalgoritmo
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const interpreter = new Interpreter(false);
	const gen = interpreter.run(ast);

	let threw = false;
	try {
		gen.next();
	} catch (e) {
		threw = true;
		assert(e.message.includes('não foi declarada'), 'Should throw variable not declared error');
	}
	assert(threw, 'Should have thrown an error before prompt');
}

console.log('Running Visualg typed assignment coercion tests...');
{
	const lexer = new Lexer(`
		algoritmo "Tipos"
		var
			valor : inteiro
		inicio
			valor <- 14.9
			escreva(valor + 1)
		fimalgoritmo
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const interpreter = new Interpreter(false);
	const gen = interpreter.run(ast);

	let result = gen.next();
	while (!result.done) {
		result = gen.next();
	}

	const outputs = interpreter.getOutputs();
	assertEquals(outputs.length, 1);
	assertEquals(outputs[0], '15');
}

{
	const lexer = new Lexer(`
		algoritmo "LeiaTipos"
		var
			idade : inteiro
			preco : real
			nome : cadeia
			inicial : caractere
			ativo : logico
		inicio
			leia(idade)
			leia(preco)
			leia(nome)
			leia(inicial)
			leia(ativo)
			escreva(idade + 1, "|", preco + 0.5, "|", nome + 1, "|", inicial, "|")
			se ativo entao
				escreva("sim")
			senao
				escreva("nao")
			fimse
		fimalgoritmo
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const interpreter = new Interpreter(false);
	const gen = interpreter.run(ast);
	const inputs = ['14.9', '14.5', '14', 'Lucas', 'verdadeiro'];

	let result = gen.next();
	while (!result.done) {
		const val = result.value;
		result = val && val.type === 'read' ? gen.next(inputs.shift()) : gen.next();
	}

	const outputs = interpreter.getOutputs();
	assertEquals(outputs.length, 2);
	assertEquals(outputs[0], '15|15|141|L|');
	assertEquals(outputs[1], 'sim');
}

console.log('Running SemanticValidator tests...');
{
	const lexer = new Lexer(`
		algoritmo "ErroSemantico"
		var
			x : inteiro
		inicio
			x <- 10
			y <- 20
		fimalgoritmo
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const validator = new SemanticValidator();

	let threw = false;
	try {
		validator.validate(ast);
	} catch (e) {
		threw = true;
		assert(e.message.includes('y'), 'Should detect y as undeclared');
		assert(e.message.includes('Erro de Semântica'), 'Should flag as Erro de Semântica');
	}
	assert(threw, 'Should throw semantic error on validation phase');
}

{
	const lexer = new Lexer(`
		algoritmo "SemanticoSucesso"
		var
			x, y : inteiro
		inicio
			x <- 10
			y <- x + 5
		fimalgoritmo
	`);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	const ast = parser.parse();
	const validator = new SemanticValidator();

	let threw = false;
	try {
		validator.validate(ast);
	} catch {
		threw = true;
	}
	assert(!threw, 'Valid program should validate without errors');
}

console.log('Running Indentation Checker tests...');
{
	const code = `algoritmo "Sucesso"
var
	x : inteiro
inicio
	x <- 10
fimalgoritmo`;
	const result = checkIndentation(code);
	assert(result.ok, 'Should pass on correctly indented code');
}

{
	const code = `algoritmo "Erro"
var
x : inteiro
inicio
	x <- 10
fimalgoritmo`;
	const result = checkIndentation(code);
	assert(!result.ok, 'Should fail on incorrectly indented code');
	assertEquals(result.line, 3, 'Should detect error on line 3');
}

console.log('All Portugol core tests passed successfully.');
