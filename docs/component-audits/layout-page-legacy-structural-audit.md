# Layout/Page Legacy Structural Audit

Escopo: `PageShell`, `PageContainer`, `AppViewport`, `RouteViewport`,
`PageHeader`, `CenteredPanel`, `ActionBar` e o contrato estrutural com
`AppShell`.

Data: 2026-06-22

Branch local: `fix/exam-badge-mobile-scaling`

## Estado Do Worktree Durante A Auditoria

Existe diff local pendente em `MonsanUI` que nao faz parte desta auditoria:

- `docs/component-inventory.md`
- `src/lib/components/ActionBar.svelte`
- `src/lib/components/DataCard.svelte`
- `src/lib/components/Deck.svelte`
- `src/lib/components/ExpandableCard.svelte`
- `src/lib/components/QuickActions.svelte`
- `src/lib/components/Tabs.svelte`
- arquivos antigos em `docs/component-audits/*.md`

Esta auditoria nao altera codigo de componentes. Ela documenta o contrato antes
de qualquer implementacao.

Observacao sobre `ActionBar`: o worktree local ja tem uma alteracao pendente que
remove `padding: var(--space-sm) 0`; no `HEAD` oficial essa linha ainda existe.
Esta auditoria trata essa remocao como proposta, nao como estado aprovado.

## Uso Atual Nos Consumidores

### Koalify

- Usa `AppShell` nas rotas principais, publicas e admin.
- Usa `CenteredPanel` dentro de `AppShell` em landing, auth/link, exam loading e
  loading/admin states.
- Nao usa `PageShell`, `PageContainer`, `AppViewport`, `RouteViewport` nem
  `PageHeader` diretamente.

### Manki

- Usa `AppShell` nas rotas principais, landing, terms/privacy, study, stats e
  deck management.
- Usa `ActionBar` na home autenticada, dentro da regiao `top` do `AppShell`.
- Usa `CenteredPanel` dentro de `AppShell` na landing.
- Nao usa `PageShell`, `PageContainer`, `AppViewport`, `RouteViewport` nem
  `PageHeader` diretamente.

### Owlth

- Ainda usa `PageContainer` no root layout, dentro de um `<main>`.
- Usa `PageShell` em `OwlthPortal`.
- Usa `AppViewport` em `OwlthPortal` e em `terms`/`privacy`.
- Usa `CenteredPanel` em fluxos sem sessao dentro de `OwlthPortal`.
- Esse e o consumidor bloqueante para remover ou quebrar os wrappers legados.

### Frequence

- Ja usa `AppShell` nas rotas existentes.
- Usa `CenteredPanel` dentro de `AppShell` na landing.
- Esta em desenvolvimento por outro agente; nao deve ser alterado nesta etapa.

### Shellfish

- Nao foi contado como consumidor validavel neste passe porque o checkout atual
  nao tem `package.json` em estado normal.

## Contrato Estrutural Proposto

`AppShell` deve ser o unico contrato de pagina para novas telas da suite.

Estrutura canonica:

```svelte
<AppShell>
	{#snippet header()}...{/snippet}
	{#snippet top()}...{/snippet}

	<!-- conteudo que scrolla -->

	{#snippet bottom()}...{/snippet}
	{#snippet footer()}...{/snippet}
</AppShell>
```

Regioes opcionais:

- `header`: cabecalho principal da pagina/app. Normalmente contem `AppHeader`.
- `top`: barras abaixo do header, como `Tabs`, `ActionBar`, banners e filtros.
- `children`: conteudo principal com scroll interno.
- `bottom`: barras acima do footer/conteudo final, como acoes contextuais.
- `footer`: rodape fixo dentro do shell, quando a tela realmente precisar.

Responsabilidades exclusivas de `AppShell`:

- ocupar a altura disponivel da rota;
- aplicar padding externo com safe-area;
- centralizar a pagina com `max-width`;
- controlar o gap vertical entre regioes;
- controlar scroll interno do conteudo;
- controlar fade/bordas de overflow do conteudo;
- garantir que regioes fixas (`header`, `top`, `bottom`, `footer`) nao
  disputem scroll com o conteudo;
- fornecer espacamento padrao consistente entre regioes.

Valores estruturais padrao:

- padding externo: `app`;
- max-width: `var(--container-max-width)`;
- gap entre regioes: `var(--space-sm)`;
- gap interno do conteudo scrollavel: `var(--space-md)`;
- distancia extra antes do content quando existe `header` ou `top`:
  `var(--space-sm)`;
