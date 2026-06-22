# Fase 6 - Formularios Simples: auditoria estrutural

Data: 2026-06-22
Projeto: MonsanUI
Status: auditoria proposta, sem alteracao de codigo nesta etapa.

Componentes auditados:

- `FormField`
- `FieldGroup`
- `FormStack`
- `Input`
- `Textarea`
- `Checkbox`
- `Radio`
- `Range`
- `Search`
- `SearchBar`

## Objetivo

Auditar a familia de formularios simples com foco em:

- separar responsabilidade de campo, grupo, formulario e controle;
- centralizar label, helper, erro e `aria-describedby` em `FormField`;
- manter controles simples livres de wrappers duplicados;
- garantir estados `disabled`, `invalid`, `readonly` e `loading` quando forem
  aplicaveis;
- revisar `Search` e `SearchBar` como busca global/dialog e busca contextual;
- preservar compatibilidade com consumidores atuais.

## Estado do worktree no inicio da auditoria

Ha alteracoes locais antigas no MonsanUI antes desta auditoria:

- `docs/component-inventory.md`
- `src/lib/components/Deck.svelte`
- auditorias antigas nao rastreadas em `docs/component-audits/`

Essas mudancas nao foram revertidas, incorporadas ou alteradas por esta
auditoria. O unico arquivo novo esperado nesta etapa e este relatorio.

## Contrato estrutural recomendado

### Campo

`FormField` deve ser o dono da estrutura de campo:

```text
field -> label -> control -> helper/error
```

Contrato recomendado:

- `FormField` renderiza label, helper e erro.
- `FormField` gera ou aceita IDs estaveis para helper e erro.
- `FormField` expõe esses IDs ao controle por snippet props, para que o
  controle receba `aria-describedby` sem o consumidor montar strings manualmente.
- `FormField` controla `aria-invalid` quando houver erro.
- `FormField` nao deve conhecer implementacoes especificas de `Input`,
  `Textarea`, `Select`, etc.
- Controles continuam aceitando `ariaDescribedby` e `ariaInvalid` como API
  direta para casos fora de `FormField`.

Forma proposta:

```svelte
<FormField label="Nome" forId="name" helper="Use seu nome completo" error={nameError}>
	{#snippet control({ describedby, invalid })}
		<Input id="name" bind:value={name} ariaDescribedby={describedby} ariaInvalid={invalid} />
	{/snippet}
</FormField>
```

Compatibilidade:

- manter `children` como alias legado para o conteudo atual;
- adicionar `control` como contrato preferencial;
- nao quebrar usos existentes que fazem:

```svelte
<FormField label="Nome" forId="name">
	<Input id="name" />
</FormField>
```

### Grupo

`FieldGroup` deve continuar dono de grupos semanticos:

```text
fieldset -> legend -> children
```

Contrato recomendado:

- usar `fieldset` e `legend` para checkbox/radio/range relacionados;
- aceitar helper/erro de grupo em etapa opcional se houver uso real;
- nao substituir `FormField`, porque campo individual e grupo semantico sao
  responsabilidades diferentes.

### Formulario

`FormStack` deve ser o dono de composicao vertical de formulario:

- renderizar apenas `<form>`;
- controlar gap entre campos;
- nao alterar estilos internos de botoes via `:global`;
- se botoes full-width forem desejados, isso deve ser opt-in por prop ou
  resolvido no `Button`/`ActionFooter`, nao forçado pelo formulario.

### Controle

`Input`, `Textarea`, `Checkbox`, `Radio`, `Range` e `SearchBar` devem ser
controles:

- sem label externo proprio quando usados dentro de `FormField` ou `FieldGroup`;
- com props para `id`, `name`, `disabled`, `readonly` quando o tipo permitir;
- com `ariaLabel`, `ariaDescribedby` e `ariaInvalid` quando fizer sentido;
- sem margem externa;
- com wrappers internos apenas quando necessarios para icone, toggle, thumb,
  sugestoes ou visual customizado.

## Mapa de consumidores

Uso observado:

- Examster
  - `FormField`, `FieldGroup`, `Input`, `Textarea`, `SearchBar`.
  - Uso forte em modais admin, onboarding, preview, benchmark e filtros de
    admin.
- Manki
  - `FormField`, `FieldGroup`, `Range`.
  - Uso principal no modal de geracao por IA.
- Owlth
  - `FormStack`, `FormField`.
  - Uso em perfil, OTP e email.
- Frequence
  - Nenhum uso encontrado em `src` nesta busca.
- Shellfish
  - Nenhum uso encontrado em `src` nesta busca.
