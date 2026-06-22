# Fase 4 - Superficies e Cards: auditoria estrutural

Data: 2026-06-22
Projeto: MonsanUI
Familia: `Panel`, `DataCard`, `AppCard`, `ConsolePanel`, `Alert`, `InlineNotice`, `EmptyState`, `StatusPill`, `StatusBanner`, `ExpandableCard`, `FlipCard`
Status: auditoria proposta, sem alteracao de codigo nesta etapa.

## Objetivo

Auditar a familia de superficies e cards com o mesmo criterio usado na
refatoracao do `AppShell`: manter a estetica e o comportamento publico, mas
remover estrutura redundante, padronizar contratos internos e evitar que
componentes de superficie assumam responsabilidade de layout de pagina.

Esta auditoria tambem mapeia os diffs locais ja pendentes em `DataCard` e
`ExpandableCard`, porque eles afetam diretamente a proposta de contrato
estrutural desta familia.

## Estado do worktree no inicio da auditoria

Ha alteracoes locais pendentes antes desta auditoria:

- `src/lib/components/DataCard.svelte`
- `src/lib/components/ExpandableCard.svelte`
- outros arquivos de auditorias/inventario e componentes fora desta familia

Estas alteracoes nao foram revertidas nem consolidadas aqui. Este documento
apenas registra o diagnostico e a proposta para aprovacao antes de qualquer
mudanca adicional de codigo.

## Contrato estrutural recomendado para a familia

1. Superficie visual e layout externo sao responsabilidades separadas.
   - O componente de superficie pode controlar borda, fundo, raio, sombra,
     padding interno e estados visuais.
   - O componente nao deve impor margem externa, `align-self`, max-width de
     pagina ou espacamento entre secoes da page.

2. Cards verticais reutilizaveis devem seguir o contrato `top/body/bottom`.
   - `top`: regiao superior fixa, opcional.
   - `body`: regiao central, deve ocupar a altura disponivel quando o card usa
     altura total.
   - `bottom`: regiao inferior fixa, opcional, sempre no fim do card.
   - Se `top` nao existir, `body` comeca no topo.
   - Se `bottom` nao existir, `body` ocupa ate o fim.
   - Se nenhum snippet existir, `children` ocupa o corpo.

3. Nomes antigos devem ser preservados apenas como aliases quando necessario.
   - `footer` em cards deve ser tratado como legado/alias de `bottom`, nao como
     uma segunda regiao estrutural concorrente.

4. Componentes interativos nao devem criar raiz `role="button"` contendo outros
   botoes ou links.
   - Se o componente precisa expandir/virar ao clicar, o trigger deve ser
     semanticamente claro.
   - Clique no card inteiro pode existir apenas quando nao cria arvore
     interativa invalida.

5. Animacoes devem respeitar `prefers-reduced-motion`.

6. Acessibilidade deve ser parte do contrato.
   - Componentes com estado precisam expor nome acessivel, `aria-expanded`,
     `aria-controls`, `aria-pressed` ou `role` correto conforme o caso.
   - Variantes visuais nao podem ser a unica forma de comunicar estado.

## Resumo executivo

