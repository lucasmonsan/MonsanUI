import {
	Lexer,
	Parser,
	Interpreter,
	SemanticValidator,
	checkIndentation
} from '../dist/utils/portugol/interpreter.js';
import {
	getSupportedVisualgReferenceNames,
	getVisualgReferenceItem,
	visualgReferenceItems
} from '../dist/utils/portugol/reference.js';
import {
	getVisualgOfficialExample,
	visualgOfficialExamples
} from '../dist/utils/portugol/examples.js';
import {
	getPortugolEditorIndentColumns,
	getPortugolNextLineIndent,
	PORTUGOL_EDITOR_CARET_COLOR
} from '../dist/utils/portugol/editor.js';

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

function assertApprox(actual, expected, tolerance = 1e-10, message) {
	if (Math.abs(actual - expected) > tolerance) {
		throw new Error(
			`${message || 'Assertion failed'}: expected ${expected} within ${tolerance}, got ${actual}`
		);
	}
}

function parseProgram(code) {
	const lexer = new Lexer(code);
	const tokens = lexer.tokenize();
	const parser = new Parser(tokens);
	return parser.parse();
}

function runProgram(code, inputs = []) {
	const ast = parseProgram(code);
	const interpreter = new Interpreter(false);
	const gen = interpreter.run(ast);
	const pendingInputs = [...inputs];
	let result = gen.next();
	while (!result.done) {
		const val = result.value;
		result = val && val.type === 'read' ? gen.next(pendingInputs.shift()) : gen.next();
	}
	return interpreter.getOutputs();
}

function runProgramWithOptions(code, options, inputs = []) {
	const ast = parseProgram(code);
	const interpreter = new Interpreter(false, options);
	const gen = interpreter.run(ast);
	const pendingInputs = [...inputs];
	let result = gen.next();
	while (!result.done) {
		const val = result.value;
		result = val && val.type === 'read' ? gen.next(pendingInputs.shift()) : gen.next();
	}
	return interpreter.getOutputs();
}