- separacao entre multiplos itens em `top`/`bottom`: `var(--space-sm)` com
  divisor superior no item posterior.

Responsabilidades dos filhos:

- `AppHeader`: apresenta brand/titulo/acoes; nao controla padding externo da
  pagina.
- `ActionBar`: apresenta acoes; nao deve ter padding vertical estrutural.
- `Tabs`: apresenta navegacao; nao deve empurrar content com margin/padding de
  pagina.
- `PageHeader`: se mantido, deve ser conteudo ou legado, nao shell/header de
  app.
- `CenteredPanel`: centraliza uma superficie dentro do content; nao deve criar
  outro viewport.

Regra de dividers:

- `AppShell` e dono da separacao estrutural entre regioes.
- `AppHeader` pode manter seu visual interno, mas quando usado em
  `AppShell.header`, o shell remove borda duplicada de `.app-header-inner`.
- `Content` continua com sua logica propria de borda/fade somente quando ha
  overflow.
- Componentes dentro de `top` e `bottom` nao devem criar linha estrutural extra
  entre header/top/content.

## Auditoria Por Componente

### `AppShell`

Arquivo: `src/lib/components/AppShell.svelte`

Exportado: sim.

DOM atual:

- `<main class="monsan-app-shell">`
- opcional `<header class="app-shell-header">`
- opcional `<div class="app-shell-top">`
- `<div class="app-shell-scroll">`
- `<div class="app-shell-content">`
- opcional `<div class="app-shell-bottom">`
- opcional `<footer class="app-shell-footer">`

Leitura estrutural:

- Esta e a estrutura mais proxima do contrato correto.
- O componente ja centraliza pagina, aplica padding seguro, controla scroll e
  regioes fixas.
- A tag `main` esta correta porque o shell contem o conteudo principal da
  pagina.
- O wrapper `app-shell-scroll` e necessario para scroll/fade.
- O wrapper `app-shell-content` e necessario para gap, min-height e pseudo
  elementos de fade.

Riscos:

- `app-shell-content::before/after` usa borda de overflow; nao deve ser
  confundido com divisor sempre visivel.
- A regra `.app-shell-top > * + *` aplica padding/borda entre multiplos itens;
  isso precisa ser mantido coerente com `Tabs`/`ActionBar`.

Classificacao: `OK`.

Recomendacao:

- Manter como contrato canonico.
- Nao criar novo shell paralelo.
- Avaliar em uma etapa futura se `--container-max-width` muda de `1200px` para
  `1280px`; isso e decisao global de token, nao deste componente isolado.

### `PageShell`

Arquivo: `src/lib/components/PageShell.svelte`

Exportado: sim.

DOM atual:

- `<svelte:element class="monsan-page-shell ...">`
- renderiza filhos diretamente.

Leitura estrutural:

- Controla `max-width`, padding, gap, altura e overflow.
- Duplica responsabilidades que hoje devem ser de `AppShell`.
- Ainda e usado por `Owlth` em `OwlthPortal`.

Wrappers:

- Nao tem wrapper interno extra; o problema nao e excesso de DOM, e
  responsabilidade duplicada.

Riscos:

- Remover agora quebra Owlth.
- Manter como alternativa ativa incentiva novas paginas a fugir do contrato
  canonico.

Classificacao: `Legado`.

Recomendacao:

- Deprecar para novos usos.
- Migrar Owlth para `AppShell`.
- Depois da migracao, remover export ou manter apenas como alias temporario
  documentado.

### `PageContainer`

Arquivo: `src/lib/components/PageContainer.svelte`

Exportado: sim.

DOM atual:

- `<div class="monsan-page-container">`
- renderiza filhos diretamente.

Leitura estrutural:

- Controla `max-width`, padding, altura e flex.
- E usado por `RouteViewport` e pelo root layout do Owlth.
- Duplica parte do papel de `AppShell`.

Wrappers:

- O elemento unico e simples, mas se torna redundante quando colocado abaixo de
  `AppShell`.

Riscos:

- Remover agora quebra Owlth.
- Usar dentro de pagina nova pode criar max-width/padding concorrente.

Classificacao: `Legado`.

Recomendacao:

- Proibir novos usos em apps consumidores.
- Migrar Owlth root layout para nao embrulhar as rotas com `PageContainer`.
- Depois disso, manter temporariamente apenas para compatibilidade ou remover
  em major/internal cleanup.

### `AppViewport`

Arquivo: `src/lib/components/AppViewport.svelte`

Exportado: sim.

DOM atual:

- `<section class="monsan-app-viewport">`
- opcional `<div class="app-viewport-fixed">`
- opcional `<div class="app-viewport-header">`
- opcional `<div class="app-viewport-toolbar">`
- `<div class="app-viewport-scroll">`
- `<div class="app-viewport-content">`
- opcional `<div class="app-viewport-footer">`

Leitura estrutural:

- E um shell antigo com header/toolbar/content/footer.
- Controla viewport, padding, max-width por regiao, gap, scroll e fade.
- Funcionalmente sobrepoe `AppShell`.
- Ainda e usado por Owlth.

Wrappers:

- `app-viewport-fixed`, `header`, `toolbar`, `scroll`, `content` e `footer`
  tinham funcao real no contrato antigo.
- Nao devem ser simplificados isoladamente; o caminho correto e migracao para
  `AppShell`.

Riscos:

- Alto risco visual em Owlth.
- Alto risco de repetir os problemas ja vistos em Manki stats/home: regioes
  diferentes com props diferentes geram padding/max-width divergentes.

Classificacao: `Legado`.

Recomendacao:

- Migrar Owlth `AppViewport` para `AppShell`.
- Mapear `toolbar` para `top`.
- Mapear `footer` para `footer`.
- Mapear `contentMaxWidth/headerMaxWidth/...` para o max-width unico do
  `AppShell`, salvo caso real aprovado.
- Depois da migracao, nao manter `AppViewport` como opcao recomendada.

### `RouteViewport`

Arquivo: `src/lib/components/RouteViewport.svelte`

Exportado: sim.

DOM atual:

- `<section class="monsan-route-viewport">`
- keyed `<div class="route-container">`
- `<div class="page-content-wrapper">`
- `<PageContainer>`

Leitura estrutural:

- O componente combina transicao de rota com estrutura de pagina.
- Depende de `PageContainer`.
- Nao e mais necessario quando a rota renderiza diretamente `AppShell`.

Wrappers:

- `route-container` e `page-content-wrapper` existem para transicao/flex.
- A composicao com `PageContainer` e redundante no contrato novo.

Riscos:

- Remover sem migracao pode afetar rotas antigas com transicao.
- Nao apareceu como uso direto em Koalify, Manki, Owlth ou Frequence nesta
  busca; o risco principal e compatibilidade de export publico.

Classificacao: `Legado`.

Recomendacao:

- Deprecar.
- Se ainda precisarmos de transicao de rota, criar componente menor de
  transicao que nao controle padding/max-width/scroll.
- Remover composicao com `PageContainer` em etapa futura.

### `PageHeader`

Arquivo: `src/lib/components/PageHeader.svelte`

Exportado: sim.

DOM atual:

- `<header class="monsan-page-header">`
- `<div class="header-main">`
- opcionais `leading`, `copy`, `actions`, `meta`.

Leitura estrutural:

- E um header de conteudo, nao o header canonico de app.
- Controla propria borda/padding quando `border=true`.
- Sobrepoe parcialmente `AppHeader`, mas tem utilidade para secoes internas se
  for reposicionado conceitualmente.

Wrappers:

- `header-main`, `header-copy`, `header-actions` e `header-meta` tem funcao
  real.
- Nao ha wrapper obviamente descartavel.

Riscos:

- Usar como `AppShell.header` cria padrao visual diferente de `AppHeader`.
- A borda propria pode duplicar divisores do shell.

Classificacao: `Legado`.

Recomendacao:

- Nao usar como header principal de pagina.
- Renomear conceitualmente/documentar como section/content header ou migrar usos
  futuros para `SectionHeading`.
- Se continuar exportado, default `border` deve ser reavaliado para nao criar
  divisores estruturais fora do shell.

### `CenteredPanel`

Arquivo: `src/lib/components/CenteredPanel.svelte`

Exportado: sim.

DOM atual:

- `<div class="monsan-centered-panel">`
- `<Panel tag="section">`
- `<div class="centered-panel-content">`

Leitura estrutural:

- E util como composicao de landing/auth/empty states.
- Hoje ainda pode atuar como viewport proprio quando `fullHeight=true`, usando
  `height: 100dvh` e scroll proprio.
- Dentro de `AppShell`, isso compete com o shell quando usado com `fullHeight`
  verdadeiro.

Wrappers:

- Root flex centralizador: necessario.
- `Panel`: necessario se o componente continuar sendo uma superficie pronta.
- `centered-panel-content`: necessario para gap/alinhamento interno.

Riscos:

- `fullHeight=true` por default e perigoso dentro de `AppShell`.
- O padding externo do `CenteredPanel` pode concorrer com padding do shell.

Classificacao: `Recontratar`.