| Componente       | Diagnostico                                                                                 | Acao recomendada                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `Panel`          | Estrutura enxuta. Um unico elemento sem wrappers extras.                                    | Manter. Fazer apenas hardening semantico se aprovado.                 |
| `DataCard`       | Ja evoluiu localmente, mas precisa formalizar `top/body/bottom` como contrato publico.      | Aprovar contrato e normalizar `footer` como alias legado de `bottom`. |
| `AppCard`        | Estrutura especifica de card de app; wrappers sao justificaveis.                            | Manter. Sem migrar para `top/body/bottom`.                            |
| `ConsolePanel`   | Wrappers justificaveis para header/body/console scroll.                                     | Manter. Pequeno ajuste a11y opcional no indicador oculto.             |
| `Alert`          | Estrutura boa. Pequena oportunidade de tipagem/icone/foco.                                  | Manter com hardening conservador.                                     |
| `InlineNotice`   | Possui `margin-top`, que e layout externo.                                                  | Remover margem externa apos aprovacao.                                |
| `EmptyState`     | Estrutura minima e coerente.                                                                | Manter. A11y opcional via role/props se necessario.                   |
| `StatusPill`     | Estrutura correta, mas `indicatorOnly` depende de `title`.                                  | Adicionar nome acessivel explicito para uso sem texto visivel.        |
| `StatusBanner`   | Forca `align-self: center`, que e layout externo.                                           | Remover alinhamento estrutural ou tornar opt-in.                      |
| `ExpandableCard` | Diff local melhora handlers, mas ainda ha risco de semantica invalida em `expandOn="card"`. | Recontratar gatilhos de expansao antes de aceitar a mudanca final.    |
| `FlipCard`       | Wrappers sao necessarios para 3D/drag/face.                                                 | Manter. Auditar interatividade do conteudo consumidor antes de mexer. |

## Mapa de consumidores

Uso observado nos apps consumidores:

- Manki
  - `Alert`: home.
  - `Panel`: termos, privacidade, estudo, stats, decks.
  - `DataCard`: stats.
  - `EmptyState`: stats.
  - `InlineNotice`: estudo.
  - `FlipCard`: estudo.
- Examster
  - `Panel`: landing, termos, privacidade, exam, sandbox, dashboard, admin.
  - `Alert`: landing, auth, exam, sandbox, admin/review.
  - `ConsolePanel`: sandbox, review, admin log.
  - `EmptyState`: dashboard/admin tabs.
  - `ExpandableCard`: admin tabs.
- Owlth
  - `Panel`: termos, privacidade.
  - `AppCard`: portal.
  - `StatusBanner`: portal.
  - `Alert`: portal.
- Frequence
  - `Panel`: landing, auth, dashboard, termos, privacidade.
  - `Alert`: landing/auth.

Conclusao: qualquer alteracao em `Panel`, `Alert`, `DataCard`,
`ExpandableCard`, `StatusBanner`, `InlineNotice` ou `FlipCard` exige validacao
em consumidores. `Panel` e `Alert` tem maior raio de impacto.

## Auditoria por componente

### Panel

Arquivo: `src/lib/components/Panel.svelte`

DOM atual:

```svelte
<svelte:element
	this={tag}
	class="monsan-panel {variant} overflow-{overflow}"
	class:is-interactive={interactive || Boolean(onclick)}
	style:padding
	style:max-width={resolvedMaxWidth}
	style:height={fullHeight ? '100%' : undefined}
	role={onclick ? 'button' : undefined}
	tabindex={onclick ? 0 : undefined}
>
	{@render children?.()}
</svelte:element>
```

Diagnostico:

- Nao ha wrapper redundante.
- `tag` permite ajustar semantica sem duplicar componentes.
- `padding`, `maxWidth`, `overflow`, `variant` e `fullHeight` sao parte do
  contrato de superficie.
- O ponto de atencao e `onclick`: quando usado, o componente transforma a raiz
  em `role="button"`, mas isso pode colidir com `tag` semantico ou conteudo
  interativo.

Proposta:

- Manter estrutura.
- Nao remover props agora.
- Em etapa futura, considerar `interactive`/`onclick` com semantica mais
  explicita, mas sem bloquear esta fase.

Classificacao: manter.

### DataCard

Arquivo: `src/lib/components/DataCard.svelte`

#### DOM base antes do diff local

O `DataCard` original ja tinha a estrutura correta em alto nivel:

```svelte
<Panel>
	<article class="monsan-data-card">
		<header class="data-card-header">...</header>
		<div class="data-card-body">...</div>
		<footer class="data-card-bottom|data-card-footer">...</footer>
	</article>
</Panel>
```

O problema era a duplicacao de branches do header:

```svelte
{#if top}
	<header>render top + actions</header>
{:else if title || subtitle || eyebrow || actions}
	<header>render title/subtitle/eyebrow + actions</header>
{/if}
```

