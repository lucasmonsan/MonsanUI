export type JavaScriptReferenceCategory =
	| 'variable'
	| 'type'
	| 'input-output'
	| 'operator'
	| 'control-flow'
	| 'loop'
	| 'function'
	| 'array'
	| 'object'
	| 'math';

export type JavaScriptReferenceStatus = 'supported' | 'planned' | 'standard';

export interface JavaScriptReferenceItem {
	name: string;
	aliases?: string[];
	category: JavaScriptReferenceCategory;
	status: JavaScriptReferenceStatus;
	syntax: string;
	description: string;
	example?: string;
	compatibility?: 'Standard JS' | 'Crocode';
}

export const javascriptReferenceItems: JavaScriptReferenceItem[] = [
	// Variáveis
	{
		name: 'const',
		category: 'variable',
		status: 'supported',
		syntax: 'const nome = valor;',
		description: 'Declara uma variável de valor constante que não pode ser reatribuída.',
		example: 'const pi = 3.14159;\nconst escola = "Crocode";',
		compatibility: 'Standard JS'
	},
	{
		name: 'let',
		aliases: ['variável', 'declarar'],
		category: 'variable',
		status: 'supported',
		syntax: 'let nome; | let nome = valor;',
		description:
			'Declara uma variável cujo valor pode ser atribuído no momento da criação ou modificado posteriormente ao longo do código.',
		example: 'let idade;\nidade = 25;\nidade = idade + 1;',
		compatibility: 'Standard JS'
	},
	{
		name: 'var',
		category: 'variable',
		status: 'supported',
		syntax: 'var nome = valor;',
		description:
			'Declaração tradicional de variável (no JavaScript moderno, prefira const ou let).',
		example: 'var total = 100;',
		compatibility: 'Standard JS'
	},

	// Tipos e Conversão
	{
		name: 'Number',
		aliases: ['Number()'],
		category: 'type',
		status: 'supported',
		syntax: 'Number(valor)',
		description: 'Converte um texto ou outro tipo de dado em um número.',
		example: 'const texto = prompt("Idade: ");\nconst idade = Number(texto);',
		compatibility: 'Standard JS'
	},
	{
		name: 'String',
		aliases: ['String()'],
		category: 'type',
		status: 'supported',
		syntax: 'String(valor)',
		description: 'Converte qualquer valor ou número em um texto (string).',
		example: 'const num = 42;\nconst texto = String(num);',
		compatibility: 'Standard JS'
	},
	{
		name: 'Boolean',
		aliases: ['Boolean()'],
		category: 'type',
		status: 'supported',
		syntax: 'Boolean(valor)',
		description: 'Converte um valor em um booleano (true ou false).',
		example: 'const temSaldo = Boolean(saldo > 0);',
		compatibility: 'Standard JS'
	},
	{
		name: 'parseInt',
		aliases: ['parseInt()'],
		category: 'type',
		status: 'supported',
		syntax: 'parseInt(texto, 10)',
		description: 'Analisa um texto e extrai dele um número inteiro.',
		example: 'const idade = parseInt("25 anos", 10); // 25',
		compatibility: 'Standard JS'
	},
	{
		name: 'parseFloat',
		aliases: ['parseFloat()'],
		category: 'type',
		status: 'supported',
		syntax: 'parseFloat(texto)',
		description: 'Analisa um texto e extrai dele um número decimal com ponto flutuante.',
		example: 'const preco = parseFloat("19.90"); // 19.9',
		compatibility: 'Standard JS'
	},
	{
		name: 'typeof',
		category: 'type',
		status: 'supported',
		syntax: 'typeof valor',
		description: 'Operador que retorna o tipo de dado de uma variável ou valor como texto.',
		example: 'console.log(typeof 42); // "number"\nconsole.log(typeof "olá"); // "string"',
		compatibility: 'Standard JS'
	},

	// Entrada e Saída
	{
		name: 'prompt',
		aliases: ['prompt()'],
		category: 'input-output',
		status: 'supported',
		syntax: 'prompt(mensagem)',
		description: 'Solicita uma informação ao usuário através de uma caixa de entrada no console.',
		example: 'const nome = prompt("Digite seu nome: ");',
		compatibility: 'Crocode'
	},
	{
		name: 'console.log',
		aliases: ['console.log()', 'log'],
		category: 'input-output',
		status: 'supported',
		syntax: 'console.log(item1, item2, ...)',
		description: 'Exibe valores, variáveis ou mensagens de texto no console, saltando uma linha.',
		example: 'console.log("Olá, mundo!");\nconsole.log("Total:", total);',
		compatibility: 'Standard JS'
	},
	{
		name: 'console.warn',
		aliases: ['console.warn()', 'warn'],
		category: 'input-output',
		status: 'supported',
		syntax: 'console.warn(mensagem)',
		description: 'Exibe uma mensagem de aviso no console com destaque de alerta.',
		example: 'console.warn("Atenção: saldo baixo!");',
		compatibility: 'Standard JS'
	},
	{
		name: 'console.error',
		aliases: ['console.error()', 'error'],
		category: 'input-output',
		status: 'supported',
		syntax: 'console.error(mensagem)',
		description: 'Exibe uma mensagem de erro crítico no console.',
		example: 'console.error("Falha ao processar os dados.");',
		compatibility: 'Standard JS'
	},
	{
		name: 'console.clear',
		aliases: ['console.clear()', 'clear', 'limpartela', 'limpatela'],
		category: 'input-output',
		status: 'supported',
		syntax: 'console.clear()',
		description: 'Limpa todas as mensagens e saídas exibidas no console.',
		example: 'console.log("Mensagem antiga");\nconsole.clear();\nconsole.log("Console limpo!");',
		compatibility: 'Standard JS'
	},
	{
		name: 'Template Strings',
		aliases: ['interpolação', 'template literals', '`'],
		category: 'input-output',
		status: 'supported',
		syntax: '`Texto com ${variavel}`',
		description:
			'Cria textos delimitados por crases que permitem interpolar variáveis e expressões diretamente.',
		example: 'const nome = "Lucas";\nconsole.log(`Usuário: ${nome}`);',
		compatibility: 'Standard JS'
	},

	// Operadores
	{
		name: '=',
		aliases: ['atribuição', 'recebe', '<-', 'atribuir'],
		category: 'operator',
		status: 'supported',
		syntax: 'variavel = valor;',
		description:
			'Operador de atribuição (o "<-" do Portugol): armazena o resultado da expressão da direita dentro da variável à esquerda.',
		example: 'let saldo;\nsaldo = 500;\nsaldo = saldo - 150;',
		compatibility: 'Standard JS'
	},
	{
		name: '+=',
		aliases: ['atribuição com soma', 'incremento'],
		category: 'operator',
		status: 'supported',
		syntax: 'variavel += valor;',
		description:
			'Soma o valor à variável e guarda nela mesma (equivalente a variavel = variavel + valor).',
		example: 'let pontos = 10;\npontos += 5; // pontos agora vale 15',
		compatibility: 'Standard JS'
	},
	{
		name: '-=',
		aliases: ['atribuição com subtração', 'decremento'],
		category: 'operator',
		status: 'supported',
		syntax: 'variavel -= valor;',
		description:
			'Subtrai o valor da variável e guarda nela mesma (equivalente a variavel = variavel - valor).',
		example: 'let vidas = 3;\nvidas -= 1; // vidas agora vale 2',
		compatibility: 'Standard JS'
	},
	{
		name: '+',
		aliases: ['soma', 'adição', 'concatenação'],
		category: 'operator',
		status: 'supported',
		syntax: 'a + b',
		description: 'Soma dois números ou junta dois textos (concatenação).',
		example: 'const soma = 10 + 5;\nconst saudacao = "Olá " + nome;',
		compatibility: 'Standard JS'
	},
	{
		name: '-',
		aliases: ['subtração'],
		category: 'operator',
		status: 'supported',
		syntax: 'a - b',
		description: 'Subtrai o segundo valor do primeiro.',
		example: 'const troco = 50 - 20;',
		compatibility: 'Standard JS'
	},
	{
		name: '*',
		aliases: ['multiplicação'],
		category: 'operator',
		status: 'supported',
		syntax: 'a * b',
		description: 'Multiplica dois valores numéricos.',
		example: 'const dobro = 15 * 2;',
		compatibility: 'Standard JS'
	},
	{
		name: '/',
		aliases: ['divisão'],
		category: 'operator',
		status: 'supported',
		syntax: 'a / b',
		description: 'Divide dois números, retornando o resultado decimal exato.',
		example: 'const media = 10 / 4; // 2.5',
		compatibility: 'Standard JS'
	},
	{
		name: '%',
		aliases: ['resto', 'módulo', 'mod'],
		category: 'operator',
		status: 'supported',
		syntax: 'a % b',
		description: 'Operador de módulo que retorna o resto da divisão inteira entre dois números.',
		example: 'const resto = 8 % 3; // 2',
		compatibility: 'Standard JS'
	},
	{
		name: '**',
		aliases: ['potência', 'exponenciação'],
		category: 'operator',
		status: 'supported',
		syntax: 'base ** expoente',
		description: 'Eleva a base à potência do expoente especificado.',
		example: 'const cubo = 2 ** 3; // 8',
		compatibility: 'Standard JS'
	},
	{
		name: '===',
		aliases: ['igualdade estrita', '==='],
		category: 'operator',
		status: 'supported',
		syntax: 'a === b',
		description: 'Retorna true se os valores e tipos de ambos os lados forem estritamente iguais.',
		example: 'console.log(10 === 10); // true\nconsole.log(10 === "10"); // false',
		compatibility: 'Standard JS'
	},
	{
		name: '!==',
		aliases: ['desigualdade estrita', '!=='],
		category: 'operator',
		status: 'supported',
		syntax: 'a !== b',
		description: 'Retorna true se os valores ou tipos forem diferentes.',
		example: 'console.log(10 !== 20); // true',
		compatibility: 'Standard JS'
	},
	{
		name: '>',
		aliases: ['maior que', '>=', 'maior ou igual'],
		category: 'operator',
		status: 'supported',
		syntax: 'a > b | a >= b',
		description: 'Verifica se o primeiro valor é maior (ou maior ou igual) que o segundo.',
		example: 'const aprovado = nota >= 6;',
		compatibility: 'Standard JS'
	},
	{
		name: '<',
		aliases: ['menor que', '<=', 'menor ou igual'],
		category: 'operator',
		status: 'supported',
		syntax: 'a < b | a <= b',
		description: 'Verifica se o primeiro valor é menor (ou menor ou igual) que o segundo.',
		example: 'const podeSacar = saque <= saldo;',
		compatibility: 'Standard JS'
	},
	{
		name: '&&',
		aliases: ['e', 'and', 'e lógico'],
		category: 'operator',
		status: 'supported',
		syntax: 'condicao1 && condicao2',
		description: 'Operador E lógico: retorna true se AMBAS as condições forem verdadeiras.',
		example: 'const aprovado = (nota >= 6) && (faltas < 25);',
		compatibility: 'Standard JS'
	},
	{
		name: '||',
		aliases: ['ou', 'or', 'ou lógico'],
		category: 'operator',
		status: 'supported',
		syntax: 'condicao1 || condicao2',
		description: 'Operador OU lógico: retorna true se PELO MENOS UMA das condições for verdadeira.',
		example: 'const recuperacao = (nota < 6) || (faltas >= 25);',
		compatibility: 'Standard JS'
	},
	{
		name: '!',
		aliases: ['não', 'not', 'negação'],
		category: 'operator',
		status: 'supported',
		syntax: '!condicao',
		description:
			'Operador de negação lógica: inverte o valor booleano (transforma true em false e vice-versa).',
		example: 'const bloqueado = !aprovado;',
		compatibility: 'Standard JS'
	},
	{
		name: '? :',
		aliases: ['ternário', 'operador ternário'],
		category: 'operator',
		status: 'supported',
		syntax: 'condicao ? valorSeTrue : valorSeFalse',
		description:
			'Operador condicional ternário para escolher um entre dois valores em uma única linha.',
		example: 'const resultado = nota >= 6 ? "Aprovado" : "Reprovado";',
		compatibility: 'Standard JS'
	},

	// Estruturas Condicionais
	{
		name: 'if',
		aliases: ['se'],
		category: 'control-flow',
		status: 'supported',
		syntax: 'if (condicao) {\n  // comandos\n}',
		description: 'Executa o bloco de instruções apenas se a condição avaliada for verdadeira.',
		example: 'if (saldo >= saque) {\n  console.log("Saque aprovado!");\n}',
		compatibility: 'Standard JS'
	},
	{
		name: 'else',
		aliases: ['senao', 'senão'],
		category: 'control-flow',
		status: 'supported',
		syntax: 'if (condicao) {\n  // se verdadeiro\n} else {\n  // se falso\n}',
		description: 'Executa um bloco alternativo de instruções caso a condição do if seja falsa.',
		example:
			'if (nota >= 6) {\n  console.log("Aprovado");\n} else {\n  console.log("Reprovado");\n}',
		compatibility: 'Standard JS'
	},
	{
		name: 'else if',
		aliases: ['senao se', 'senão se'],
		category: 'control-flow',
		status: 'supported',
		syntax: 'if (condicao1) {\n  // ...\n} else if (condicao2) {\n  // ...\n} else {\n  // ...\n}',
		description: 'Enfileira uma nova verificação condicional caso a condição anterior seja falsa.',
		example:
			'if (nota >= 9) {\n  console.log("Excelente");\n} else if (nota >= 6) {\n  console.log("Bom");\n} else {\n  console.log("Recuperação");\n}',
		compatibility: 'Standard JS'
	},
	{
		name: 'switch',
		aliases: ['escolha', 'case', 'break', 'default'],
		category: 'control-flow',
		status: 'supported',
		syntax:
			'switch (expressao) {\n  case valor1:\n    // ...\n    break;\n  default:\n    // ...\n}',
		description:
			'Avalia uma expressão e executa o bloco de código correspondente ao valor correspondente.',
		example:
			'switch (opcao) {\n  case 1:\n    console.log("Saldo");\n    break;\n  case 2:\n    console.log("Extrato");\n    break;\n  default:\n    console.log("Opção desconhecida");\n}',
		compatibility: 'Standard JS'
	},

	// Estruturas de Repetição
	{
		name: 'for',
		aliases: ['para', 'loop for'],
		category: 'loop',
		status: 'supported',
		syntax: 'for (inicializacao; condicao; incremento) {\n  // comandos\n}',
		description:
			'Estrutura de repetição que itera um número determinado de vezes com controle de contador.',
		example: 'for (let i = 1; i <= 5; i++) {\n  console.log("Contagem: " + i);\n}',
		compatibility: 'Standard JS'
	},
	{
		name: 'while',
		aliases: ['enquanto', 'loop while'],
		category: 'loop',
		status: 'supported',
		syntax: 'while (condicao) {\n  // comandos\n}',
		description:
			'Estrutura de repetição que executa o bloco enquanto a condição permanecer verdadeira.',
		example:
			'let tentativas = 3;\nwhile (tentativas > 0) {\n  console.log("Tentativa: " + tentativas);\n  tentativas = tentativas - 1;\n}',
		compatibility: 'Standard JS'
	},
	{
		name: 'do...while',
		aliases: ['repita', 'do while'],
		category: 'loop',
		status: 'supported',
		syntax: 'do {\n  // comandos\n} while (condicao);',
		description:
			'Executa o bloco ao menos uma vez e depois repete enquanto a condição for verdadeira.',
		example: 'let numero = 0;\ndo {\n  numero = numero + 1;\n} while (numero < 3);',
		compatibility: 'Standard JS'
	},
	{
		name: 'break',
		aliases: ['interrompa'],
		category: 'loop',
		status: 'supported',
		syntax: 'break;',
		description: 'Interrompe imediatamente o laço de repetição ou bloco switch.',
		example: 'for (let i = 1; i <= 10; i++) {\n  if (i === 5) break;\n  console.log(i);\n}',
		compatibility: 'Standard JS'
	},
	{
		name: 'continue',
		category: 'loop',
		status: 'supported',
		syntax: 'continue;',
		description: 'Pula o restante da iteração atual do laço e avança direto para a próxima volta.',
		example: 'for (let i = 1; i <= 5; i++) {\n  if (i === 3) continue;\n  console.log(i);\n}',
		compatibility: 'Standard JS'
	},

	// Funções
	{
		name: 'function',
		aliases: ['função', 'funcao'],
		category: 'function',
		status: 'supported',
		syntax: 'function nome(parametro1, parametro2) {\n  // comandos\n  return resultado;\n}',
		description: 'Define um bloco reutilizável de código com parâmetros e valor de retorno.',
		example: 'function somar(a, b) {\n  return a + b;\n}\nconst total = somar(10, 20);',
		compatibility: 'Standard JS'
	},
	{
		name: 'return',
		aliases: ['retorne'],
		category: 'function',
		status: 'supported',
		syntax: 'return valor;',
		description: 'Encerra a execução de uma função e devolve o valor para quem a chamou.',
		example: 'function dobro(n) {\n  return n * 2;\n}',
		compatibility: 'Standard JS'
	},
	{
		name: 'Arrow Function',
		aliases: ['=>', 'função seta'],
		category: 'function',
		status: 'supported',
		syntax: 'const nome = (parametros) => {\n  return resultado;\n};',
		description: 'Sintaxe moderna e compacta para criação de funções no JavaScript.',
		example: 'const quadrado = (n) => n * n;\nconsole.log(quadrado(5)); // 25',
		compatibility: 'Standard JS'
	},

	// Arrays e Coleções
	{
		name: 'Array []',
		aliases: ['vetor', 'lista', '[]'],
		category: 'array',
		status: 'supported',
		syntax: 'const lista = [item1, item2, item3];',
		description: 'Cria uma lista ordenada de valores indexados a partir de 0.',
		example: 'const frutas = ["Maçã", "Banana", "Uva"];\nconsole.log(frutas[0]); // "Maçã"',
		compatibility: 'Standard JS'
	},
	{
		name: '.length',
		aliases: ['tamanho', 'comprimento'],
		category: 'array',
		status: 'supported',
		syntax: 'colecao.length',
		description:
			'Propriedade que retorna o número de elementos de um array ou caracteres de um texto.',
		example: 'const lista = [10, 20, 30];\nconsole.log(lista.length); // 3',
		compatibility: 'Standard JS'
	},
	{
		name: '.push()',
		aliases: ['inserir', 'adicionar'],
		category: 'array',
		status: 'supported',
		syntax: 'array.push(novoElemento)',
		description: 'Adiciona um ou mais elementos no final do array.',
		example: 'const nomes = ["Ana"];\nnomes.push("Lucas");',
		compatibility: 'Standard JS'
	},
	{
		name: '.pop()',
		aliases: ['remover'],
		category: 'array',
		status: 'supported',
		syntax: 'array.pop()',
		description: 'Remove e retorna o último elemento de um array.',
		example: 'const numeros = [1, 2, 3];\nconst ultimo = numeros.pop(); // 3',
		compatibility: 'Standard JS'
	},
	{
		name: 'for...of',
		aliases: ['para cada', 'for of'],
		category: 'array',
		status: 'supported',
		syntax: 'for (const item of array) {\n  // comandos\n}',
		description: 'Estrutura de repetição que percorre todos os valores de um array facilmente.',
		example:
			'const amigos = ["Ana", "Bia", "Leo"];\nfor (const amigo of amigos) {\n  console.log("Olá " + amigo);\n}',
		compatibility: 'Standard JS'
	},
	{
		name: '.includes()',
		aliases: ['contém'],
		category: 'array',
		status: 'supported',
		syntax: 'array.includes(elemento)',
		description: 'Verifica se o array contém o elemento especificado, retornando true ou false.',
		example:
			'const cores = ["azul", "verde"];\nif (cores.includes("azul")) {\n  console.log("Tem azul!");\n}',
		compatibility: 'Standard JS'
	},

	// Objetos
	{
		name: 'Objeto {}',
		aliases: ['objeto', 'registro', '{}'],
		category: 'object',
		status: 'supported',
		syntax: 'const objeto = { chave: valor };',
		description:
			'Estrutura que armazena pares de chave e valor para representar entidades com propriedades.',
		example:
			'const aluno = {\n  nome: "Lucas",\n  nota: 9.5,\n  aprovado: true\n};\nconsole.log(aluno.nome);',
		compatibility: 'Standard JS'
	},

	// Matemática (Math)
	{
		name: 'Math.floor',
		aliases: ['Math.floor()', 'piso', 'divisão inteira'],
		category: 'math',
		status: 'supported',
		syntax: 'Math.floor(numero)',
		description:
			'Arredonda o número para baixo, pegando a parte inteira (útil para divisões inteiras).',
		example: 'const pedacos = Math.floor(8 / 3); // 2',
		compatibility: 'Standard JS'
	},
	{
		name: 'Math.ceil',
		aliases: ['Math.ceil()', 'teto'],
		category: 'math',
		status: 'supported',
		syntax: 'Math.ceil(numero)',
		description: 'Arredonda o número para cima para o próximo número inteiro.',
		example: 'const caixas = Math.ceil(10.2); // 11',
		compatibility: 'Standard JS'
	},
	{
		name: 'Math.round',
		aliases: ['Math.round()', 'arredondar'],
		category: 'math',
		status: 'supported',
		syntax: 'Math.round(numero)',
		description: 'Arredonda o número para o número inteiro mais próximo.',
		example: 'console.log(Math.round(4.6)); // 5\nconsole.log(Math.round(4.4)); // 4',
		compatibility: 'Standard JS'
	},
	{
		name: 'Math.trunc',
		aliases: ['Math.trunc()', 'parte inteira'],
		category: 'math',
		status: 'supported',
		syntax: 'Math.trunc(numero)',
		description: 'Descarta a parte decimal de um número, mantendo apenas os dígitos inteiros.',
		example: 'console.log(Math.trunc(8.95)); // 8',
		compatibility: 'Standard JS'
	},
	{
		name: 'Math.abs',
		aliases: ['Math.abs()', 'valor absoluto'],
		category: 'math',
		status: 'supported',
		syntax: 'Math.abs(numero)',
		description: 'Retorna o valor absoluto positivo do número, sem sinal negativo.',
		example: 'console.log(Math.abs(-15)); // 15',
		compatibility: 'Standard JS'
	},
	{
		name: 'Math.pow',
		aliases: ['Math.pow()', 'potência'],
		category: 'math',
		status: 'supported',
		syntax: 'Math.pow(base, expoente)',
		description: 'Calcula e retorna a base elevada à potência do expoente.',
		example: 'console.log(Math.pow(2, 4)); // 16',
		compatibility: 'Standard JS'
	},
	{
		name: 'Math.sqrt',
		aliases: ['Math.sqrt()', 'raiz quadrada'],
		category: 'math',
		status: 'supported',
		syntax: 'Math.sqrt(numero)',
		description: 'Calcula e retorna a raiz quadrada de um número.',
		example: 'console.log(Math.sqrt(49)); // 7',
		compatibility: 'Standard JS'
	},
	{
		name: 'Math.random',
		aliases: ['Math.random()', 'aleatório'],
		category: 'math',
		status: 'supported',
		syntax: 'Math.random()',
		description: 'Gera um número decimal pseudoaleatório entre 0 (inclusive) e 1 (exclusive).',
		example: 'const dado = Math.floor(Math.random() * 6) + 1; // 1 a 6',
		compatibility: 'Standard JS'
	},
	{
		name: 'Math.PI',
		aliases: ['pi'],
		category: 'math',
		status: 'supported',
		syntax: 'Math.PI',
		description: 'Constante numérica representando o número Pi (aproximadamente 3.14159).',
		example: 'const area = Math.PI * (raio ** 2);',
		compatibility: 'Standard JS'
	},
	{
		name: '.toFixed()',
		aliases: ['toFixed', 'casas decimais'],
		category: 'math',
		status: 'supported',
		syntax: 'numero.toFixed(casasDecimais)',
		description:
			'Formata o número com quantidade fixa de casas decimais, retornando o resultado como texto.',
		example: 'const valor = (19.9876).toFixed(2); // "19.99"',
		compatibility: 'Standard JS'
	}
];

export function getJavaScriptReferenceItem(name: string): JavaScriptReferenceItem | undefined {
	const normalized = name.toLowerCase().trim();
	return javascriptReferenceItems.find(
		(item) =>
			item.name.toLowerCase() === normalized ||
			item.aliases?.some((alias) => alias.toLowerCase() === normalized)
	);
}

export function getSupportedJavaScriptReferenceNames(): string[] {
	return javascriptReferenceItems
		.filter((item) => item.status === 'supported')
		.flatMap((item) => [item.name, ...(item.aliases ?? [])]);
}