- MonsanUI showcase
  - exemplos de `Checkbox`, `Radio`, `Range`, `SearchBar` e `Textarea`.

Conclusao: `FormField`, `Input`, `Textarea`, `SearchBar` e `FormStack` tem
impacto real em consumidores. `Checkbox`, `Radio` e `Range` tem menor uso nos
apps hoje, mas sao componentes publicos e precisam manter API.

## Resumo executivo

| Componente | Diagnostico | Acao recomendada |
| --- | --- | --- |
| `FormField` | Estrutura pequena, mas incompleta: nao possui helper, erro nem contrato de `aria-describedby`. | Recontratar de forma compatível com snippet `control`. |
| `FieldGroup` | Semantica correta com `fieldset`/`legend`; sem wrapper redundante. | Manter; avaliar helper/erro de grupo depois. |
| `FormStack` | Estrutura simples, mas força botoes internos a `width: 100%` via `:global`. | Simplificar removendo estilo global ou tornando full-width opt-in. |
| `Input` | Wrapper necessario para toggle de senha, mas desnecessario quando nao ha toggle. | Simplificar com wrapper condicional ou manter wrapper se risco visual for alto; mover foco para `focus-visible`. |
| `Textarea` | Controle puro, mas duplica markup por causa de action opcional. | Simplificar apenas se Svelte permitir action opcional com seguranca; manter se nao. |
| `Checkbox` | Label-wrapper e input sr-only sao justificaveis; label proprio pode duplicar `FormField`. | Manter DOM; documentar uso com `FieldGroup`; adicionar `ariaInvalid` opcional. |
| `Radio` | Mesmo diagnostico de `Checkbox`; semantica individual correta quando dentro de `FieldGroup`. | Manter DOM; documentar uso com `FieldGroup`; adicionar `ariaInvalid` opcional. |
| `Range` | Wrapper simples usado para fill visual; padding vertical e interno ao controle. | Manter; adicionar `ariaInvalid` se necessario e revisar padding depois de validacao visual. |
| `Search` | Dialog de busca global, mas listbox/option usa botoes sem `aria-activedescendant` e sem IDs. | Recontratar como command/search dialog acessivel. |
| `SearchBar` | Busca contextual boa visualmente, mas sugestoes sao dropdown proprio sem semantica combobox/listbox completa. | Recontratar parcialmente como combobox contextual. |

## Auditoria por componente

### FormField

Arquivo: `src/lib/components/FormField.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-form-field">
	<label for={forId}>
		<Text tag="span" size="sm" weight="bold" variant="secondary">{label}</Text>
	</label>
	{@render children()}
</div>
```

Wrappers:

- `div.monsan-form-field`: justificado para layout vertical e gap de campo.
- `label`: semantica correta.
- `Text`: justificado por padronizacao tipografica.

Problema estrutural:

- `FormField` nao possui `helper`, `error`, `required`, `disabled` ou estado
  visual de erro.
- `aria-describedby` fica delegado manualmente ao consumidor.
- O campo nao consegue garantir que helper e erro tenham IDs corretos.
- A responsabilidade de acessibilidade do campo esta dividida entre consumidor
  e controle.

Proposta:

- adicionar props `helper`, `error`, `required`, `disabled`, `idPrefix`
  ou IDs explicitos;
- adicionar snippet `control` com `{ describedby, invalid }`;
- manter `children` atual como compatibilidade;
- renderizar helper e erro abaixo do controle;
- erro deve participar de `aria-describedby`;
- `invalid` deve ser `true` quando `error` existir.

Classificacao: Recontratar.

### FieldGroup

Arquivo: `src/lib/components/FieldGroup.svelte`
Exportado: sim.

DOM atual:

```svelte
<fieldset class="monsan-field-group">
	<legend>
		<Text tag="span" size="sm" weight="bold" variant="secondary">{label}</Text>
	</legend>
	{@render children()}
</fieldset>
```

Wrappers:

- `fieldset`: necessario para grupo semantico.
- `legend`: necessario para nome acessivel do grupo.
- `Text`: justificado por padronizacao.

Diagnostico:

- Estrutura correta.
- Sem wrappers redundantes.
- Gap interno pertence ao grupo.
- Pode futuramente aceitar `helper`/`error`, mas nao ha necessidade imediata.

Proposta:

- manter DOM.
- nao transformar em wrapper generico.
- documentar uso preferencial com `Checkbox`, `Radio` e opcoes agrupadas.

Classificacao: OK.

### FormStack

Arquivo: `src/lib/components/FormStack.svelte`
Exportado: sim.

DOM atual:

```svelte
<form class="monsan-form-stack" {method} {action} {onsubmit}>
	{@render children()}
</form>
```