Isso fazia duas formas de montar a mesma regiao estrutural.

#### Diff local pendente

O diff local ja adicionou `hasHeader` e colapsou os dois branches:

```svelte
let hasHeader = $derived(Boolean(top || title || subtitle || eyebrow || actions));

{#if hasHeader}
	<header class="data-card-header">
		<div class="data-card-copy">
			{#if top}
				{@render top()}
			{:else}
				...eyebrow/title/subtitle...
			{/if}
		</div>

		{#if actions}
			<div class="data-card-actions">
				{@render actions()}
			</div>
		{/if}
	</header>
{/if}
```

Essa mudanca esta alinhada com a auditoria:

- remove duplicacao interna;
- preserva API publica;
- mantem `actions` na mesma regiao superior;
- nao altera DOM essencial consumido pelos apps.

#### DOM proposto final

Contrato recomendado:

```svelte
<DataCard fullHeight>
	{#snippet top()}
		...
	{/snippet}

	{#snippet body()}
		...
	{/snippet}

	{#snippet bottom()}
		...
	{/snippet}
</DataCard>
```

DOM interno recomendado:

```svelte
<Panel>
  <article class="monsan-data-card" class:full-height>
    {#if top || generatedHeader || actions}
      <header class="data-card-top">
        <div class="data-card-top-content">...</div>
        {#if actions}
          <div class="data-card-actions">...</div>
        {/if}
      </header>
    {/if}

    <div class="data-card-body">
      {@render body?.() ?? children?.()}
    </div>

    {#if bottom || footer}
      <footer class="data-card-bottom">
        {@render bottom?.() ?? footer?.()}
      </footer>
    {/if}
  </article>
</Panel>
```

Regras:

- `body` deve ser `flex: 1 1 auto`.
- `bottom` deve ficar no fim do card.
- `footer` deve permanecer temporariamente como alias legado de `bottom`.
- `title`, `subtitle` e `eyebrow` continuam como atalho para gerar `top`.
- Nao criar props de posicionamento como `metric`, `vertical` ou similares.
  A estrutura ja resolve a hierarquia.

Classificacao: recontratar de forma conservadora.

Risco:

- Manki stats usa `DataCard` em varios layouts de altura igual.
- Mudanca deve ser validada no Manki antes de publicar.

### AppCard

Arquivo: `src/lib/components/AppCard.svelte`

DOM atual:

```svelte
<article class="monsan-app-card state-{state}">
	<div class="app-card-main">
		<div class="app-card-logo">...</div>
		<div class="app-card-copy">
			<div class="app-card-title-row">...</div>
			<Text>description</Text>
			<div class="app-card-meta">...</div>
		</div>
	</div>
	<div class="app-card-actions">...</div>
</article>
```

Diagnostico:

- O componente e um card de produto/app, nao um card generico.
- Wrappers atuais representam regioes reais: midia, copy, titulo/status, meta
  e acoes.
- `actions` usa `margin-top: auto` para ficar no fim do card quando necessario.
- Nao ha ganho claro em migrar para `top/body/bottom`, porque a semantica dele
  e de card de app com identidade visual propria.

Proposta:

- Manter estrutura.
- Nao generalizar.

Classificacao: manter.

### ConsolePanel

Arquivo: `src/lib/components/ConsolePanel.svelte`

DOM atual:

```svelte
<Panel padding="0" overflow="hidden">
	<section class="monsan-console-panel height-{height}">
		<header class="console-header">
			<div class="console-title">...</div>
			<div class="console-actions">...</div>
		</header>
		<div class="console-body" class:is-lined>
			{@render children?.()}
		</div>
	</section>
</Panel>
```

Diagnostico:

- `Panel` e a superficie visual externa.
- `section` e a raiz especifica do console.
- Header/body sao regioes reais.
- `console-body` precisa controlar scroll, fonte mono, linhas e altura.
- Nao ha wrapper evidente para remover.

Ponto de atencao:

- O indicador oculto de status dentro das acoes usa `aria-label`/`title`, mas
  pode ter semantica mais explicita se for mantido como indicador.

Proposta:

- Manter estrutura.
- Opcional: hardening a11y no indicador oculto.

Classificacao: manter.

### Alert

Arquivo: `src/lib/components/Alert.svelte`

DOM atual:

```svelte
<div class="monsan-alert {type}" role={...} tabindex="-1">
  <div class="alert-icon">...</div>
  <div class="alert-body">
    <h4 class="alert-title">...</h4>
    <div class="alert-description">...</div>
  </div>
  <button class="alert-close-btn">...</button>
</div>
```

Diagnostico:

- Estrutura e enxuta e semanticamente clara.
- Wrappers sao justificaveis: icone, corpo, titulo, descricao e botao de
  fechar.
- `tabindex="-1"` permite foco programatico quando `focusOnMount` e usado.
- O componente ja permite `role` customizado, mas o tipo e amplo.

Pontos de atencao:

- O icone de `info` ainda e SVG inline, enquanto `success/error/warning` usam
  componentes de icone.
- `tabindex="-1"` sempre presente e aceitavel, mas pode ser limitado ao caso
  de foco programatico se quisermos reduzir atributos.
- Tipagem de `role` pode ser mais restrita.

Proposta:

- Manter estrutura.
- Fazer apenas hardening conservador se aprovado.

Classificacao: manter com ajustes pequenos.

### InlineNotice

Arquivo: `src/lib/components/InlineNotice.svelte`

DOM atual:

```svelte
<div class="monsan-inline-notice">
	{@render children?.()}
</div>
```

CSS atual relevante:

```css
.monsan-inline-notice {
	margin-top: var(--space-sm);
	padding-top: var(--space-sm);
	border-top: var(--border-width-sm) dashed var(--border-secondary);
}
```

Diagnostico:

- A estrutura DOM e minima.
- O problema esta no contrato de espacamento: `margin-top` e layout externo.
- Um aviso inline pode precisar aparecer em contextos diferentes; a distancia
  ate o item anterior deve ser controlada pelo pai.
- `padding-top` e `border-top` pertencem ao componente, porque criam a
  superficie visual interna do aviso.

Proposta:

- Remover `margin-top`.
- Manter `padding-top`, `border-top`, quebra de texto e alinhamento.
- Validar no Manki study, onde `InlineNotice` aparece dentro do `FlipCard`.

Classificacao: simplificar.

### EmptyState

Arquivo: `src/lib/components/EmptyState.svelte`

DOM atual:

```svelte
<div class="monsan-empty-state">
	{@render children?.()}
</div>
```

Diagnostico:

- Estrutura minima.
- O componente representa um estado visual especifico, com borda tracejada,
  centralizacao e altura minima.
- `min-height`, padding interno e alinhamento central fazem parte do contrato do
  empty state.

Ponto de atencao:

- Pode receber `role="status"` em alguns contextos, mas nao deve ser forcado em
  todos porque ha casos em que e apenas conteudo estatico.

Proposta:

- Manter estrutura.
- Considerar `role`/`aria-live` opcionais apenas se houver demanda real.

Classificacao: manter.

### StatusPill

Arquivo: `src/lib/components/StatusPill.svelte`

DOM atual:

```svelte
<span class="monsan-status-pill tone-{tone}">
	<span class="status-dot" aria-hidden="true"></span>
	<span class="status-label">...</span>
</span>
```

Variação atual:

```svelte
<StatusPill indicatorOnly title="...">...</StatusPill>
```

Diagnostico:

- Estrutura visual e correta: raiz inline, dot e label.
- `indicatorOnly` remove a label visual, mas hoje depende de `title`.
- `title` nao e suficiente como contrato de acessibilidade.

Proposta:

- Adicionar `ariaLabel?: string`.
- Quando `indicatorOnly` for verdadeiro, aplicar `aria-label={ariaLabel ??
title}` na raiz.
- Se `indicatorOnly` for usado sem `ariaLabel`/`title`, considerar warning de
  desenvolvimento ou documentar como uso invalido.

