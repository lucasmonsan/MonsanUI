export type VisualgOfficialExampleStatus = 'supported' | 'error-case' | 'planned' | 'out-of-scope';

export interface VisualgOfficialExample {
	id: string;
	title: string;
	status: VisualgOfficialExampleStatus;
	compatibility: 'Visualg' | 'Crocode' | 'Planned' | 'Unsupported';
	tags: string[];
	description: string;
	code: string;
	inputs?: string[];
	expectedOutput?: string;
	expectedErrorIncludes?: string;
}

export const visualgOfficialExamples: VisualgOfficialExample[] = [
	{
		id: 'hello-world',
		title: 'Hello World',
		status: 'supported',
		compatibility: 'Visualg',
		tags: ['basic', 'output'],
		description: 'Minimal Visualg program with one output line.',
		code: `algoritmo "hello"
var
inicio
	escreval("Hello World!")
fimalgoritmo`,
		expectedOutput: 'Hello World!\n'
	},
	{
		id: 'multiple-declarations',
		title: 'Multiple declarations',
		status: 'supported',
		compatibility: 'Visualg',
		tags: ['variables', 'types'],
		description: 'Declares multiple variables of the same type on one line.',
		code: `algoritmo "declaracoes"
var
	idade, faltas : inteiro
	nome, turma : caractere
inicio
	idade <- 10
	faltas <- 2
	nome <- "Ana"
	turma <- "B"
	escreva(idade + faltas, "|")
	escreva(nome, "|")
	escreva(turma)
fimalgoritmo`,
		expectedOutput: '12|Ana|B'
	},
	{
		id: 'typed-read',
		title: 'Typed input conversion',
		status: 'supported',
		compatibility: 'Visualg',
		tags: ['input', 'types'],
		description: 'Reads values and converts them according to declared variable types.',
		inputs: ['14', '8.5', 'Lucas'],
		code: `algoritmo "leitura"
var
	idade : inteiro
	media : real
	nome : cadeia
inicio
	leia(idade)
	leia(media)
	leia(nome)
	escreva(idade + 1, "|")
	escreva(media + 0.5, "|")
	escreva(nome)
fimalgoritmo`,
		expectedOutput: '15|9|Lucas'
	},
	{
		id: 'write-vs-writeln',
		title: 'escreva and escreval',
		status: 'supported',
		compatibility: 'Visualg',
		tags: ['output'],
		description: 'Shows that escreva keeps the cursor on the same line and escreval breaks it.',
		code: `algoritmo "saida"
var
inicio
	escreva("A")
	escreva("B")
	escreval("C")
	escreva("D")
fimalgoritmo`,
		expectedOutput: 'ABC\nD'
	},
	{
		id: 'if-else',
		title: 'Conditional branch',
		status: 'supported',
		compatibility: 'Visualg',
		tags: ['conditionals'],
		description: 'Uses se/senao/fimse with one command per line.',
		code: `algoritmo "condicional"
var
	nota : real
inicio
	nota <- 8.5
	se nota >= 6 entao
		escreval("Aprovado")
	senao
		escreval("Revisar")
	fimse
fimalgoritmo`,
		expectedOutput: 'Aprovado\n'
	},
	{
		id: 'loops',
		title: 'Loops',
		status: 'supported',
		compatibility: 'Visualg',
		tags: ['loops', 'control-flow'],
		description: 'Uses enquanto, para and repita in one deterministic program.',
		code: `algoritmo "lacos"
var
	i, contador : inteiro
inicio
	contador <- 0
	enquanto contador < 2 faca
		contador <- contador + 1
		escreva(contador)
	fimenquanto

	para i de 1 ate 3 faca
		escreva(i)
	fimpara

	repita
		contador <- contador + 1
		escreva(contador)
	ate contador = 4
fimalgoritmo`,
		expectedOutput: '1212334'
	},
	{
		id: 'choice',
		title: 'Choice by case',
		status: 'supported',
		compatibility: 'Visualg',
		tags: ['choice', 'control-flow'],
		description: 'Uses escolha/caso/outrocaso/fimescolha without fallthrough.',
		code: `algoritmo "menu"
var
	opcao : inteiro
inicio
	opcao <- 2
	escolha opcao
		caso 1
			escreval("Novo")
		caso 2
			escreval("Abrir")
		outrocaso
			escreval("Sair")
	fimescolha
fimalgoritmo`,
		expectedOutput: 'Abrir\n'
	},
	{
		id: 'math-and-strings',
		title: 'Math and string functions',
		status: 'supported',
		compatibility: 'Visualg',
		tags: ['math', 'strings'],
		description: 'Covers essential math, string and character conversion helpers.',
		code: `algoritmo "funcoes"
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
	escreva(10 div 3, "|")
	escreva(compr(texto), "|")
	escreva(copia(texto, 2, 3), "|")
	escreva(pos("code", texto), "|")
	escreva(asc("A"), "|")
	escreva(carac(65))
fimalgoritmo`,
		expectedOutput: '5|3|8|16|8|1|3|7|roc|4|65|A'
	},
	{
		id: 'invalid-comparison',
		title: 'Invalid mixed comparison',
		status: 'error-case',
		compatibility: 'Visualg',
		tags: ['errors', 'comparisons'],
		description: 'Shows the expected error when comparing incompatible value types.',
		code: `algoritmo "comparacao_invalida"
var
	idade : inteiro
	nome : cadeia
inicio
	idade <- 14
	nome <- "Ana"
	se idade = nome entao
		escreval("invalido")
	fimse
fimalgoritmo`,
		expectedErrorIncludes: 'Não é possível comparar numero com texto'
	},
	{
		id: 'inline-block-command',
		title: 'Inline block command error',
		status: 'error-case',
		compatibility: 'Visualg',
		tags: ['errors', 'block-style'],
		description: 'Shows that Crocode requires block commands on the next line.',
		code: `algoritmo "inline"
var
	nota : real
inicio
	nota <- 8
	se nota >= 6 entao escreval("Aprovado")
	fimse
fimalgoritmo`,
		expectedErrorIncludes: "Depois de 'entao', comece o bloco na próxima linha."
	}
];

export function getVisualgOfficialExample(id: string) {
	return visualgOfficialExamples.find((example) => example.id === id);
}
