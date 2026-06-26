import { Lexer, Parser, Interpreter } from '../dist/utils/portugol/interpreter.js';

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

console.log('All Portugol core tests passed successfully.');