function assertThrowsMessage(fn, expectedMessage, message) {
	let threw = false;
	try {
		fn();
	} catch (e) {
		threw = true;
		assert(e.message.includes(expectedMessage), message || `Should include ${expectedMessage}`);
	}
	assert(threw, message || 'Should throw');
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

console.log('Running Portugol identifier validation tests...');
{
	const lexer = new Lexer(`
		programa {
			funcao inicio() {
				inteiro ação = 10
			}
		}
	`);

	let threw = false;
	try {
		lexer.tokenize();
	} catch (e) {
		threw = true;
		assert(e.message.includes('Identificador inválido'), 'Should reject accented identifiers');
		assert(e.message.includes('ação'), 'Should include the invalid identifier in the error');
	}
	assert(threw, 'Should reject identifiers with accents');
}

{
	const lexer = new Lexer(`
		algoritmo "ErroIdentificador"
		var
			maçã : inteiro
		inicio
			escreva("erro")
		fimalgoritmo
	`);

	let threw = false;
	try {
		lexer.tokenize();
	} catch (e) {
		threw = true;
		assert(
			e.message.includes('Identificador inválido'),
			'Should reject Visualg identifiers with cedilla'
		);
		assert(e.message.includes('maçã'), 'Should include the invalid identifier in the error');
	}
	assert(threw, 'Should reject Visualg identifiers with cedilla');
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

{
	const lexer = new Lexer(`
		programa {
			funcao inicio() {
				escreva("A")
				escreva("B")
				escreval("C")
				escreva("D")
			}
		}
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
	assertEquals(outputs.join(''), 'ABC\nD');
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
	assertEquals(outputs[0], '15|15|141|Lucas|');
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
	assertEquals(outputs[0], '15|15|141|Lucas|');
	assertEquals(outputs[1], 'sim');
}

console.log('Running Visualg strict block syntax tests...');
{
	assertThrowsMessage(
		() =>
			parseProgram(`
				algoritmo "InlineSe"
				var
					nota : inteiro
				inicio
					nota <- 70
					se nota >= 60 entao escreval("Aprovado")
					fimse
				fimalgoritmo
			`),
		"Depois de 'entao', comece o bloco na próxima linha.",
		'Should reject inline command after entao'
	);
}

{
	assertThrowsMessage(
		() =>
			parseProgram(`
				algoritmo "ComandosMesmaLinha"
				var
				inicio
					escreva("A") escreva("B")
				fimalgoritmo
			`),
		'Cada comando deve ficar em sua própria linha.',
		'Should reject multiple commands in the same Visualg line'
	);
}

{
	assertThrowsMessage(
		() =>
			parseProgram(`
				algoritmo "FechamentoMesmaLinha"
				var
				inicio
					escreva("A") fimalgoritmo
			`),
		'Cada comando deve ficar em sua própria linha.',
		'Should reject closing block in the same line as a command'
	);
}

console.log('Running Visualg declaration and comparison tests...');
{
	const outputs = runProgram(`
		algoritmo "DeclaracaoMultipla"
		var
			idade, faltas : inteiro
			nota, media : real
			nome, turma : caractere
			ativo, aprovado : logico
		inicio
			idade <- 14
			faltas <- 2
			nota <- 8.5
			media <- 7
			nome <- "Lucas"
			turma <- "A"
			ativo <- verdadeiro
			aprovado <- falso
			se idade > faltas entao
				escreva("numeros|")
			fimse
			se nota >= media entao
				escreva("misto|")
			fimse
			se nome = "Lucas" entao
				escreva("texto|")
			fimse
			se ativo <> aprovado entao
				escreva("logico")
			fimse
		fimalgoritmo
	`);
	assertEquals(outputs.join(''), 'numeros|misto|texto|logico');
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ComparacaoInvalidaTextoNumero"
				var
					nome : caractere
					idade : inteiro
				inicio
					nome <- "Lucas"
					idade <- 14
					se nome = idade entao
						escreva("invalido")
					fimse
				fimalgoritmo
			`),
		'Não é possível comparar texto com numero',
		'Should reject equality between text and number'
	);
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ComparacaoInvalidaRelacional"
				var
					nome : caractere
					idade : inteiro
				inicio
					nome <- "Lucas"
					idade <- 14
					se nome > idade entao
						escreva("invalido")
					fimse
				fimalgoritmo
			`),
		"O operador '>' espera valores numéricos.",
		'Should reject relational comparison between text and number'
	);
}

console.log('Running Visualg xor operator tests...');
{
	const outputs = runProgram(`
		algoritmo "Xou"
		var
		inicio
			se verdadeiro xou falso entao
				escreva("vf|")
			fimse
			se verdadeiro xou verdadeiro entao
				escreva("erro|")
			senao
				escreva("vv|")
			fimse
			se falso xou falso entao
				escreva("erro")
			senao
				escreva("ff")
			fimse
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), 'vf|vv|ff');
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroXou"
				var
				inicio
					se verdadeiro xou 1 entao
						escreva("invalido")
					fimse
				fimalgoritmo
			`),
		"O operador 'xou' espera valores lógicos.",
		'Should reject non-boolean xor operands'
	);
}

console.log('Running Visualg repeat loop tests...');
{
	const outputs = runProgram(`
		algoritmo "Repita"
		var
			contador : inteiro
		inicio
			contador <- 0
			repita
				contador <- contador + 1
				escreva(contador)
			ate contador = 3
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), '123');
}

{
	const outputs = runProgram(`
		algoritmo "RepitaUmaVez"
		var
			contador : inteiro
		inicio
			contador <- 5
			repita
				escreva("uma")
			ate contador > 0
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), 'uma');
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "RepitaInline"
				var
				inicio
					repita escreva("invalido")
					ate verdadeiro
				fimalgoritmo
			`),
		"Depois de 'repita', comece o bloco na próxima linha.",
		'Should reject inline command after repita'
	);
}

