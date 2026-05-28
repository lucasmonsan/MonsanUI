# Project Rules

## Objective

Este projeto faz parte da suite Monsan.

`MonsanUI` e a unica fonte de componentes visuais, tokens de estilo e comportamento
visual compartilhado. Os aplicativos consumidores devem usar os componentes como
fornecidos, configurando somente props e conteudo.

Quando um aplicativo precisar de uma variacao visual reutilizavel ou de um novo
padrao de interface, a solucao deve ser implementada primeiro em `MonsanUI`.

## Communication

- Comunicacao com o usuario em PT-BR, direta e objetiva.
- Codigo, nomes tecnicos, commits e documentacao de codigo em ingles.
- Sempre expor erros, warnings, riscos, limitacoes e trabalho pendente.

## Workflow

- Antes de cada fase relevante, informar objetivo, arquivos previstos e impactos.
- Uma aprovacao do plano autoriza as etapas descritas nele; pedir nova aprovacao
  somente se o escopo mudar, houver risco relevante ou for necessaria uma decisao.
- Em trabalho substancial, usar branch propria e preservar trabalho incompleto com
  checkpoint antes de novas alteracoes.
- Nao fazer `push`, `merge`, reescrita de historico ou operacoes destrutivas sem
  solicitacao ou aprovacao explicita.
- Comandos de inspecao e verificacao da fase aprovada podem ser executados.
- Instalacao/atualizacao de dependencias, alteracoes de ambiente, CI/CD,
  autenticacao, banco de dados ou deploy devem ser informadas antes da execucao.

## Stack

- SvelteKit com Svelte 5.
- TypeScript rigoroso.
- ESLint e Prettier sem erros.
- `pnpm` como gerenciador de pacotes.

## Svelte And TypeScript

- Usar sintaxe Svelte 5 e runes quando reatividade for necessaria.
- Nao introduzir APIs legacy ou sintaxe deprecated.
- Nao usar `any`, `@ts-ignore`, `@ts-nocheck` ou assertions inseguras.
- Non-null assertion somente quando inevitavel e justificavel.
- Preferir tipos explicitos nas fronteiras, unions discriminadas e inferencia segura.

## MonsanUI And Styling

- Consumidores nao devem reestilizar componentes do `MonsanUI`.
- Evitar CSS local, `:global`, `!important`, estilos inline e classes visuais
  hardcoded nos aplicativos.
- CSS local nos aplicativos so e aceitavel para layout estrutural estritamente
  especifico da pagina ou comportamento que nao pertence a um componente.
- Fontes, cores, bordas, radius, sombras, espacamentos, foco, estados e animacoes
  compartilhados pertencem aos tokens/componentes do `MonsanUI`.
- HTML semantico necessario (`main`, `section`, `form`, `label`, headings e
  landmarks) deve ser mantido; a regra nao e remover semantica.

## Accessibility And Internationalization

- Toda funcionalidade interativa deve ser operavel por teclado e ter nome
  acessivel.
- Componentes do `MonsanUI` devem oferecer a base de acessibilidade por padrao.
- Textos acessiveis e textos visiveis dependentes de idioma devem ser recebidos
  por props e fornecidos pelo i18n do aplicativo.
- Nenhuma string apresentada ao usuario deve ser hardcoded fora da camada de i18n,
  salvo nome proprio ou dado externo intencional.

## Quality Gates

- Correcoes devem atacar a causa raiz; nao esconder problemas.
- Nao adicionar `eslint-disable`, `svelte-ignore`, suppressions TypeScript ou
  workarounds equivalentes sem necessidade documentada e aprovacao.
- `pnpm test` e o gate completo de cada projeto e deve validar formatacao, lint,
  tipagem e build sem modificar arquivos.
- Usar `pnpm format` apenas para corrigir formatacao; depois executar `pnpm test`.
- Arquivos gerados devem ser ignorados por ferramentas de formatacao/lint quando
  nao forem codigo-fonte mantido manualmente.

## Scope And Safety

- Manter alteracoes focadas na fase aprovada.
- Nao refatorar comportamento sem necessidade para o objetivo atual.
- Nao expor secrets nem versionar `.env`.
- Nao alterar seguranca, autenticacao, permissoes, telemetry ou analytics sem
  decisao explicita.
- Nao gerar ou substituir imagens, videos ou outras midias sem solicitacao.
