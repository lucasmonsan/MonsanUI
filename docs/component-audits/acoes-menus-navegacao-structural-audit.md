# Fase 5 - Acoes, Menus e Navegacao: auditoria estrutural

Data: 2026-06-22
Projeto: MonsanUI
Status: auditoria proposta, sem alteracao de codigo nesta etapa.

Componentes auditados:

- `Button`
- `IconButton`
- `ButtonGroup`
- `ActionBar`
- `QuickActions`
- `MenuItem`
- `MenuControl`
- `Avatar`
- `AvatarMenu`
- `SuiteHeaderActions`
- `SuiteUserMenu`
- `Tabs`
- `ThemeSelector`
- `LanguageSelector`
- `LegalLinks`
- `PreferenceBar`
- `MetricButton`

## Objetivo

Auditar a familia de acoes, menus e navegacao com foco em:

- separacao real entre `trigger`, `panel` e `item`;
- padronizacao de hover, focus, active, selected e disabled;
- separacao entre estilo do componente e espacamento de pagina;
- reducao de duplicacao entre botoes, itens de menu, tabs e dropdowns;
- compatibilidade com consumidores atuais;
- preservacao de acessibilidade e teclado.

Este documento tambem registra os diffs locais pendentes em `QuickActions` e
`Tabs`, sem aprovar automaticamente a implementacao.

## Estado do worktree no inicio da auditoria

Ha alteracoes locais pendentes antes desta auditoria:

- `src/lib/components/QuickActions.svelte`
- `src/lib/components/Tabs.svelte`
- `src/lib/components/Deck.svelte`
- `docs/component-inventory.md`
- auditorias antigas nao rastreadas em `docs/component-audits/`

Esta auditoria nao reverte nem incorpora essas mudancas. O unico arquivo novo
esperado nesta etapa e este relatorio.

## Contrato estrutural recomendado

### Acoes

`Button`, `IconButton`, `ActionBar`, `Tabs`, `MenuItem` e `MetricButton` usam a
mesma linguagem visual: borda, sombra, deslocamento no hover, deslocamento no
active, estado selected/active e foco visivel.

Contrato recomendado:

- estado visual base deve ser compartilhado por tokens ou regras internas
  comuns, nao refeito de forma divergente em cada componente;
- foco visivel deve ser explicito e consistente;
- `hover` e `active` devem respeitar `prefers-reduced-motion`;
- componentes de acao nao devem possuir margem externa;
- componentes de agrupamento podem possuir `gap` interno quando a propria
  composicao e a responsabilidade do componente.

### Menus e dropdowns

Contrato recomendado:

```text
trigger -> panel -> item/control
```

- `trigger`: elemento acionador real, preferencialmente `button`.
- `panel`: superficie, posicionamento, largura, padding, gap, max-height,
  escape/outside click e fechamento.
- `item`: acao ou navegacao dentro do painel.
- `control`: item persistente que nao fecha o painel automaticamente.

Regras:

- `QuickActions` deve ser dono do painel e do posicionamento.
- `MenuItem` deve ser o item padrao para menus de acoes e navegacao.
- `MenuControl` deve marcar areas persistentes dentro de menus.
- `ThemeSelector` e `LanguageSelector` nao devem reinventar `.dropdown-item`.
- `AvatarMenu` e `SuiteUserMenu` devem continuar sobre o mesmo contrato de
  `QuickActions`, mas sem padroes especiais de padding/gap que divirjam do
  painel comum.

### Placement e align

O contrato atual mistura `placement` e `align`.

Recomendacao:

- `placement` deve responder onde o painel aparece em relacao ao trigger:
  `below`, `above`, `before`, `after`.
- `align` deve responder a ancoragem no eixo perpendicular: `left` ou `right`.
- `variant="reveal"` nao deve reinterpretar `align` como se fosse
  posicionamento principal.
- A API publica pode ser preservada, mas a implementacao interna deve tratar
  esses conceitos sem conflito.

### Tabs

`Tabs` deve ser navegacao de estado, nao container de pagina.

Regras:

- `Tabs` nao deve impor margem negativa, largura maior que o pai ou padding
  estrutural externo quando usado como parte do `AppShell`.