CSS relevante:

```css
.monsan-form-stack {
	display: flex;
	flex-direction: column;
	gap: var(--space-md);
	text-align: left;
	width: 100%;
}

.monsan-form-stack :global(.monsan-button) {
	width: 100%;
}
```

Diagnostico:

- O DOM esta correto.
- O `gap` interno e responsabilidade do stack de formulario.
- O `:global(.monsan-button)` e problemático: formulario passa a controlar
  largura de botao por seletor global interno.
- Isso pode competir com `Button block`, `ActionFooter`, dialogs e layouts onde
  botoes devem ficar inline.

Proposta:

- remover o seletor global de botao;
- se necessario, adicionar prop `actionsLayout="full" | "inline"` em outro
  componente de acoes ou orientar uso de `Button block`;
- manter `<form>` como raiz.

Classificacao: Simplificar.

### Input

Arquivo: `src/lib/components/Input.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-input-container" class:with-toggle={type === 'password' && showPasswordToggle}>
	<input class="monsan-input ..." />
	{#if passwordToggle}
		<button class="password-toggle-btn">...</button>
	{/if}
</div>
```

Wrappers:

- `div.monsan-input-container`: necessario quando existe toggle de senha, pois
  posiciona o botao absoluto.
- Para inputs sem toggle, o wrapper nao tem funcao alem de `width: 100%`.

Diagnostico:

- API de controle e boa: `id`, `name`, `disabled`, `readonly`,
  `ariaDescribedby`, `ariaInvalid`, eventos e `bind:value`.
- `showPasswordToggle` e responsabilidade plausivel do controle.
- Existem SVGs inline no toggle; isto diverge do padrao recente de icones
  compartilhados.
- Foco usa `:focus`, nao `:focus-visible`; isso pode aplicar efeito visual em
  clique de mouse.
- `invalid` nao tem estilo visual proprio; depende apenas de `aria-invalid`
  recebido.

Proposta:

- manter API.
- avaliar wrapper condicional:
  - sem toggle: renderizar `input` direto;
  - com toggle: manter container.
- se o wrapper condicional criar risco visual alto, manter wrapper nesta fase e
  apenas registrar como necessario por compatibilidade.
- substituir SVGs inline por icones compartilhados em lote seguro.
- adicionar estilo visual para `aria-invalid="true"`.
- trocar foco visual para `:focus-visible` se a experiencia continuar correta.

Classificacao: Simplificar com risco medio.

### Textarea

Arquivo: `src/lib/components/Textarea.svelte`
Exportado: sim.

DOM atual:

```svelte
{#if use}
	<textarea use:use={value} ...></textarea>
{:else}
	<textarea ...></textarea>
{/if}
```

Wrappers:

- Nenhum wrapper.

Diagnostico:

- Controle enxuto.
- Duplica markup para permitir action opcional.
- Possui `ariaDescribedby` e `ariaInvalid`.
- Possui `disabled` e `readonly`.
- Nao possui estado visual de invalid alem do atributo ARIA.

Proposta:

- manter se a action opcional nao puder ser expressa com seguranca sem branch.
- se for seguro em Svelte 5, reduzir para um unico `<textarea>`.
- adicionar estilo visual para `aria-invalid="true"`.
- alinhar foco para `:focus-visible` junto com `Input`.

Classificacao: OK com simplificacao opcional.

### Checkbox

Arquivo: `src/lib/components/Checkbox.svelte`
Exportado: sim.

DOM atual:

```svelte
<label class="monsan-checkbox-wrapper">
	<input type="checkbox" class="sr-only" />
	<div class="checkbox-box">...</div>
	{#if label}
		<span class="checkbox-label">{label}</span>
	{/if}
</label>
```

Wrappers:

- `label`: justificado para area clicavel.
- `input.sr-only`: necessario para semantica nativa mantendo visual customizado.
- `div.checkbox-box`: necessario para visual customizado.
- `span.checkbox-label`: necessario quando o proprio componente renderiza label.

Diagnostico:

- Estrutura e comum e acessivel.
- Label proprio e correto para checkbox isolado.
- Em grupo, o padrao deve ser `FieldGroup` + `Checkbox label`.
- `FormField` nao deve envolver `Checkbox` com label duplicado.
- Nao possui `ariaInvalid`.
- `gap: var(--space-md)` talvez seja maior que o contrato de filtros/menus, mas
  para checkbox de formulario pode estar correto.

Proposta:

- manter DOM.
- adicionar `ariaInvalid` opcional.
- documentar uso:
  - checkbox isolado usa `Checkbox label`;
  - conjunto usa `FieldGroup`;
  - nao usar `FormField` para criar segundo label.

