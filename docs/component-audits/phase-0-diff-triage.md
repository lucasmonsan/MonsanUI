# Phase 0 Diff Triage

Workspace: `MonsanUI`

Branch atual: `fix/exam-badge-mobile-scaling`

Status inicial desta triagem:

- 57 arquivos modificados.
- 1248 insercoes.
- 573 remocoes.
- `docs/component-audits/` esta untracked.
- Nenhum codigo foi alterado durante esta triagem.
- Nenhum commit/push deve ser feito antes da aprovacao do usuario.

## Conclusao Curta

O diff atual nao deve entrar como uma unica mudanca.

Ele mistura:

- melhorias internas conservadoras;
- pequenas correcoes de acessibilidade;
- suporte a `prefers-reduced-motion`;
- i18n de defaults;
- troca de SVG inline por icones compartilhados;
- mudancas comportamentais em componentes sensiveis;
- documentacao que afirma validacoes anteriores, mas nao substitui a auditoria
  estrutural pedida.

Recomendacao: dividir o lote em quatro grupos:

1. manter em um commit conservador;
2. reescrever antes de aceitar;
3. descartar ou substituir por novo relatorio;
4. adiar para auditoria estrutural por familia.

## Manter Como Lote Conservador

Estas mudancas parecem aproveitaveis porque nao alteram contrato publico de
forma relevante e melhoram a base sem mudar estrutura visual:

- Troca de `style="..."` por diretivas Svelte `style:*` em componentes como
  `Panel`, `PageShell`, `PageContainer`, `AppViewport`, `ProgressBar`,
  `Textarea`, `Dialog`, `CenteredPanel`, `FlipCard`, `Terminal`, `DndOrder`.
- Troca de classes condicionais montadas em string por `class:*` em componentes
  como `Button`, `ButtonGroup`, `Checkbox`, `Radio`, `Deck`, `Folders`.
- Reducao de `transition: all` para propriedades explicitas em `Button`,
  `Calendar`, `SingleChoice`, `MultipleChoice` e similares.
- `prefers-reduced-motion` para animacoes puramente visuais em componentes como
  `Button`, `IconButton`, `ProgressBar`, `CountdownBadge`, `StatusBanner`,
  `SplashScreen`, `Loading`, `ChoiceCard`, `ContentRegion`, `LanguageSelector`,
  `ThemeSelector`, `PromptPanel`.
- `type="button"` em botoes que nao devem submeter formularios, como
  `MetricButton`, `Folders`, `Terminal`, `Calendar`, `SingleChoice`,
  `MultipleChoice`.
- Correcoes pequenas de a11y em questoes:
  - `SingleChoice`: `role="radiogroup"`, `role="radio"` e `aria-checked`.
  - `MultipleChoice`: `role="group"`, `role="checkbox"` e `aria-checked`.
- `Range`: clamp de porcentagem e guarda para `max === min`.
- Substituicao de SVG inline por icones ja existentes em casos simples:
  `Checkbox`, `Chips`, `SearchBar`, `Search`, `DatePicker`, `Folders`,
  `FileUpload`.

Risco residual: mesmo este lote deve ser testado isoladamente com `pnpm test`
em `MonsanUI` antes de commit.

## Reescrever Antes De Aceitar

Estas mudancas podem estar corretas na intencao, mas nao devem entrar como
limpeza simples porque alteram comportamento, contrato ou area visual sensivel.

### `ActionBar`

Mudanca atual:

- remove `padding: var(--space-sm) 0`;
- adiciona reduced-motion.

Diagnostico:

- A remocao do padding parece alinhada com a decisao de o `AppShell` controlar o
  espacamento estrutural.
- Mesmo assim, isso afeta diretamente Manki/Examster e deve ser tratado como
  mudanca de contrato de layout, nao como detalhe interno.

Decisao recomendada:

- Reescrever em um lote de `AppShell/top spacing`.
- Validar visualmente Manki e Examster depois de atualizar consumidores.

### `QuickActions`

Mudanca atual:

- troca listener manual do painel por `onclick={handlePanelClick}`.

Diagnostico:

- Isso muda o caminho de fechamento do painel.
- `QuickActions` e base de dropdowns, AvatarMenu, menus de deck/folders e
  provavelmente outros contextos.
- Tambem existe decisao pendente de padronizar dropdowns/selects/menus.

Decisao recomendada:

- Reescrever junto do contrato comum de menus/dropdowns.
- Nao aceitar como limpeza isolada.

### `DataCard`

Mudanca atual:

- colapsa branches duplicados de header.

Diagnostico:

- A direcao e boa, mas ainda nao implementa explicitamente o contrato aprovado
  de `top`, `body`, `bottom` como modelo estrutural principal.
- `DataCard` e central para cards de stats/admin e precisa ser tratado como
  contrato de superficie.

Decisao recomendada:

- Reescrever na fase de superficies/cards.
- Propor contrato final antes de alterar novamente.

### `ExpandableCard`

Mudanca atual:

- remove `addEventListener` manual;
- usa handlers declarativos;
- adiciona teclado para `expandOn="card"`;
- adiciona `role="button"` e `tabindex="0"` quando o card inteiro expande.

Diagnostico:

- A intencao e boa, mas e mudanca comportamental e de a11y.
- Pode afetar foco, clique em conteudo interno e leitores de tela.