- O modo `embedded` ja segue melhor esse contrato.
- O modo default ainda carrega legado visual/estrutural.
- Se `role="tablist"` e usado, o teclado deve seguir o padrao de tabs:
  Left/Right ou Up/Down, Home/End e foco/selecionar previsiveis.

## Mapa de consumidores

Uso observado:

- Manki
  - `Button`, `IconButton`, `ButtonGroup`, `ActionBar`, `Tabs`,
    `ThemeSelector`, `LanguageSelector`, `LegalLinks`, `PreferenceBar`,
    `QuickActions`, `MenuItem`, `Avatar`, `MetricButton`.
- Examster
  - `Button`, `IconButton`, `ButtonGroup`, `Tabs`, `ThemeSelector`,
    `LanguageSelector`, `LegalLinks`, `PreferenceBar`, `SuiteHeaderActions`.
- Owlth
  - `Button`, `Tabs`, `ThemeSelector`, `LanguageSelector`, `LegalLinks`,
    `PreferenceBar`, `SuiteHeaderActions`.
- Frequence
  - `Button`, `ThemeSelector`, `LanguageSelector`, `LegalLinks`,
    `PreferenceBar`.
- Shellfish
  - Nenhum uso encontrado em `src` nesta busca.

Conclusao: `Button`, `ThemeSelector`, `LanguageSelector`, `LegalLinks` e
`PreferenceBar` tem alto raio de impacto. `QuickActions`, `Tabs` e
`SuiteHeaderActions` sao visualmente sensiveis porque aparecem em headers,
menus e regioes `top` dos apps.

## Resumo executivo

| Componente           | Diagnostico                                                                            | Acao recomendada                                               |
| -------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `Button`             | Estrutura enxuta, mas estados visuais duplicam logica de outros botoes.                | Manter DOM; padronizar foco/estado em lote visual.             |
| `IconButton`         | Estrutura enxuta e correta para acao iconica.                                          | Manter DOM; alinhar estados com `Button`.                      |
| `ButtonGroup`        | Agrupador simples; gap interno e justificavel.                                         | Manter.                                                        |
| `ActionBar`          | Sem padding estrutural externo; toolbar correta, mas roving tabindex e parcial.        | Manter com hardening a11y futuro.                              |
| `QuickActions`       | Componente central, mas mistura trigger wrapper, panel, placement/align e fechamento.  | Recontratar internamente sem quebrar API.                      |
| `MenuItem`           | Item base bom, mas falta estado selected/current/checked.                              | Simplificar/padronizar como item unico de menu.                |
| `MenuControl`        | Wrapper minimo e funcional para itens persistentes.                                    | Manter.                                                        |
| `Avatar`             | Estrutura correta; botao real quando interativo.                                       | Manter com pequeno hardening de label default.                 |
| `AvatarMenu`         | Wrapper fino sobre `QuickActions`.                                                     | Manter; herdar correcao de `QuickActions`.                     |
| `SuiteHeaderActions` | Composicao util, mas bastante rigida.                                                  | Manter; adicionar opcao explicita de extras/sobre se aprovado. |
| `SuiteUserMenu`      | Boa composicao de `AvatarMenu` + `MenuItem`.                                           | Manter; avaliar `about` opcional.                              |
| `Tabs`               | Scroll wrappers justificaveis; default tem espacamento legado e falta teclado de tabs. | Recontratar parcialmente.                                      |
| `ThemeSelector`      | Usa `QuickActions`, mas recria item de dropdown e tem strings default.                 | Migrar itens para `MenuItem`/item comum.                       |
| `LanguageSelector`   | Mesmo problema do `ThemeSelector`; dropdown visual proprio.                            | Migrar itens para `MenuItem`/item comum.                       |
| `LegalLinks`         | Estrutura semantica boa; nao e menu.                                                   | Manter.                                                        |
| `PreferenceBar`      | Possui padding/borda estrutural que pode competir com container.                       | Simplificar ou criar variante separadora.                      |
| `MetricButton`       | Estrutura enxuta, mas duplica botao visual e nao tem disabled/focus explicito.         | Manter DOM; alinhar ao contrato de acao.                       |

## Diffs locais pendentes

### QuickActions