Recomendacao:

- Definir `CenteredPanel` como conteudo centralizado dentro do container pai.
- Em `AppShell`, ele deve preencher a area disponivel por flex, nao por
  `100dvh`.
- Avaliar mudar default de `fullHeight` para `false` ou substituir por
  `fillParent`.
- Manter padding interno configuravel, mas evitar que ele vire padding de
  pagina.

### `ActionBar`

Arquivo: `src/lib/components/ActionBar.svelte`

Exportado: sim.

DOM atual:

- `<div class="monsan-action-bar" role="toolbar">`
- lista de `<button class="monsan-action-bar-item">`

Leitura estrutural:

- E uma barra de acoes, nao um container de pagina.
- Deve controlar gap horizontal, flex dos itens e navegacao por teclado.
- No `HEAD`, ainda tem `padding: var(--space-sm) 0`; isso e espacamento
  estrutural externo e concorre com `AppShell.top`.
- No worktree local pendente, esse padding ja foi removido.

Wrappers:

- O root toolbar e necessario.
- Os botoes sao os itens interativos reais.
- Nao ha wrapper redundante.

Riscos:

- Remover padding altera visual de Manki home e qualquer uso futuro.
- Porem manter padding cria espacamento inconsistente entre `ActionBar`, `Tabs`
  e outros componentes em `AppShell.top`.
- Roving tabindex atual deixa apenas o primeiro item tabbable e nao atualiza
  estado do ultimo foco; isso e melhoria futura de a11y, nao bloqueio deste
  contrato de layout.

Classificacao: `Simplificar`.

Recomendacao:

- Remover padding vertical estrutural.
- Manter `gap: var(--space-sm)`.
- Deixar `AppShell.top` controlar distancia entre header/top/content.
- Validar Manki home apos atualizar consumidor.

## Proposta De Implementacao

### Etapa 1 - Layout contract em MonsanUI

Sem mexer em consumidores ainda:

1. `ActionBar`: remover padding vertical estrutural.
2. `CenteredPanel`: ajustar contrato para preencher pai quando usado dentro de
   `AppShell`, sem impor `100dvh` por default em composicoes modernas.
3. Documentar/deprecar `PageShell`, `PageContainer`, `AppViewport` e
   `RouteViewport` como legado.
4. Opcional: adicionar comentarios de desenvolvimento ou docs, nao warnings em
   runtime.

Validacao:

- `pnpm test` em `MonsanUI`.

### Etapa 2 - Migracao Owlth

1. Remover `PageContainer` do root layout do Owlth.
2. Migrar `OwlthPortal` de `PageShell` + `AppViewport` para `AppShell`.
3. Mapear `AppViewport.toolbar` para `AppShell.top`.
4. Manter `CenteredPanel` apenas como conteudo centralizado dentro do shell.

Validacao:

- `pnpm update monsan-ui`.
- `pnpm test` em Owlth.
- Conferir login/portal/terms/privacy visualmente quando possivel.

### Etapa 3 - Consumidores Que Ja Usam AppShell

1. Atualizar Manki e Koalify com o novo MonsanUI.
2. Validar especialmente:
   - Manki home com `ActionBar` em `top`;
   - Manki stats com `Tabs` em `top`;
   - Koalify landing/auth centered panels;
   - Koalify professor/admin pages com header/top/content.

Validacao:

- `pnpm test` em Manki e Koalify.

## Decisoes Que Precisam De Aprovacao Antes De Codigo

1. `ActionBar`: aprovar remocao definitiva do padding vertical estrutural.
2. `CenteredPanel`: aprovar mudanca de contrato para preencher pai em vez de
   usar `100dvh` como default moderno.
3. `PageShell`, `PageContainer`, `AppViewport`, `RouteViewport`: aprovar
   marcacao como legado e migracao de Owlth.
4. `PageHeader`: aprovar que nao deve ser header principal de pagina; se ficar,
   sera header de conteudo/secao.

## Nao Fazer Nesta Fase

- Nao alterar `Tabs` ainda; ela pertence a proxima auditoria de
  navigation/bars, apesar de participar da regiao `top`.
- Nao alterar `ContentRegion` nesta fase.
- Nao remover exports publicos ate consumidores estarem migrados.
- Nao mexer em Frequence enquanto outro agente estiver conduzindo o app.

## Validacao Desta Auditoria

- Nenhum componente foi alterado.
- Nenhum teste foi rodado porque a mudanca e apenas documental.
- Os avisos `dconf`/`sysroot` apareceram nos comandos de shell e continuam
  sendo ruido do ambiente.