Classificacao: OK com hardening a11y.

### Radio

Arquivo: `src/lib/components/Radio.svelte`
Exportado: sim.

DOM atual:

```svelte
<label class="monsan-radio-wrapper">
	<input type="radio" class="sr-only" />
	<div class="radio-circle">
		<div class="radio-inner-dot"></div>
	</div>
	{#if label}
		<span class="radio-label">{label}</span>
	{/if}
</label>
```

Wrappers:

- Mesma justificativa de `Checkbox`.
- `radio-circle` e `radio-inner-dot` sao necessarios para o visual customizado.

Diagnostico:

- Estrutura correta para radio individual.
- Deve ser usado dentro de `FieldGroup` para nome de grupo.
- Nao possui `ariaInvalid`.
- Estado `readonly` nao se aplica nativamente a radio; usar `disabled` quando
  necessario.

Proposta:

- manter DOM.
- adicionar `ariaInvalid` opcional.
- documentar uso com `FieldGroup`.

Classificacao: OK com hardening a11y.

### Range

Arquivo: `src/lib/components/Range.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-range-container" class:disabled style:--range-percentage>
	<input type="range" class="monsan-range" />
</div>
```

Wrappers:

- `div.monsan-range-container`: justificado para largura, alinhamento,
  padding e custom property do fill visual.

Diagnostico:

- Wrapper tem funcao real.
- `padding: var(--space-xs) 0` e interno ao controle por causa do thumb maior,
  nao margem externa.
- Percentual ja esta protegido contra `max === min`.
- Possui `disabled`, mas nao `readonly` porque range nao suporta readonly.
- Nao possui `ariaInvalid`.
- Nao mostra valor; isso deve ficar no consumidor ou num componente composto,
  nao necessariamente no controle base.

Proposta:

- manter DOM.
- adicionar `ariaInvalid` opcional se a suite precisar validar range em forms.
- nao remover padding sem validacao visual por causa do thumb.

Classificacao: OK.

### Search

Arquivo: `src/lib/components/Search.svelte`
Exportado: sim.

DOM atual:

```svelte
<Dialog bind:open title={activeTitle}>
	<div class="search-container" role="search">
		<Input bind:value={searchQuery} onkeydown={handleKeyDown} />
		<div class="results-list" role="listbox">
			<button role="option" aria-selected>...</button>
		</div>
	</div>
</Dialog>
```

Wrappers:

- `Dialog`: correto para busca global.
- `search-container`: justificado para layout interno.
- `results-list`: necessario para lista de resultados.

Problemas estruturais/a11y:

- `role="listbox"` com filhos `button role="option"` e selecao controlada por
  classe pode funcionar visualmente, mas nao e o padrao mais robusto.
- Falta ID por opcao e `aria-activedescendant` no input/listbox.
- Arrow keys alteram `selectedIndex`, mas foco DOM permanece no input.
- `Enter` seleciona resultado, mas leitores de tela podem nao perceber o item
  ativo.
- Resultados filtram apenas por `name`; tudo bem para contrato atual, mas a
  API nao permite custom matcher.
- Estado `loading` nao existe.

Proposta:

- recontratar como command/search dialog:
  - input com `role="combobox"`, `aria-expanded`, `aria-controls` e
    `aria-activedescendant`;
  - lista com ID estavel;
  - opcoes com IDs estaveis e role coerente;
  - `loading` e `loadingMessage` opcionais;
  - `empty`/`noResultsMessage` preservado;
  - `onSelectResult` preservado.
- manter uso de `Dialog`.

Classificacao: Recontratar.

### SearchBar

Arquivo: `src/lib/components/SearchBar.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-searchbar-container">
	<div class="searchbar-wrapper">
		<span class="search-icon">...</span>
		<input class="search-input" />
		<button class="clear-btn">...</button>
	</div>

	{#if displayDropdown}
		<div class="suggestions-dropdown panel">
			<button class="suggestion-item">...</button>
		</div>
	{/if}
</div>
```

Wrappers:

- `monsan-searchbar-container`: necessario para dropdown absoluto.
- `searchbar-wrapper`: necessario para icone, input e clear dentro do mesmo
  controle visual.
- `suggestions-dropdown`: necessario para painel de sugestoes.

Problemas estruturais/a11y:

- O dropdown de sugestoes e proprio e nao compartilha contrato visual com
  `Select`/`MultiSelect`.
- Sugestoes sao botoes, mas input nao tem `combobox`, `aria-expanded`,
  `aria-controls` ou `aria-activedescendant`.