Diff pendente atual:

- troca `style="..."` por diretivas `style:--panel-width`,
  `style:--panel-max-height`, `style:--quick-actions-panel-padding` e
  `style:--quick-actions-panel-gap`;
- troca listener manual em `$effect` por `onclick={handlePanelClick}` no painel;
- preserva API publica atual.

Diagnostico:

- A mudanca e boa como limpeza interna.
- Ela nao resolve o problema estrutural maior: `trigger`, `panel`,
  `placement`, `align`, fechamento e semantica ainda estao concentrados em um
  unico componente sem contrato claro.
- Pode ser incorporada no primeiro lote de implementacao, mas nao deve ser o
  unico ajuste de `QuickActions`.

### Tabs

Diff pendente atual:

- troca SVG inline por `ChevronLeft`;
- adiciona labels i18n/props para botoes de scroll;
- troca estilo inline de mask por diretivas Svelte;
- adiciona reduced motion.

Diagnostico:

- A mudanca e boa como hardening conservador.
- Ela nao resolve:
  - teclado de tabs;
  - `aria-controls`/relacao com painel;
  - default com padding/margem/largura estruturais;
  - dependencia de `embedded` para ficar correto dentro do `AppShell`.
- Pode ser incorporada junto com o lote de `Tabs`, mas a aprovacao precisa
  considerar o recontrato parcial do componente.

## Auditoria por componente

### Button

Arquivo: `src/lib/components/Button.svelte`
Exportado: sim.

DOM atual:

```svelte
<button class="monsan-button {variant} size-{size} shape-{shape}">
	{@render children?.()}
</button>
```

Wrappers:

- Nenhum wrapper redundante.

Responsabilidades atuais:

- Renderizar acao semantica.
- Controlar variant, size, shape, disabled, block, square e ARIA basico.
- Controlar padding interno, borda, sombra, hover, active e disabled.

Diagnostico:

- Estrutura DOM correta.
- `block` e `square` sao contratos de tamanho, nao layout de pagina.
- `Button` nao tem `focus-visible` explicito, enquanto `MenuItem` tem.
- Estados visuais sao muito parecidos com `IconButton`, `ActionBar`,
  `MetricButton`, `Tabs` e `MenuItem`, mas cada componente declara os estados
  por conta propria.

Recomendacao:

- Manter DOM e API.
- Padronizar foco/hover/active via contrato interno comum em etapa aprovada.
- Nao mover `Button` para wrapper novo.

Classificacao: OK com hardening visual/a11y.

### IconButton

Arquivo: `src/lib/components/IconButton.svelte`
Exportado: sim.

DOM atual:

```svelte
<button class="monsan-icon-button {variant}" aria-label={label}>
	{@render children()}
</button>
```

Wrappers:

- Nenhum wrapper redundante.

Diagnostico:

- Estrutura correta para acao iconica.
- `selected` usa `aria-pressed`, o que e adequado para toggle.
- Estados visuais duplicam `Button`.
- Falta `focus-visible` explicito como padrao visual comum.

Recomendacao:

- Manter DOM e API.
- Alinhar foco/hover/active com `Button`.

Classificacao: OK com hardening visual/a11y.

### ButtonGroup

Arquivo: `src/lib/components/ButtonGroup.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-button-group">
	{@render children()}
</div>
```

Wrappers:

- O wrapper e necessario: ele define agrupamento, direcao e gap.

Diagnostico:

- `gap: var(--space-md)` pertence ao grupo, nao ao layout de pagina.
- `width: 100%` e aceitavel porque o grupo estica seus botoes; ainda assim,
  pode ser restritivo em contextos inline.

Recomendacao:

- Manter.
- Considerar `gap`/`stretch` como props apenas se aparecer demanda real.

Classificacao: OK.

### ActionBar

Arquivo: `src/lib/components/ActionBar.svelte`
Exportado: sim.

DOM atual:

```svelte
<div role="toolbar" class="monsan-action-bar">
	<button class="monsan-action-bar-item">...</button>
</div>
```

Wrappers:

- O wrapper e necessario para `role="toolbar"`, gap e navegacao por setas.

Diagnostico:

- Nao possui padding vertical estrutural externo, alinhado ao `AppShell`.
- O gap interno pertence ao toolbar.
- Roving focus existe parcialmente: apenas o primeiro item recebe
  `tabindex="0"`, e as setas movem foco via DOM query.
- O tab stop nao e atualizado para o ultimo item focado.

Recomendacao:

- Manter DOM.
- Em lote futuro, tornar roving tabindex stateful.
- Alinhar foco/hover/active com `Button`.

Classificacao: OK com hardening a11y.

### QuickActions

Arquivo: `src/lib/components/QuickActions.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-quick-actions-wrapper">
	<div class="quick-actions-trigger" role="button">...</div>
	<div class="quick-actions-panel" role="menu|toolbar">...</div>
</div>
```

Wrappers:

- Wrapper raiz e necessario para posicionamento relativo do painel.
- Trigger wrapper e necessario apenas quando `triggerBehavior="wrapper"`.
- Painel e necessario para superficie, posicionamento, gap, padding, largura,
  max-height, fechamento e transicao.

Diagnostico:

- `QuickActions` e o componente central desta familia.
- Ele mistura quatro responsabilidades:
  - controle de abertura;
  - semantica do trigger;
  - posicionamento do painel;
  - comportamento de itens dentro do painel.
- `triggerBehavior="wrapper"` pode criar `role="button"` envolvendo conteudo
  interativo, dependendo do snippet recebido.
- `triggerBehavior="child"` e mais seguro quando o trigger ja e um `Button`,
  `IconButton` ou `Avatar`.
- `placement` e `align` ainda podem se confundir, principalmente em
  `variant="reveal"`.
- `panelPadding`, `panelGap`, `panelShadow` sao bons sinais de contrato, mas
  precisam ser o contrato comum para menus/dropdowns da suite.
- O fechamento automatico procura `button, a`, o que funciona para menus, mas
  pode ser limitado para componentes customizados com `role="menuitem"` ou
  controles compostos.

Recomendacao:

- Preservar API publica, mas recontratar internamente:
  - `trigger` deve ser preferencialmente child/elemento semantico real;
  - painel deve ter contrato unico para dropdown/reveal;
  - `placement` e `align` devem ser resolvidos por uma camada unica de
    posicionamento;
  - fechamento deve reconhecer `data-menu-persistent` e itens semanticos;
  - `role="menu"` deve ser usado apenas quando filhos seguem semantica de menu.
- Incorporar o diff local de listener/estilos como parte do lote aprovado.

Classificacao: Recontratar.

### MenuItem

Arquivo: `src/lib/components/MenuItem.svelte`
Exportado: sim.

DOM atual:

```svelte
{#if href && !disabled}
	<a role="menuitem">...</a>
{:else}
	<button role="menuitem">...</button>
{/if}
```

Wrappers:

- Nenhum wrapper redundante.

Diagnostico:

- A dualidade `a`/`button` esta semanticamente correta:
  - `a` para navegacao;
  - `button` para acao.
- Visualmente ambos usam a mesma classe, entao devem ter mesmo padding/gap.
- Falta estado padrao para item selecionado/atual:
  - `selected`;
  - `aria-current`;
  - `aria-checked` quando o menu representa opcoes.
- `ThemeSelector` e `LanguageSelector` deveriam usar este componente ou um item
  base derivado dele, em vez de recriar `.dropdown-item`.

Recomendacao:

- Manter dualidade `a`/`button`.
- Adicionar props de estado quando aprovado.
- Usar como item padrao em menus de idioma/tema/avatar.

Classificacao: Simplificar/padronizar.

### MenuControl

Arquivo: `src/lib/components/MenuControl.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-menu-control" data-menu-persistent>
	{@render children()}
</div>
```

Wrappers:

- Wrapper necessario para marcar area persistente no menu.

Diagnostico:

- Estrutura minima.
- `data-menu-persistent` se integra ao fechamento automatico de `QuickActions`.
- Nao possui visual proprio alem de alinhamento.

Recomendacao:

- Manter.

Classificacao: OK.

### Avatar

Arquivo: `src/lib/components/Avatar.svelte`
Exportado: sim.

DOM atual:

```svelte
{#if onclick}
	<button class="monsan-avatar interactive">...</button>
{:else}
	<div class="monsan-avatar">...</div>
{/if}
```