Decisao recomendada:

- Manter como candidato, mas validar isoladamente com exemplos de uso.

### `Deck`

Mudanca atual:

- adiciona labels `moreOptions` e `closePopover`;
- fallback atual em ingles: `More options`, `Close popover`, `Duplicate`,
  `Edit`, `Delete`.

Diagnostico:

- Melhorar labels e correto.
- Fallbacks em ingles dentro de componente compartilhado sao inconsistentes com
  a regra de i18n/sem hardcoded copy.

Decisao recomendada:

- Reescrever para usar `i18n` de MonsanUI ou exigir labels do consumidor.
- Nao aceitar do jeito atual.

### `Tabs`

Mudanca atual:

- troca SVG inline por icone;
- adiciona labels i18n para nav;
- mantem estrutura visual atual.

Diagnostico:

- A parte de icon/i18n e aceitavel.
- O problema real de `Tabs` nao foi resolvido: spacing estrutural, default vs
  embedded, borda/padding/margem e relacao com `AppShell`.

Decisao recomendada:

- Separar icon/i18n em lote conservador se desejado.
- Auditar `Tabs` estruturalmente antes de padronizar suite.

### `Select`, `MultiSelect`, `LanguageSelector`, `ThemeSelector`, `AvatarMenu`

Mudanca atual:

- `Select`/`MultiSelect` recebem i18n/reduced-motion.
- `LanguageSelector`/`ThemeSelector` recebem only reduced-motion.
- `AvatarMenu` nao muda diretamente no diff, mas depende de `QuickActions`.

Diagnostico:

- Nao resolve a decisao principal: todos os dropdowns precisam convergir para um
  contrato visual comum de painel, padding, gap, hover, selected, borda, sombra
  e altura maxima.

Decisao recomendada:

- Tratar em fase propria de dropdowns/menus.
- Nao declarar isso como padronizacao concluida.

### `Search` E `SearchBar`

Mudanca atual:

- i18n de defaults;
- troca de SVGs;
- reduced-motion.

Diagnostico:

- A mudanca e conservadora, mas nao resolve a decisao de produto/UX:
  busca global via dialog/command palette e busca contextual inline/dialog por
  contexto responsivo.

Decisao recomendada:

- Manter partes internas se isoladas.
- Adiar contrato de busca para fase de navigation/forms.

## Descartar Ou Substituir

### `docs/component-inventory.md`

Problema:

- O arquivo foi expandido com uma lista grande de "completed and validated".
- Isso registra o lote amplo anterior, mas pode passar a falsa impressao de que
  a auditoria estrutural real ja aconteceu.
- O proprio `PLAN.md` agora diz que isso nao aconteceu corretamente.

Decisao recomendada:

- Substituir esse trecho por uma versao curta:
  - diff local existe;
  - validacoes historicas foram relatadas;
  - auditoria estrutural ainda esta pendente;
  - este arquivo nao deve ser tratado como aprovacao do diff.

### `docs/component-audits/*.md`

Problema:

- Os arquivos sao uteis como registro historico do que foi mexido.
- Eles nao cumprem integralmente o metodo atual do `PLAN.md`, porque nao
  registram para cada componente todos os pontos exigidos: DOM esperado,
  hierarquia, wrappers, consumidores, riscos e classificacao obrigatoria.

Decisao recomendada:

- Manter como referencia temporaria ou substituir gradualmente por auditorias
  novas por familia.
- Nao usar esses arquivos como autorizacao para implementar/refatorar.

## Adiar Para Auditoria Estrutural Real

Estes pontos exigem proposta propria antes de codigo:

- Remocao ou legado de `PageShell`, `PageContainer`, `AppViewport`,
  `RouteViewport`, `PageHeader` e `CenteredPanel`.
- Contrato final de `AppShell` com regioes `header`, `top`, `content`,
  `bottom`, `footer` e espacamento.
- Contrato de `DataCard`/cards com `top`, `body`, `bottom`.
- Contrato comum de dropdown/panel para `Select`, `MultiSelect`,
  `QuickActions`, menus de idioma, tema, avatar e filtros.
- Padronizacao de busca global/contextual.
- `Tabs` como componente de navegacao sem assumir espacamento estrutural de
  pagina.
- `FormField` como dono eventual de label/helper/error/aria-describedby.
- `FileUpload` com reducao real de repeticao entre variantes.
- Componentes DnD e `Calendar`, que exigem validacao visual/interativa antes de
  qualquer simplificacao maior.

## Ordem Recomendada A Partir Daqui

1. Criar um commit/lote conservador somente com mudancas internas de baixo
   risco, se o usuario aprovar.
2. Antes disso, remover ou reescrever os trechos problematicos listados em
   "Reescrever Antes De Aceitar".
3. Rodar `pnpm test` em `MonsanUI`.
4. So depois iniciar a primeira auditoria estrutural real por familia:
   `layout/page legacy`.

## Validacao Nesta Triagem

- Nao rodei `pnpm test` nesta triagem.
- Nao alterei codigo de componentes.
- Apenas li diffs e registrei este relatorio.
- Os avisos `dconf`/`sysroot` apareceram nos comandos de shell e parecem ser
  ruido do ambiente sandbox, nao erro do projeto.