- Nao ha navegacao por teclado nas sugestoes.
- `handleBlur` marca foco falso antes de possivel clique em sugestao; hoje o
  clique ainda tende a funcionar por ordem de eventos, mas e fragil.
- Nao possui `ariaInvalid`.
- `disabled` existe; `readonly` nao.

Proposta:

- recontratar parcialmente como busca contextual:
  - manter visual atual;
  - adicionar semantica combobox/listbox;
  - adicionar ArrowDown, ArrowUp, Enter e Escape;
  - usar IDs estaveis para lista e opcoes;
  - padronizar painel de sugestoes com o contrato visual de dropdown aprovado
    para `Select`/`MultiSelect`, sem criar dependencia circular;
  - adicionar `readonly` opcional se houver uso real;
  - adicionar `ariaInvalid` opcional.
- manter `SearchBar` como busca inline contextual de desktop.
- `Search` continua sendo busca global em dialog.

Classificacao: Recontratar parcialmente.

## Estados

### Disabled

- `Input`, `Textarea`, `Checkbox`, `Radio`, `Range` e `SearchBar` ja aceitam
  `disabled`.
- `FormField` e `FieldGroup` nao propagam disabled hoje. Isso deve continuar
  responsabilidade do controle, mas `FormField disabled` pode afetar label e
  helper visualmente se aprovado.

### Readonly

- `Input` e `Textarea` aceitam `readonly`.
- `Checkbox`, `Radio` e `Range` nao tem readonly nativo adequado.
- `SearchBar` nao aceita readonly hoje; pode ser adicionado se houver uso real.

### Invalid

- `Input` e `Textarea` aceitam `ariaInvalid`.
- `Checkbox`, `Radio`, `Range` e `SearchBar` nao aceitam `ariaInvalid`.
- Nenhum controle simples possui estilo visual consistente para invalid.
- `FormField` deve ser o ponto principal para erro textual e `aria-describedby`.

### Loading

- Controles simples nao possuem `loading`.
- Para `Input`/`Textarea`, loading geralmente pertence ao fluxo pai.
- Para `Search` e `SearchBar`, loading faz sentido quando sugestoes/resultados
  vierem de fonte assíncrona. Deve ser opt-in.

## Plano de implementacao recomendado apos aprovacao

### Commit 1 - Contrato de campo

- Evoluir `FormField` com `helper`, `error`, IDs e snippet `control`.
- Manter `children` legado.
- Adicionar documentacao de uso com `Input`/`Textarea`.
- Nao alterar consumidores ainda.

### Commit 2 - Simplificacao segura de formulario

- Remover `FormStack :global(.monsan-button)`.
- Validar usos em Owlth.
- Adicionar alternativa documentada com `Button block` quando necessario.

### Commit 3 - Estados invalid e controles simples

- Adicionar `ariaInvalid` a `Checkbox`, `Radio`, `Range` e `SearchBar` se
  aprovado.
- Adicionar estilo visual consistente para `[aria-invalid='true']` em
  `Input`, `Textarea` e controles aplicaveis.
- Avaliar wrapper condicional de `Input`; se houver risco visual, adiar.

### Commit 4 - SearchBar contextual

- Implementar semantica combobox/listbox.
- Adicionar teclado para sugestoes.
- Padronizar painel de sugestoes com o contrato visual de dropdown.
- Preservar API publica atual.

### Commit 5 - Search global

- Recontratar `Search` como command/search dialog acessivel.
- Adicionar IDs, `aria-activedescendant`, `aria-controls` e loading opcional.
- Preservar `onSelectResult`, `items` e textos sobrescriveis.

## Validacao recomendada apos implementacao

- `pnpm test` em MonsanUI.
- Validacao visual do showcase para `Input`, `Textarea`, `Checkbox`, `Radio`,
  `Range`, `SearchBar` e `Search`.
- Atualizar e testar consumidores que usam a familia:
  - Examster: `pnpm update monsan-ui` e `pnpm test`.
  - Manki: `pnpm update monsan-ui` e `pnpm test`.
  - Owlth: `pnpm update monsan-ui` e `pnpm test`.
- Frequence e Shellfish nao precisam entrar nesta fase se continuarem sem uso
  desses componentes.

## Decisoes pendentes para aprovacao

1. Aprovar `FormField` como dono de helper, erro e `aria-describedby`, com
   snippet `control` e `children` legado.
2. Aprovar remocao do `:global(.monsan-button)` em `FormStack`.
3. Aprovar `ariaInvalid` e estado visual invalid nos controles simples.
4. Aprovar `SearchBar` como combobox contextual.
5. Aprovar `Search` como command/search dialog acessivel.