Wrappers:

- Sem wrapper redundante.
- Snippet interno evita duplicacao de imagem/fallback.

Diagnostico:

- A decisao de usar `button` quando interativo esta correta.
- Hover/active ja seguem comportamento de botao.
- O fallback usa string default `Avatar`, que e texto de acessibilidade dentro
  de MonsanUI.

Recomendacao:

- Manter DOM.
- Considerar `fallbackLabel` ou exigir `ariaLabel`/`alt` quando sem `name`.

Classificacao: OK com pequeno hardening a11y/i18n.

### AvatarMenu

Arquivo: `src/lib/components/AvatarMenu.svelte`
Exportado: sim.

DOM atual:

```svelte
<QuickActions triggerBehavior="child">
	{#snippet trigger(toggle)}
		<Avatar onclick={toggle} />
	{/snippet}
	{@render children?.()}
</QuickActions>
```

Diagnostico:

- Estrutura correta: `Avatar` e trigger real, `QuickActions` e painel.
- Nao ha duplicacao propria de painel.
- Herda os problemas e acertos de `QuickActions`.

Recomendacao:

- Manter.
- Nao criar painel especifico de avatar fora de `QuickActions`.
- Garantir que defaults de padding/gap sigam o contrato comum.

Classificacao: OK, dependente de `QuickActions`.

### SuiteHeaderActions

Arquivo: `src/lib/components/SuiteHeaderActions.svelte`
Exportado: sim.

DOM atual:

```svelte
<Inline gap="sm" align="center">
	children
	<ThemeSelector />
	<LanguageSelector />
	<SuiteUserMenu />
</Inline>
```

Diagnostico:

- Composicao util para headers da suite.
- `gap="sm"` e interno ao grupo de acoes de header, nao espacamento de pagina.
- A API e extensa porque repassa muitas props para `SuiteUserMenu`.
- A opcao `userMenuExtras` permite inserir itens extras no menu, mas nao existe
  contrato explicito para item `Sobre`.

Recomendacao:

- Manter como componente de composicao.
- Considerar props opcionais `aboutLabel`, `aboutHref`, `onAbout` ou documentar
  `userMenuExtras` como contrato oficial.
- Nao transformar em layout de pagina.

Classificacao: OK com melhoria de contrato.

### SuiteUserMenu

Arquivo: `src/lib/components/SuiteUserMenu.svelte`
Exportado: sim.

DOM atual:

```svelte
<AvatarMenu>
	<MenuItem>Profile/Login</MenuItem>
	children
	<MenuItem>Terms</MenuItem>
	<MenuItem>Privacy</MenuItem>
	<MenuItem>Logout</MenuItem>
</AvatarMenu>
```

Diagnostico:

- Boa composicao sobre `AvatarMenu` e `MenuItem`.
- O menu usa `a` quando ha `href` e `button` quando ha acao. Isso e correto
  semanticamente, desde que o visual seja identico.
- `children` ja permite item extra, mas nao deixa claro no contrato que pode
  representar `Sobre`.
- `panelPadding` e `panelGap` sao repassados, o que esta alinhado ao contrato
  comum de painel.

Recomendacao:

- Manter estrutura.
- Adicionar item `about` opcional se aprovado.
- Garantir que todos os itens usem `MenuItem`; hoje sim.

Classificacao: OK com melhoria de contrato.

### Tabs

Arquivo: `src/lib/components/Tabs.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-tabs-wrapper">
	<div class="monsan-tabs-nav-wrapper">...</div>
	<div class="monsan-tabs-container" role="tablist">
		<button role="tab">...</button>
	</div>
	<div class="monsan-tabs-nav-wrapper">...</div>
</div>
```

Wrappers:

- Wrapper raiz e necessario para nav buttons absolutos e mascaras.
- Nav wrappers sao necessarios quando ha scroll/nav.
- Container e necessario para `role="tablist"` e scroll.

Diagnostico:

- Wrappers sao justificaveis.
- O default ainda possui:
  - `padding: 16px 16px var(--space-sm) 16px`;
  - `margin: -12px -12px 0 -12px`;
  - `width: calc(100% + 24px)`;
  - `border-bottom`.