console.log('Running Visualg break statement tests...');
{
	const outputs = runProgram(`
		algoritmo "InterrompaEnquanto"
		var
			contador : inteiro
		inicio
			contador <- 0
			enquanto contador < 5 faca
				contador <- contador + 1
				se contador = 3 entao
					interrompa
				fimse
				escreva(contador)
			fimenquanto
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), '12');
}

{
	const outputs = runProgram(`
		algoritmo "InterrompaRepita"
		var
			contador : inteiro
		inicio
			contador <- 0
			repita
				contador <- contador + 1
				se contador = 2 entao
					interrompa
				fimse
				escreva(contador)
			ate contador = 5
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), '1');
}

{
	const outputs = runProgram(`
		algoritmo "InterrompaPara"
		var
			contador : inteiro
		inicio
			para contador de 1 ate 5 faca
				se contador = 4 entao
					interrompa
				fimse
				escreva(contador)
			fimpara
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), '123');
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "InterrompaFora"
				var
				inicio
					interrompa
				fimalgoritmo
			`),
		"'interrompa' só pode ser usado dentro de um laço.",
		'Should reject break outside loops'
	);
}

console.log('Running Visualg switch statement tests...');
{
	const outputs = runProgram(`
		algoritmo "Escolha"
		var
			opcao : inteiro
		inicio
			opcao <- 2
			escolha opcao
				caso 1
					escreva("um")
				caso 2
					escreva("dois")
				caso 3
					escreva("tres")
				outrocaso
					escreva("outro")
			fimescolha
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), 'dois');
}

{
	const outputs = runProgram(`
		algoritmo "EscolhaOutro"
		var
			opcao : caractere
		inicio
			opcao <- "C"
			escolha opcao
				caso "A"
					escreva("a")
				caso "B"
					escreva("b")
				outrocaso
					escreva("outro")
			fimescolha
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), 'outro');
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "EscolhaInline"
				var
					opcao : inteiro
				inicio
					opcao <- 1
					escolha opcao caso 1
						escreva("invalido")
					fimescolha
				fimalgoritmo
			`),
		"Depois de 'escolha', comece o bloco na próxima linha.",
		'Should reject inline case after escolha'
	);
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "EscolhaTipoInvalido"
				var
					opcao : inteiro
				inicio
					opcao <- 1
					escolha opcao
						caso "A"
							escreva("invalido")
					fimescolha
				fimalgoritmo
			`),
		"Não é possível comparar numero com texto usando 'caso'.",
		'Should reject case comparisons with incompatible types'
	);
}

console.log('Running Visualg essential function tests...');
{
	const outputs = runProgram(`
		algoritmo "FuncoesEssenciais"
		var
			texto : cadeia
		inicio
			texto <- "Crocode"
			escreva(abs(-5), "|")
			escreva(raizq(9), "|")
			escreva(pot(2, 3), "|")
			escreva(quad(4), "|")
			escreva(int(8.9), "|")
			escreva(10 mod 3, "|")
			escreva(mod(10, 4), "|")
			escreva(10 div 3, "|")
			escreva(div(11, 4), "|")
			escreva(compr(texto), "|")
			escreva(maiusc("abc"), "|")
			escreva(minusc("ABC"), "|")
			escreva(copia(texto, 2, 3), "|")
			escreva(pos("code", texto), "|")
			escreva(pos("x", texto), "|")
			se pi > 3 entao
				escreva("pi")
			fimse
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), '5|3|8|16|8|1|2|3|2|7|ABC|abc|roc|4|0|pi');
}

{
	const outputs = runProgram(`
		algoritmo "LimpaTela"
		var
		inicio
			escreva("antes")
			limpatela()
			escreva("depois")
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), 'depois');
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroFuncoes"
				var
				inicio
					escreva(abs("texto"))
				fimalgoritmo
			`),
		"Função 'abs' espera argumento 1 numérico.",
		'Should reject invalid numeric function argument'
	);
}

console.log('Running Visualg random function tests...');
{
	for (let attempt = 0; attempt < 100; attempt += 1) {
		const outputs = runProgram(`
			algoritmo "Sorteio"
			var
			inicio
				escreva(rand(), "|")
				escreva(rand(10), "|")
				escreva(rand(5, 10), "|")
				escreva(randi(10), "|")
				escreva(randi(1, 7))
			fimalgoritmo
		`);
		const [randDefault, randMax, randRange, randiMax, randiRange] = outputs
			.join('')
			.split('|')
			.map(Number);

		assert(randDefault >= 0 && randDefault < 1, 'rand() should be >= 0 and < 1');
		assert(randMax >= 0 && randMax < 10, 'rand(10) should be >= 0 and < 10');
		assert(randRange >= 5 && randRange < 10, 'rand(5, 10) should be >= 5 and < 10');
		assert(Number.isInteger(randiMax), 'randi(10) should return an integer');
		assert(randiMax >= 0 && randiMax < 10, 'randi(10) should be >= 0 and < 10');
		assert(Number.isInteger(randiRange), 'randi(1, 7) should return an integer');
		assert(randiRange >= 1 && randiRange < 7, 'randi(1, 7) should be >= 1 and < 7');
	}
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroRandiVazio"
				var
				inicio
					escreva(randi())
				fimalgoritmo
			`),
		"Função 'randi' espera 1 ou 2 argumento(s)",
		'Should reject randi without arguments'
	);
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroRandTipo"
				var
				inicio
					escreva(rand("dez"))
				fimalgoritmo
			`),
		"Função 'rand' espera argumento 1 numérico.",
		'Should reject invalid rand argument type'
	);
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroRandIntervalo"
				var
				inicio
					escreva(rand(10, 10))
				fimalgoritmo
			`),
		"Função 'rand' espera limite superior maior que o inferior.",
		'Should reject empty random range'
	);
}