Classificacao: simplificar com hardening a11y.

### StatusBanner

Arquivo: `src/lib/components/StatusBanner.svelte`

DOM atual:

```svelte
<div class="monsan-status-banner" {role}>
	<span class="status-dot" aria-hidden="true"></span>
	<span class="status-content">...</span>
</div>
```

CSS atual relevante:

```css
.monsan-status-banner {
  align-self: center;
  display: inline-flex;
  ...
}
```

Diagnostico:

- DOM e enxuto.
- `align-self: center` e layout externo: o componente decide sua posicao dentro
  do pai.
- Depois do `AppShell`, alinhamento entre regioes deve ser decisao do
  container, nao de uma superficie.

Proposta:

- Remover `align-self: center` do default.
- Manter `display: inline-flex`, padding, borda e animacao.
- Se algum consumidor precisar centralizar, fazer no container do consumidor ou
  com um wrapper estrutural apropriado.
- Validar OwlthPortal, que usa `StatusBanner` no fluxo de autenticacao.

Classificacao: simplificar.

### ExpandableCard

Arquivo: `src/lib/components/ExpandableCard.svelte`

#### DOM base antes do diff local

DOM conceitual:

```svelte
<div bind:this={cardEl} class="monsan-expandable-card">
	<header class="card-header">
		<button class="header-toggle-btn">...</button>
	</header>

	<div class="expandable-content-wrapper">
		<div class="expandable-content-inner">
			<div class="card-body">...</div>
		</div>
	</div>

	<button class="card-indicator-footer">...</button>
</div>
```

O comportamento `expandOn="card"` era implementado com `addEventListener` em
`$effect`, ligado manualmente ao elemento raiz.

#### Diff local pendente

O diff local:

- remove `bind:this` e `addEventListener`;
- adiciona `onclick` declarativo;
- adiciona `onkeydown` para `Enter` e `Space`;
- adiciona `role="button"` e `tabindex="0"` na raiz quando
  `expandOn="card"`;
- extrai um snippet interno `content()` para evitar duplicacao;
- adiciona `prefers-reduced-motion`.

DOM local atual:

```svelte
{#if expandOn === 'card'}
	<div
		class="monsan-expandable-card ..."
		onclick={handleCardClick}
		onkeydown={handleCardKeydown}
		role="button"
		tabindex="0"
	>
		{@render content()}
	</div>
{:else}
	<div class="monsan-expandable-card ...">
		{@render content()}
	</div>
{/if}
```

Essa mudanca melhora a implementacao, mas ainda deixa um problema estrutural:

- quando `expandOn="card"`, a raiz vira `role="button"`;
- dentro dela ainda podem existir botoes reais (`card-indicator-footer`) e
  conteudo expandido com links, botoes, inputs ou outros controles;
- isso cria risco de arvore interativa invalida.

#### DOM proposto final

Proposta segura:

```svelte
<article class="monsan-expandable-card">
	<header class="card-header">
		<button class="header-toggle-btn" aria-expanded={expanded} aria-controls={contentId}>
			...
		</button>
	</header>

	<div id={contentId} class="expandable-content-wrapper">
		<div class="expandable-content-inner">
			<div class="card-body">...</div>
		</div>
	</div>

	{#if showIndicator}
		<button class="card-indicator-footer" aria-expanded={expanded} aria-controls={contentId}>
			...
		</button>
	{/if}
</article>
```

Regras propostas:

- Priorizar `expandOn="header"` como contrato principal.
- `expandOn="indicator"` tambem e seguro.
- `expandOn="card"` deve ser reavaliado:
  - ou vira alias visual que ainda usa trigger semantico;
  - ou e mantido apenas quando nao ha indicador nem conteudo interativo;
  - ou passa por deprecacao documentada.
- Adicionar `aria-controls` aos triggers.
- Manter wrappers de content, porque eles sao necessarios para transicao de
  altura/overflow.

Consumidores atuais:

- Examster admin usa `ExpandableCard expandOn="header" showIndicator={false}`.
- O risco de mudar o default e baixo para os usos observados, mas ainda precisa
  ser validado.

Classificacao: recontratar comportamento antes de finalizar o diff.

### FlipCard

Arquivo: `src/lib/components/FlipCard.svelte`

DOM atual:

```svelte
<svelte:window ... />

<div class="monsan-flipcard-container" role="button" aria-pressed={flipped}>
	<div class="card-wrapper">
		<div class="card">
			<div class="face front">
				<div class="pattern"></div>
				<div class="face-content">...</div>
			</div>
			<div class="face back">
				<div class="face-content">...</div>
			</div>
		</div>
	</div>
</div>
```

Diagnostico:

- Os wrappers sao necessarios para perspectiva 3D, transform, drag, faces,
  backface e overflow.
- `pattern` e decorativo; pode permanecer interno.
- `role="button"` e `aria-pressed` fazem sentido quando o card inteiro e o
  gatilho de virar.

Ponto de atencao:

- Se consumidores colocarem botoes/links dentro de `front` ou `back`, o mesmo
  problema de interativo dentro de interativo aparece.
- O uso observado no Manki study deve ser revisado visualmente antes de qualquer
  alteracao, porque o componente combina pointer drag, click e keyboard.

Proposta:

- Manter estrutura.
- Nao tentar simplificar os wrappers 3D.
- Em fase futura, avaliar um modo com trigger separado se houver conteudo
  interativo dentro das faces.

Classificacao: manter.

## Ordem de implementacao recomendada apos aprovacao

### Commit 1 - Superficies pequenas e a11y

Escopo:

- `InlineNotice`: remover `margin-top`.
- `StatusBanner`: remover `align-self: center` ou tornar opt-in, conforme
  decisao.
- `StatusPill`: adicionar `ariaLabel` para `indicatorOnly`.
- `Alert`: hardening conservador de role/icone/foco, se aprovado.

Validacao minima:

- `pnpm test` em MonsanUI.
- Revisao de OwlthPortal para `StatusBanner`.
- Revisao de Manki study para `InlineNotice`.

### Commit 2 - DataCard top/body/bottom

Escopo:

- Consolidar contrato `top/body/bottom`.
- Manter `children` como body padrao.
- Manter `title/subtitle/eyebrow` como gerador de `top`.
- Tratar `footer` como alias legado de `bottom`.
- Nao adicionar prop de posicionamento interna.

Validacao minima:

- `pnpm test` em MonsanUI.
- Atualizar e testar Manki, principalmente stats.

### Commit 3 - ExpandableCard seguro

Escopo:

- Manter o ganho do diff local: handlers declarativos e reduced motion.
- Adicionar `aria-controls`.
- Recontratar ou restringir `expandOn="card"` para evitar raiz interativa com
  botoes/links internos.

Validacao minima:

- `pnpm test` em MonsanUI.
- Atualizar e testar Examster, principalmente admin tabs.

## Validacao planejada para a fase implementada

Quando a implementacao for aprovada e executada:

1. MonsanUI
   - `pnpm test`

2. Consumidores afetados apos `pnpm update monsan-ui`
   - Manki: stats e study.
   - Examster: admin tabs, sandbox/review, dashboard.
   - Owlth: portal.
   - Frequence: landing/auth/dashboard basicos.

3. Testes nos consumidores
   - `pnpm test` em cada app atualizado.

## Decisao solicitada

Antes de alterar codigo, preciso de aprovacao para:

1. Formalizar `DataCard` com contrato `top/body/bottom` e manter `footer` como
   alias legado.
2. Remover espacamento externo de `InlineNotice`.
3. Remover ou tornar opt-in o `align-self` de `StatusBanner`.
4. Adicionar nome acessivel explicito em `StatusPill indicatorOnly`.
5. Recontratar `ExpandableCard` para evitar raiz `role="button"` contendo
   controles interativos, preservando o comportamento usado pelo Examster.