- O modo `embedded` remove esses efeitos e e o que os apps atuais usam.
- Falta keyboard navigation propria de tabs.
- Falta relacao `aria-controls`/`id` com tab panels, embora os paineis estejam
  fora deste componente.
- `itemSnippet` permite consumidor renderizar item customizado e pode quebrar a
  semantica se nao renderizar `role="tab"`.

Recomendacao:

- Incorporar diff local de i18n/icon/reduced-motion.
- Recontratar default para nao carregar espacamento estrutural de pagina.
- Implementar teclado de tabs.
- Adicionar contrato opcional para `tabId`/`panelId` ou documentar quando
  `Tabs` e apenas seletor visual.

Classificacao: Recontratar parcialmente / risco alto visual.

### ThemeSelector

Arquivo: `src/lib/components/ThemeSelector.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="theme-dropdown-wrapper">
	<Button>trigger</Button>
	<QuickActions>
		<button class="dropdown-item" role="menuitem">...</button>
	</QuickActions>
</div>
```

Diagnostico:

- Usa `Button` e `QuickActions`, o que e bom.
- Recria `.dropdown-item` local, divergindo de `MenuItem`.
- Com ate duas opcoes, nao abre dropdown: o trigger alterna direto.
- Possui labels default em ingles e aria label default em portugues dentro de
  MonsanUI.
- Icones ainda possuem SVG inline para dark/outros temas.

Recomendacao:

- Usar `MenuItem` ou item base compartilhado para opcoes.
- Decidir se seletor com duas opcoes deve continuar toggle direto ou sempre
  dropdown. A decisao afeta a consistencia entre idioma/tema.
- Mover defaults de strings para props/i18n hook da biblioteca ou exigir props
  dos consumidores.

Classificacao: Recontratar parcialmente.

### LanguageSelector

Arquivo: `src/lib/components/LanguageSelector.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="locale-dropdown-wrapper">
	<Button>trigger</Button>
	<QuickActions>
		<button class="dropdown-item" role="menuitem">...</button>
	</QuickActions>
</div>
```

Diagnostico:

- Mesmo padrao estrutural de `ThemeSelector`.
- Recria item de dropdown.
- Usa `QuickActions` com trigger `Button`.
- Possui strings default hardcoded em MonsanUI.

Recomendacao:

- Usar `MenuItem` ou item base compartilhado.
- Padronizar selected/active com `MenuItem`.
- Rever defaults de strings.

Classificacao: Recontratar parcialmente.

### LegalLinks

Arquivo: `src/lib/components/LegalLinks.svelte`
Exportado: sim.

DOM atual:

```svelte
<nav class="monsan-legal-links">
	<p class="legal-note">...</p>
	<div class="legal-link-row">
		<a>Terms</a>
		<span aria-hidden>·</span>
		<a>Privacy</a>
	</div>
</nav>
```

Diagnostico:

- `nav` e semantico.
- `legal-link-row` e necessario para flex/wrap e separador.
- `gap` interno pertence ao componente.
- Nao e menu nem dropdown.

Recomendacao:

- Manter.

Classificacao: OK.

### PreferenceBar

Arquivo: `src/lib/components/PreferenceBar.svelte`
Exportado: sim.

DOM atual:

```svelte
<footer class="monsan-preference-bar">
	{@render children()}
</footer>
```

CSS atual:

```css
gap: var(--space-md);
padding-top: var(--space-lg);
border-top: ...;
```

Diagnostico:

- O footer semantico e aceitavel quando usado no rodape de landing/auth.
- `gap` pertence ao grupo.
- `padding-top` e `border-top` podem competir com o container pai ou com regioes
  `bottom/footer` do `AppShell`.
- Hoje e usado em landing/auth de Manki, Examster, Owlth e Frequence.

Recomendacao:

- Simplificar para grupo de preferencias sem separador estrutural por default.
- Se o separador for desejado, criar `separated`/`variant` opt-in.
- Validar landing/auth nos consumidores antes de publicar.

Classificacao: Simplificar / risco visual medio.

### MetricButton

Arquivo: `src/lib/components/MetricButton.svelte`
Exportado: sim.

DOM atual:

```svelte
<button class="monsan-metric-button" aria-label="label: value">
	<span class="metric-value">...</span>
	<span class="metric-icon">...</span>
</button>
```

Diagnostico:

- Estrutura enxuta.
- Representa um botao de metrica, hoje usado no Manki.
- Duplica estilo de acao: borda, sombra, hover, active.
- Nao possui disabled/loading.
- Nao possui foco explicito.

Recomendacao:

- Manter DOM.
- Alinhar visual/foco com contrato comum de botoes.
- Nao transformar em `Button` imediatamente, porque tem composicao propria de
  valor + icone.

Classificacao: OK com hardening visual/a11y.

## Ordem de implementacao recomendada apos aprovacao

### Commit 1 - Hardening conservador de diffs pendentes

Escopo:

- `QuickActions`: manter troca para diretivas `style:` e `onclick` declarativo
  no painel.
- `Tabs`: manter i18n de scroll labels, icone compartilhado e reduced motion.

Motivo:

- Baixo risco.
- Nao altera contrato publico.
- Ja estava pendente localmente e e coerente com o plano.

Validacao:

- `pnpm test` em MonsanUI.

### Commit 2 - Contrato de item/painel de menu

Escopo:

- `MenuItem`: adicionar estado `selected/current/checked` conforme decisao.
- `ThemeSelector` e `LanguageSelector`: trocar `.dropdown-item` local por
  `MenuItem` ou item base compartilhado.
- `QuickActions`: ajustar fechamento para reconhecer itens semanticos e manter
  `MenuControl`.

Decisoes necessarias:

- manter toggle direto em `ThemeSelector` com duas opcoes ou sempre abrir
  dropdown;
- nome/contrato de selected em `MenuItem`.

Validacao:

- `pnpm test` em MonsanUI.
- Manki, Examster, Owlth e Frequence nas landing/header pages.

### Commit 3 - QuickActions placement/align

Escopo:

- Resolver internamente `placement` e `align` sem conflito.
- Garantir que `dropdown` e `reveal` usem a mesma logica conceitual.
- Preferir triggers semanticos reais e reduzir uso de
  `triggerBehavior="wrapper"` onde possivel.

Validacao:

- `pnpm test` em MonsanUI.
- Manki deck actions e avatar menu.
- Suite header actions em Manki, Examster e Owlth.

### Commit 4 - Tabs e spacing estrutural

Escopo:

- Tornar `Tabs` seguro como componente de `AppShell top` sem depender de
  margem negativa/padding legado.
- Implementar teclado de tabs.
- Avaliar `aria-controls`/ids.

Validacao:

- `pnpm test` em MonsanUI.
- Manki stats.
- Examster dashboard/admin.
- Owlth portal.
- Validacao visual obrigatoria.

### Commit 5 - PreferenceBar e acoes menores

Escopo:

- `PreferenceBar`: remover separador estrutural por default ou criar variante
  opt-in.
- `Button`, `IconButton`, `ActionBar`, `MetricButton`: foco visual comum.
- `Avatar`: hardening de label fallback.
- `SuiteUserMenu`: opcao `about` se aprovada.

Validacao:

- `pnpm test` em MonsanUI.
- Landings/auth/legal pages nos consumidores.

## Decisoes solicitadas

Antes de alterar codigo, preciso de aprovacao para:

1. Incorporar os diffs locais conservadores de `QuickActions` e `Tabs`.
2. Padronizar `ThemeSelector` e `LanguageSelector` sobre `MenuItem` ou item
   base comum.
3. Definir se `ThemeSelector` com duas opcoes continua toggle direto ou passa a
   abrir dropdown como `LanguageSelector`.
4. Recontratar internamente `QuickActions` para separar melhor `trigger`,
   `panel`, `placement`, `align` e fechamento.
5. Recontratar `Tabs` para remover comportamento estrutural legado do default e
   adicionar teclado apropriado.
6. Simplificar `PreferenceBar` removendo `padding-top`/`border-top` por default
   ou criando uma variante opt-in.
7. Adicionar estado opcional de `about` em `SuiteUserMenu`/`SuiteHeaderActions`
   ou documentar `userMenuExtras` como contrato oficial.