console.log('Running Visualg math function tests...');
{
	const outputs = runProgram(`
		algoritmo "FuncoesMatematicas"
		var
		inicio
			escreva(log(exp(1)), "|")
			escreva(sen(pi / 2), "|")
			escreva(cos(0), "|")
			escreva(tan(0), "|")
			escreva(cotan(pi / 4), "|")
			escreva(arcsen(1), "|")
			escreva(arccos(1))
		fimalgoritmo
	`);

	const [logValue, sinValue, cosValue, tanValue, cotanValue, arcsenValue, arccosValue] = outputs
		.join('')
		.split('|')
		.map(Number);

	assertApprox(logValue, 1, 1e-10, 'log(exp(1)) should be 1');
	assertApprox(sinValue, 1, 1e-10, 'sen(pi / 2) should be 1');
	assertApprox(cosValue, 1, 1e-10, 'cos(0) should be 1');
	assertApprox(tanValue, 0, 1e-10, 'tan(0) should be 0');
	assertApprox(cotanValue, 1, 1e-10, 'cotan(pi / 4) should be 1');
	assertApprox(arcsenValue, Math.PI / 2, 1e-10, 'arcsen(1) should be pi / 2');
	assertApprox(arccosValue, 0, 1e-10, 'arccos(1) should be 0');
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroLogZero"
				var
				inicio
					escreva(log(0))
				fimalgoritmo
			`),
		"Função 'log' espera argumento maior que zero.",
		'Should reject log of zero'
	);
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroArcsenDominio"
				var
				inicio
					escreva(arcsen(2))
				fimalgoritmo
			`),
		"Função 'arcsen' espera argumento entre -1 e 1.",
		'Should reject arcsen outside domain'
	);
}

console.log('Running Visualg character conversion tests...');
{
	const outputs = runProgram(`
		algoritmo "ConversoesCaracter"
		var
			inteiroConvertido : inteiro
		inicio
			escreva(asc("A"), "|")
			escreva(carac(65), "|")
			escreva(carac(randi(65, 66)), "|")
			escreva(numpcarac(28.165), "|")
			escreva(caracpnum("15"), "|")
			escreva(caracpnum("28.165"), "|")
			inteiroConvertido <- caracpnum("16.24")
			escreva(inteiroConvertido)
		fimalgoritmo
	`);

	assertEquals(outputs.join(''), '65|A|A|28.165|15|28.165|16');
}

