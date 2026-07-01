export type VisualgReferenceStatus = 'supported' | 'planned' | 'out-of-scope' | 'crocode-extension';

export type VisualgReferenceCategory =
	| 'structure'
	| 'type'
	| 'control-flow'
	| 'input-output'
	| 'operator'
	| 'math'
	| 'string'
	| 'environment';

export interface VisualgReferenceItem {
	name: string;
	aliases?: string[];
	category: VisualgReferenceCategory;
	status: VisualgReferenceStatus;
	syntax: string;
	description: string;
	example?: string;
	compatibility: 'Visualg' | 'Crocode' | 'Planned' | 'Unsupported';
}

export const visualgReferenceItems: VisualgReferenceItem[] = [
	{
		name: 'algoritmo',
		category: 'structure',
		status: 'supported',
		syntax: 'algoritmo "Nome"',
		description: 'Declara o início de um algoritmo Visualg.',
		example: 'algoritmo "Media"',
		compatibility: 'Visualg'
	},
	{
		name: 'var',
		category: 'structure',
		status: 'supported',
		syntax: 'var',
		description: 'Inicia a seção de declaração de variáveis.',
		example: 'var\n  idade, faltas : inteiro',
		compatibility: 'Visualg'
	},
	{
		name: 'inicio',
		category: 'structure',
		status: 'supported',
		syntax: 'inicio',
		description: 'Inicia o bloco principal de comandos.',
		compatibility: 'Visualg'
	},
	{
		name: 'fimalgoritmo',
		category: 'structure',
		status: 'supported',
		syntax: 'fimalgoritmo',
		description: 'Fecha o algoritmo.',
		compatibility: 'Visualg'
	},
	{
		name: 'inteiro',
		category: 'type',
		status: 'supported',
		syntax: 'idade : inteiro',
		description: 'Tipo numérico inteiro.',
		compatibility: 'Visualg'
	},
	{
		name: 'real',
		category: 'type',
		status: 'supported',
		syntax: 'media : real',
		description: 'Tipo numérico real.',
		compatibility: 'Visualg'
	},
	{
		name: 'caractere',
		aliases: ['caracter', 'cadeia'],
		category: 'type',
		status: 'supported',
		syntax: 'nome : caractere',
		description: 'Tipo textual. Caracter recebe apenas o primeiro caractere na atribuição.',
		compatibility: 'Visualg'
	},
	{
		name: 'logico',
		aliases: ['lógico'],
		category: 'type',
		status: 'supported',
		syntax: 'ativo : logico',
		description: 'Tipo lógico verdadeiro/falso.',
		compatibility: 'Visualg'
	},
	{
		name: 'se',
		aliases: ['entao', 'então', 'senao', 'senão', 'fimse'],
		category: 'control-flow',
		status: 'supported',
		syntax: 'se condicao entao\n  comandos\nfimse',
		description: 'Executa comandos condicionalmente. Crocode exige bloco em linhas separadas.',
		example: 'se nota >= 60 entao\n  escreval("Aprovado")\nfimse',
		compatibility: 'Visualg'
	},
	{
		name: 'enquanto',
		aliases: ['faca', 'faça', 'fimenquanto'],
		category: 'control-flow',
		status: 'supported',
		syntax: 'enquanto condicao faca\n  comandos\nfimenquanto',
		description: 'Repete comandos enquanto a condição for verdadeira.',
		compatibility: 'Visualg'
	},
	{
		name: 'para',
		aliases: ['de', 'ate', 'até', 'passo', 'faca', 'faça', 'fimpara'],
		category: 'control-flow',
		status: 'supported',
		syntax: 'para i de inicio ate fim passo n faca\n  comandos\nfimpara',
		description: 'Repete comandos com uma variável de controle.',
		compatibility: 'Visualg'
	},
	{
		name: 'leia',
		category: 'input-output',
		status: 'supported',
		syntax: 'leia(variavel)',
		description: 'Lê uma entrada e converte conforme o tipo da variável.',
		compatibility: 'Visualg'
	},
	{
		name: 'escreva',
		category: 'input-output',
		status: 'supported',
		syntax: 'escreva(valor)',
		description: 'Escreve no console sem quebrar linha automaticamente.',
		compatibility: 'Visualg'
	},
	{
		name: 'escreval',
		category: 'input-output',
		status: 'supported',
		syntax: 'escreval(valor)',
		description: 'Escreve no console e quebra linha ao final.',
		compatibility: 'Visualg'
	},
	{
		name: 'limpa',
		aliases: ['limpatela'],
		category: 'input-output',
		status: 'supported',
		syntax: 'limpatela()',
		description: 'Limpa o console de saída.',
		compatibility: 'Visualg'
	},
	{
		name: 'mod',
		category: 'operator',
		status: 'supported',
		syntax: 'a mod b',
		description: 'Retorna o resto da divisão. Também pode ser usado como mod(a, b).',
		example: 'escreva(10 mod 3)',
		compatibility: 'Visualg'
	},
	{
		name: 'div',
		category: 'operator',
		status: 'supported',
		syntax: 'a div b',
		description: 'Retorna a parte inteira da divisão. Também pode ser usado como div(a, b).',
		example: 'escreva(10 div 3)',
		compatibility: 'Visualg'
	},
	{
		name: 'xou',
		category: 'operator',
		status: 'supported',
		syntax: 'valor_logico xou outro_valor_logico',
		description: 'Operador lógico ou exclusivo; verdadeiro quando exatamente um lado é verdadeiro.',
		example: 'escreva(verdadeiro xou falso)',
		compatibility: 'Visualg'
	},
	{
		name: 'pi',
		category: 'math',
		status: 'supported',
		syntax: 'pi',
		description: 'Constante numérica de PI.',
		compatibility: 'Visualg'
	},
	{
		name: 'abs',
		category: 'math',
		status: 'supported',
		syntax: 'abs(x)',
		description: 'Retorna o valor absoluto de um número.',
		compatibility: 'Visualg'
	},
	{
		name: 'raizq',
		category: 'math',
		status: 'supported',
		syntax: 'raizq(x)',
		description: 'Retorna a raiz quadrada de um número.',
		compatibility: 'Visualg'
	},
	{
		name: 'pot',
		category: 'math',
		status: 'supported',
		syntax: 'pot(base, expoente)',
		description: 'Retorna a potência de base elevada ao expoente.',
		compatibility: 'Visualg'
	},
	{
		name: 'quad',
		category: 'math',
		status: 'supported',
		syntax: 'quad(x)',
		description: 'Retorna o quadrado de um número.',
		compatibility: 'Visualg'
	},
	{
		name: 'int',
		category: 'math',
		status: 'supported',
		syntax: 'int(x)',
		description: 'Retorna a parte inteira por truncamento.',
		compatibility: 'Visualg'
	},
	{
		name: 'compr',
		category: 'string',
		status: 'supported',
		syntax: 'compr(texto)',
		description: 'Retorna o comprimento do texto.',
		compatibility: 'Visualg'
	},
	{
		name: 'maiusc',
		category: 'string',
		status: 'supported',
		syntax: 'maiusc(texto)',
		description: 'Converte texto para maiúsculas.',
		compatibility: 'Visualg'
	},
	{
		name: 'minusc',
		category: 'string',
		status: 'supported',
		syntax: 'minusc(texto)',
		description: 'Converte texto para minúsculas.',
		compatibility: 'Visualg'
	},
	{
		name: 'copia',
		category: 'string',
		status: 'supported',
		syntax: 'copia(texto, inicio, quantidade)',
		description: 'Copia parte do texto usando posição inicial 1-based.',
		compatibility: 'Visualg'
	},
	{
		name: 'pos',
		category: 'string',
		status: 'supported',
		syntax: 'pos(trecho, texto)',
		description: 'Retorna a posição 1-based do trecho ou 0 quando não encontra.',
		compatibility: 'Visualg'
	},
	{
		name: 'asc',
		category: 'string',
		status: 'supported',
		syntax: 'asc(caractere)',
		description: 'Retorna o código numérico do caractere informado.',
		example: 'escreva(asc("A"))',
		compatibility: 'Visualg'
	},
	{
		name: 'carac',
		category: 'string',
		status: 'supported',
		syntax: 'carac(codigo)',
		description: 'Retorna o caractere correspondente ao código numérico informado.',
		example: 'escreva(carac(65))',
		compatibility: 'Visualg'
	},
	{
		name: 'numpcarac',
		category: 'string',
		status: 'planned',
		syntax: 'numpcarac(...)',
		description: 'Conversão relacionada a número/caractere; direção exata pendente de confirmação.',
		compatibility: 'Planned'
	},
	{
		name: 'caracpnum',
		category: 'string',
		status: 'planned',
		syntax: 'caracpnum(...)',
		description: 'Conversão relacionada a caractere/número; direção exata pendente de confirmação.',
		compatibility: 'Planned'
	},
	{
		name: 'repita',
		aliases: ['ate'],
		category: 'control-flow',
		status: 'supported',
		syntax: 'repita\n  comandos\nate condicao',
		description: 'Laço que executa pelo menos uma vez.',
		compatibility: 'Visualg'
	},
	{
		name: 'interrompa',
		category: 'control-flow',
		status: 'supported',
		syntax: 'interrompa',
		description: 'Interrompe a execução do laço mais próximo.',
		example: 'se valor = 0 entao\n  interrompa\nfimse',
		compatibility: 'Visualg'
	},
	{
		name: 'escolha',
		aliases: ['caso', 'outrocaso', 'fimescolha'],
		category: 'control-flow',
		status: 'supported',
		syntax: 'escolha valor\n  caso x\n    comandos\nfimescolha',
		description: 'Estrutura de seleção por caso, sem fallthrough entre casos.',
		compatibility: 'Visualg'
	},
	{
		name: 'randi',
		aliases: ['rand'],
		category: 'math',
		status: 'supported',
		syntax: 'rand(), rand(max), rand(min, max), randi(max), randi(min, max)',
		description: 'Sorteia números usando intervalo semiaberto, com limite superior exclusivo.',
		example: 'escreva(randi(1, 7))',
		compatibility: 'Crocode'
	},
	{
		name: 'mudacor',
		category: 'environment',
		status: 'out-of-scope',
		syntax: 'mudacor(...)',
		description: 'Fora do escopo inicial porque exigiria saída estruturada com cor.',
		compatibility: 'Unsupported'
	},
	{
		name: 'arquivo',
		category: 'environment',
		status: 'out-of-scope',
		syntax: 'arquivo(...)',
		description: 'Fora do escopo inicial por depender de integração com arquivos salvos.',
		compatibility: 'Unsupported'
	},
	{
		name: 'espera',
		category: 'environment',
		status: 'out-of-scope',
		syntax: 'espera(ms)',
		description: 'Extensão discutida e deixada fora do plano inicial.',
		compatibility: 'Unsupported'
	}
];

export function getVisualgReferenceItem(name: string) {
	const normalized = name.toLowerCase();
	return visualgReferenceItems.find(
		(item) =>
			item.name.toLowerCase() === normalized ||
			item.aliases?.some((alias) => alias.toLowerCase() === normalized)
	);
}

export function getSupportedVisualgReferenceNames() {
	return visualgReferenceItems
		.filter((item) => item.status === 'supported')
		.flatMap((item) => [item.name, ...(item.aliases ?? [])]);
}