{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroAscTexto"
				var
				inicio
					escreva(asc("AB"))
				fimalgoritmo
			`),
		"Função 'asc' espera argumento 1 com exatamente um caractere.",
		'Should reject asc with more than one character'
	);
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroCaracTipo"
				var
				inicio
					escreva(carac("A"))
				fimalgoritmo
			`),
		"Função 'carac' espera argumento 1 numérico.",
		'Should reject carac with non-number argument'
	);
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroCaracPNumTexto"
				var
				inicio
					escreva(caracpnum("18 dias"))
				fimalgoritmo
			`),
		"Função 'caracpnum' espera texto contendo apenas um número válido com ponto decimal opcional.",
		'Should reject mixed text in caracpnum'
	);
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroCaracPNumEspaco"
				var
				inicio
					escreva(caracpnum(" 55"))
				fimalgoritmo
			`),
		"Função 'caracpnum' espera texto contendo apenas um número válido com ponto decimal opcional.",
		'Should reject whitespace in caracpnum'
	);
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "ErroCaracPNumVirgula"
				var
				inicio
					escreva(caracpnum("10,5"))
				fimalgoritmo
			`),
		"Função 'caracpnum' espera texto contendo apenas um número válido com ponto decimal opcional.",
		'Should reject comma decimal in caracpnum'
	);
}

console.log('Running Visualg reference catalog tests...');
{
	const supportedNames = new Set(
		getSupportedVisualgReferenceNames().map((name) => name.toLowerCase())
	);
	const requiredSupportedNames = [
		'algoritmo',
		'var',
		'inicio',
		'fimalgoritmo',
		'inteiro',
		'real',
		'caractere',
		'caracter',
		'cadeia',
		'logico',
		'se',
		'entao',
		'senao',
		'fimse',
		'enquanto',
		'faca',
		'fimenquanto',
		'repita',
		'interrompa',
		'escolha',
		'caso',
		'outrocaso',
		'fimescolha',
		'para',
		'de',
		'ate',
		'passo',
		'fimpara',
		'leia',
		'escreva',
		'escreval',
		'limpa',
		'limpatela',
		'mod',
		'div',
		'xou',
		'pi',
		'abs',
		'raizq',
		'pot',
		'quad',
		'int',
		'compr',
		'maiusc',
		'minusc',
		'copia',
		'pos',
		'asc',
		'carac',
		'numpcarac',
		'caracpnum',
		'rand',
		'randi',
		'log',
		'exp',
		'sen',
		'cos',
		'tan',
		'cotan',
		'arcsen',
		'arccos'
	];

	for (const name of requiredSupportedNames) {
		assert(supportedNames.has(name), `Reference catalog should include supported name '${name}'`);
	}

	assertEquals(getVisualgReferenceItem('limpatela')?.name, 'limpa');
	assertEquals(getVisualgReferenceItem('randi')?.status, 'supported');
	assertEquals(getVisualgReferenceItem('numpcarac')?.status, 'supported');
	assertEquals(getVisualgReferenceItem('log')?.status, 'supported');
	assertEquals(getVisualgReferenceItem('cos')?.status, 'supported');
	assertEquals(getVisualgReferenceItem('arquivo')?.status, 'out-of-scope');
	assertEquals(getVisualgReferenceItem('pausa')?.status, 'out-of-scope');
	assertEquals(getVisualgReferenceItem('timer')?.status, 'out-of-scope');
	assert(
		visualgReferenceItems.every((item) => item.syntax && item.description),
		'Every reference item should include syntax and description'
	);
}

console.log('Running Visualg unsupported command message tests...');
{
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "out_scope"
				inicio
					arquivo("a.alg")
				fimalgoritmo
			`),
		'Comando Visualg fora do escopo do Crocode: arquivo.',
		'Should explain out-of-scope Visualg commands'
	);
	assertThrowsMessage(
		() =>
			runProgram(`
				algoritmo "out_scope_alias"
				inicio
					timer()
				fimalgoritmo
			`),
		'Comando Visualg fora do escopo do Crocode: cronometro.',
		'Should explain out-of-scope aliases'
	);
}

console.log('Running Visualg official examples tests...');
{
	assert(visualgOfficialExamples.length >= 8, 'Should include official regression examples');
	assertEquals(getVisualgOfficialExample('hello-world')?.status, 'supported');

	const ids = new Set();
	for (const example of visualgOfficialExamples) {
		assert(!ids.has(example.id), `Official example id should be unique: ${example.id}`);
		ids.add(example.id);
		assert(example.title, `Official example ${example.id} should include a title`);
		assert(example.description, `Official example ${example.id} should include a description`);
		assert(example.code, `Official example ${example.id} should include code`);
		assert(example.tags.length > 0, `Official example ${example.id} should include tags`);

		if (example.status === 'supported') {
			assert(
				typeof example.expectedOutput === 'string',
				`Supported example ${example.id} should include expected output`
			);
			const outputs = runProgram(example.code, example.inputs ?? []);
			assertEquals(outputs.join(''), example.expectedOutput, `Example ${example.id} should run`);
		}

		if (example.status === 'error-case') {
			assert(
				example.expectedErrorIncludes,
				`Error example ${example.id} should include expected error text`
			);
			assertThrowsMessage(
				() => runProgram(example.code, example.inputs ?? []),
				example.expectedErrorIncludes,
				`Example ${example.id} should fail with expected error`
			);
		}
	}
}

console.log('Running Visualg execution safety tests...');
{
	assertThrowsMessage(
		() =>
			runProgramWithOptions(
				`
					algoritmo "EnquantoInfinito"
					var
					inicio
						enquanto verdadeiro faca
						fimenquanto
					fimalgoritmo
				`,
				{ maxExecutionSteps: 20 }
			),
		'Limite de execução atingido',
		'Should stop an infinite enquanto loop'
	);

	assertThrowsMessage(
		() =>
			runProgramWithOptions(
				`
					algoritmo "RepitaInfinito"
					var
					inicio
						repita
						ate falso
					fimalgoritmo
				`,
				{ maxExecutionSteps: 20 }
			),
		'Verifique se existe um loop infinito',
		'Should stop an infinite repita loop'
	);

	assertThrowsMessage(
		() =>
			runProgramWithOptions(
				`
					algoritmo "ParaInfinito"
					var
						i : inteiro
					inicio
						para i de 1 ate 10 passo 0 faca
						fimpara
					fimalgoritmo
				`,
				{ maxExecutionSteps: 40 }
			),
		'Limite de execução atingido',
		'Should stop an infinite para loop'
	);
}

console.log('Running Portugol editor behavior tests...');
{
	assertEquals(
		PORTUGOL_EDITOR_CARET_COLOR,
		'var(--text-primary)',
		'Editor caret should use the MonsanUI text color token'
	);
	assertEquals(
		getPortugolNextLineIndent('\tescreva()'),
		'\t',
		'Enter after a command should preserve tab indentation'
	);
	assertEquals(
		getPortugolNextLineIndent('    escreva()'),
		'    ',
		'Enter after a command should preserve space indentation'
	);
	assertEquals(
		getPortugolNextLineIndent('\t'),
		'\t',
		'Enter on an indented empty line should preserve indentation'
	);
	assertEquals(
		getPortugolNextLineIndent('\tse nota >= 6 entao'),
		'\t\t',
		'Enter after entao should enter the inner block'
	);
	assertEquals(
		getPortugolNextLineIndent('\trepita'),
		'\t\t',
		'Enter after repita should enter the inner block'
	);
	assertEquals(
		getPortugolEditorIndentColumns('\tescreva()', ''),
		4,
		'CodeMirror indentation should keep command indentation'
	);
	assertEquals(
		getPortugolEditorIndentColumns('\tse nota >= 6 entao', ''),
		8,
		'CodeMirror indentation should increase after block opener'
	);
	assertEquals(
		getPortugolEditorIndentColumns('\t\tescreval("Aprovado")', 'fimse'),
		4,
		'CodeMirror indentation should reduce before block closer'
	);
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
