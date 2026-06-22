# Fase 7 - Formularios Complexos: auditoria estrutural

Data: 2026-06-22
Projeto: MonsanUI
Status: auditoria proposta, sem alteracao de codigo nesta etapa.

Componentes auditados:

- `Select`
- `MultiSelect`
- `DatePicker`
- `TimePicker`
- `ColorPicker`
- `FileUpload`
- `Chips`

## Objetivo

Auditar os formularios complexos com foco em:

- paineis de dropdown e popover;
- teclado: ArrowUp, ArrowDown, Home, End, Enter, Space, Escape e Tab;
- controle de foco e fechamento previsivel;
- uso correto de ARIA para `combobox`, `listbox`, `option`, dialog/popover e
  entradas compostas;
- padronizacao visual dos paineis conforme a estetica aprovada de
  `Select`/`MultiSelect`;
- reducao de duplicacao, principalmente em `FileUpload`;
- preservacao da API publica atual e dos consumidores existentes.

## Estado do worktree no inicio da auditoria

Ha alteracoes antigas nao relacionadas no MonsanUI:

- `docs/component-inventory.md`
- `src/lib/components/Deck.svelte`
- auditorias antigas nao rastreadas em `docs/component-audits/`

Esta auditoria nao altera, reverte, incorpora ou commita essas mudancas. O
unico arquivo esperado nesta etapa e este relatorio.

## Contrato estrutural recomendado

### Dropdown de escolha

Para `Select` e `MultiSelect`, o contrato deve ser:

```text
root -> trigger/combobox -> panel/listbox -> option
```

Regras:

- `root` controla posicionamento relativo e outside click.
- `trigger` abre/fecha e anuncia estado com `aria-expanded`.
- `panel` possui ID estavel e `role="listbox"`.
- `option` possui ID estavel e `role="option"`.
- foco pode permanecer no trigger usando `aria-activedescendant`, ou mover para
  opcoes; a escolha deve ser consistente entre `Select` e `MultiSelect`.
- ArrowDown/ArrowUp movem item ativo.
- Home/End movem para primeiro/ultimo.
- Enter/Space selecionam.
- Escape fecha e devolve foco ao trigger.
- `MultiSelect` nao fecha ao selecionar; `Select` fecha ao selecionar.
- painel deve mostrar cerca de 8 itens antes de scroll, respeitando viewport.

### Popover de data, hora e cor

Para `DatePicker`, `TimePicker` e `ColorPicker`, o contrato deve ser:

```text
root -> trigger -> popover -> interactive content
```

Regras:

- trigger deve ter `aria-haspopup` adequado, `aria-expanded` e
  `aria-controls`.
- popover deve ter ID estavel.
- Escape fecha.
- clique fora fecha.
- Tab nao deve prender foco indevidamente; se o popover se comportar como
  dialog leve, isso deve ser explicito.
- controles internos precisam ter semantica propria:
  - calendario: grid/date picker;
  - hora: listas de horas/minutos;
  - cor: grade/lista de opcoes ou radio group.

### FileUpload

Contrato recomendado:

```text
input escondido -> trigger/dropzone -> file list -> remove action
```

Regras:

- input nativo continua sendo a fonte semantica de arquivo.
- variantes nao devem duplicar markup de lista de arquivos.
- remover arquivo deve ser uma acao semanticamente clara.
- drag/drop deve manter estados visuais e `aria-live` apenas quando ha mudanca
  relevante.
- `invisible` deve continuar delegando trigger ao consumidor por snippet.

### Chips

Contrato recomendado:

```text
field -> selected chips -> input
```

Regras:

- input deve manter label/description via props.
- chips removiveis devem ser botoes com label acessivel.
- Backspace em input vazio remove ultimo chip.
- Enter e virgula adicionam chip.
- considerar `aria-invalid` e estilo invalid para alinhar aos controles simples.
- nao fingir `combobox` enquanto nao houver sugestoes.

## Mapa de consumidores

Uso observado:

- Examster
  - `Select`: modais admin, preview, filtros de dashboard/admin.
  - `MultiSelect`: filtros de questoes no admin.
- Manki
  - `Select`: modal de geracao por IA.
  - `FileUpload`: importacao de backup.
- Owlth
  - Nenhum uso encontrado em `src` nesta busca.
- Frequence
  - Nenhum uso encontrado em `src` nesta busca.
- Shellfish
  - Nenhum uso encontrado em `src` nesta busca.
- MonsanUI showcase
  - exemplos de `Select`, `DatePicker`, `TimePicker`, `ColorPicker`,
    `FileUpload` e `Chips`.

Conclusao: `Select` tem o maior raio de impacto real, especialmente em
Examster. `MultiSelect` afeta filtros importantes. `FileUpload` afeta fluxo real
de importacao no Manki. `DatePicker`, `TimePicker`, `ColorPicker` e `Chips`
podem ser refatorados com menor risco de consumidor, mas ainda precisam manter
API publica e showcase funcionando.

## Resumo executivo

| Componente    | Diagnostico                                                                 | Acao recomendada                                         |
| ------------- | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| `Select`      | Visual aprovado, mas teclado e ARIA de listbox estao incompletos.           | Recontratar internamente como combobox/listbox.          |
| `MultiSelect` | Visual aprovado, mas duplica muito de `Select` e nao navega por opcoes.     | Recontratar junto com `Select` e compartilhar base.      |
| `DatePicker`  | Popover simples; depende de `Calendar`, mas trigger nao controla painel.    | Hardening de trigger/popover e Escape/foco.              |
| `TimePicker`  | Popover proprio, listas sem roles e sem teclado entre opcoes.               | Recontratar listas de hora/minuto como listbox/grid.     |
| `ColorPicker` | Popover proprio, grade de cores sem semantica de grupo/listbox.             | Recontratar como paleta acessivel e remover SVG local se |
|               |                                                                             | necessario em etapa futura.                              |
| `FileUpload`  | Funciona, mas possui duplicacao grande entre variantes e listas de arquivo. | Simplificar com snippets internos sem mudar API.         |
| `Chips`       | Estrutura boa para tags livres; falta invalid/semantica de lista.           | Hardening a11y e invalid; manter sem combobox por ora.   |

## Auditoria por componente

### Select

Arquivo: `src/lib/components/Select.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-select-container" onkeydown role="none">
	<button class="monsan-select-trigger" aria-haspopup="listbox" aria-expanded>
		<span class="label-text">...</span>
		<span class="chevron-wrapper">...</span>
	</button>

	{#if isOpen}
		<div class="monsan-select-dropdown" role="listbox">
			<button class="select-option" role="option" aria-selected>...</button>
		</div>
	{/if}
</div>
```

Wrappers:

- `root`: justificado para posicionar dropdown e outside click.
- `trigger`: correto como botao visual.
- `dropdown`: necessario para painel.
- `option button`: aceitavel como opcao clicavel, mas sem relacao completa com
  trigger/listbox.

Problemas:

- ArrowDown abre, mas nao navega pelos itens.
- ArrowUp, Home e End nao existem.
- Enter/Space com painel aberto nao selecionam item ativo.
- nao ha item ativo separado de item selecionado.
- trigger nao tem `aria-controls`.
- painel nao tem ID estavel.
- opcoes nao tem IDs para `aria-activedescendant`.
- foco nao e devolvido explicitamente ao trigger ao fechar.
- outside click fica registrado em `onMount` o tempo todo, mesmo fechado.
- `Select` e `MultiSelect` duplicam quase todo o contrato visual e de painel.

Proposta:

- manter API publica atual.
- adicionar IDs internos estaveis.
- adicionar `activeIndex`.
- usar trigger como `role="combobox"` ou manter `button` com
  `aria-haspopup="listbox"` e `aria-activedescendant`; escolher o mesmo padrao
  em `MultiSelect`.
- implementar ArrowUp/Down, Home, End, Enter, Space e Escape.
- `Select`: selecionar fecha o painel.
- mover listener de outside click para `$effect` apenas quando aberto.
- preservar painel visual atual.
- extrair helper interno ou padrao compartilhado entre `Select` e
  `MultiSelect` em etapa posterior, se a duplicacao ficar clara.

Classificacao: Recontratar.

### MultiSelect

Arquivo: `src/lib/components/MultiSelect.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-multiselect-container" onkeydown role="none">
	<button class="monsan-multiselect-trigger" aria-haspopup="listbox" aria-expanded> ... </button>

	{#if isOpen}
		<div class="monsan-multiselect-dropdown" role="listbox" aria-multiselectable="true">
			<button class="multiselect-option" role="option" aria-selected>...</button>
		</div>
	{/if}
</div>
```

Wrappers:

- mesmos wrappers de `Select`, todos com funcao real.

Problemas:

- nao navega por opcoes via teclado.
- Enter/Space so abrem quando fechado.
- nao ha item ativo.
- trigger nao tem `aria-controls`.
- painel/opcoes nao tem IDs.
- seleciona com clique, mas nao com teclado.
- duplica visual, estrutura, outside click e estado de `Select`.
- comentario interno sobre "All" deve ser removido ou formalizado como contrato
  de opcao `value === ''`.

Proposta:

- aplicar mesmo contrato de teclado/ARIA do `Select`.
- `MultiSelect`: selecionar item mantem painel aberto.
- Escape fecha e devolve foco.
- documentar `value === ''` como opcao reset/all ou substituir por prop mais
  explicita em futura etapa; nao quebrar agora.
- preservar formato visual aprovado.

Classificacao: Recontratar.

### DatePicker

Arquivo: `src/lib/components/DatePicker.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-datepicker-container">
	<button class="datepicker-trigger" aria-expanded>...</button>
	{#if isOpen}
		<div class="datepicker-dropdown">
			<Calendar bind:selectedDate />
		</div>
	{/if}
</div>
```

Wrappers:

- `root`: necessario para posicionamento.
- `trigger`: correto.
- `dropdown`: necessario para popover.

Problemas:

- trigger nao declara `aria-haspopup` nem `aria-controls`.
- dropdown nao tem ID.
- Escape nao fecha.
- foco nao e gerenciado ao selecionar data.
- fechamento automatico por timer apos `value` mudar pode ser frágil.
- sem `ariaDescribedby`/`ariaInvalid`, diferente dos controles simples.
- depende da semantica interna de `Calendar`, que sera auditada em componente
  de produto.

Proposta:

- manter API.
- adicionar `ariaDescribedby` e `ariaInvalid`.
- adicionar ID de painel, `aria-controls`, `aria-haspopup="dialog"` e Escape.
- fechar explicitamente no evento de selecao se possivel; se `Calendar` nao
  expuser evento, manter timer por compatibilidade e registrar pendencia.
- nao reescrever `Calendar` nesta fase.

Classificacao: Simplificar/Recontratar parcialmente.

### TimePicker

Arquivo: `src/lib/components/TimePicker.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-time-picker-container">
	<button class="time-picker-trigger" aria-expanded>...</button>
	<div class="time-picker-dropdown">
		<div class="picker-column">
			<button class="number-btn">HH</button>
		</div>
		<div class="picker-column">
			<button class="number-btn">MM</button>
		</div>
		<button class="confirm-time-btn">Confirmar</button>
	</div>
</div>
```

Wrappers:

- todos os wrappers sao funcionais: painel, header, colunas, listas e botoes.

Problemas:

- trigger nao tem `aria-haspopup`/`aria-controls`.
- dropdown nao tem ID.
- Escape nao fecha.
- listas nao tem `role="listbox"` nem `aria-label` por coluna.
- opcoes nao expõem `aria-selected`.
- ArrowUp/ArrowDown nao navegam horas/minutos.
- usa SVG inline de relogio, diferente do padrao de icones compartilhados.
- `scrollToSelected` e correto, mas depende de `setTimeout`.

Proposta:

- manter API.
- adicionar IDs, `aria-controls`, Escape e outside click apenas quando aberto.
- transformar colunas em listboxes com opcoes selecionaveis.
- implementar ArrowUp/ArrowDown dentro das listas.
- manter botao Confirmar.
- substituir SVG inline por icone compartilhado em commit separado se aprovado
  ou criar icone `Clock`.

Classificacao: Recontratar.

### ColorPicker

Arquivo: `src/lib/components/ColorPicker.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="monsan-color-picker-container">
	<button class="color-picker-trigger" aria-expanded>
		<div class="color-preview"></div>
		<span class="color-hex">...</span>
	</button>
	<input type="color" class="sr-only" />
	<div class="color-picker-dropdown">
		<div class="preset-grid">
			<button class="preset-btn">...</button>
		</div>
		<button class="custom-color-btn">...</button>
	</div>
</div>
```

Wrappers:

- root, trigger, preview, dropdown e grid sao funcionais.
- input color escondido e justificado para seletor nativo customizado.

Problemas:

- trigger nao tem `aria-haspopup`/`aria-controls`.
- dropdown nao tem ID.
- Escape nao fecha.
- grid de cores nao tem semantica de grupo/listbox/radio.
- opcoes nao tem `aria-pressed`, `aria-selected` ou `role`.
- teclado fica dependente de tab entre botoes; nao ha arrow navigation.
- nomes das cores estao em objeto local, duplicando i18n fora do sistema
  principal.
- nao possui `id`, `name`, `ariaDescribedby` ou `ariaInvalid`.

Proposta:

- manter API e adicionar `id`, `name`, `ariaDescribedby`, `ariaInvalid`.
- adicionar `aria-controls`, `aria-haspopup="grid"` ou `dialog`.
- transformar preset grid em `role="grid"`/`gridcell` ou `radiogroup`.
  Recomendacao: usar `radiogroup` para paleta, pois ha uma cor selecionada.
- implementar arrow navigation na grade.
- manter input nativo escondido para custom color.
- avaliar mover nomes de cores para i18n em lote separado.

Classificacao: Recontratar.

### FileUpload

Arquivo: `src/lib/components/FileUpload.svelte`
Exportado: sim.

DOM atual:

```svelte
<input type="file" class="sr-only" />

{#if variant === 'invisible'}
	{@render trigger({ open })}
{:else if variant === 'compact'}
	<div class="monsan-file-upload-container monsan-file-compact">...</div>
{:else if variant === 'overlay'}
	<div class="monsan-file-upload-container">...</div>
{:else}
	<div class="monsan-file-upload-container">...</div>
{/if}
```

Wrappers:

- input escondido: necessario.
- container por variante: justificado.
- dropzone label: correto para abrir input.
- overlay fullscreen: justificado para drag/drop global.
- listas de arquivos: justificadas, mas duplicadas.

Problemas:

- markup de lista de arquivos e botoes de remocao se repete entre default,
  overlay e compact.
- `formatSize` usa strings fixas `Bytes`, `KB`, `MB`, `GB`; isso pode ser
  aceitavel como unidade, mas deve ser considerado.
- overlay registra listeners globais quando variante `overlay`; ok, mas deve
  garantir cleanup e nao reagir quando disabled.
- dropzone default usa `label`, mas compact/overlay usam botoes separados.
- falta `ariaInvalid`.
- estado de arquivos selecionados nao tem `aria-live`.
- `handleFileChange` ignora selecao vazia, mas nao limpa input se usuario
  escolher o mesmo arquivo depois de remover.

Proposta:

- manter API publica e variantes.
- criar snippets internos/blocks compartilhados para:
  - file list preview;
  - file item;
  - remove button;
  - upload icon/empty text.
- adicionar `ariaInvalid` no input e estado visual nas superficies aplicaveis.
- adicionar `aria-live="polite"` para resumo/lista de arquivos quando houver
  mudanca.
- preservar `invisible` como contrato de trigger externo.
- nao alterar drag/drop global sem teste visual/manual.

Classificacao: Simplificar com risco medio.

### Chips

Arquivo: `src/lib/components/Chips.svelte`
Exportado: sim.

DOM atual:

```svelte
<div role="presentation" class="monsan-chips-input-container">
	<div class="chips-list">
		<div class="chip-item">
			<span class="chip-text">...</span>
			<button class="chip-remove-btn">...</button>
		</div>
		<input class="chips-input" />
	</div>
</div>
```

Wrappers:

- container: necessario para superficie visual clicavel.
- chips-list: necessario para flex wrap.
- chip-item: necessario para cada tag.
- remove button: correto.

Problemas:

- lista de chips nao tem semantica de lista.
- chip removivel poderia ser `li` dentro de `ul`.
- nao possui `ariaInvalid`.
- nao anuncia adicao/remocao via live region.
- `oninput` e repassado, mas `addTag` nao dispara evento; consumidores que
  dependem apenas de bind funcionam.
- `role="presentation"` no container pode ser desnecessario.
- nao e combobox porque nao possui sugestoes; deve continuar como entrada de
  tags livres.

Proposta:

- manter API.
- adicionar `ariaInvalid` e estado visual invalid.
- trocar estrutura para `ul/li` sem quebrar visual, se aprovado.
- adicionar live region opcional ou discreta para adicao/remocao, se necessario.
- manter Enter/virgula/Backspace.
- nao adicionar dropdown/sugestoes nesta fase.

Classificacao: Simplificar.

## Plano de implementacao recomendado apos aprovacao

### Commit 1 - Select e MultiSelect

- Implementar IDs internos, active index, `aria-controls`,
  `aria-activedescendant` e teclado completo.
- Preservar visual e API.
- Manter `Select` fechando apos selecao e `MultiSelect` aberto apos toggle.

### Commit 2 - DatePicker, TimePicker e ColorPicker

- Adicionar `aria-controls`, `aria-haspopup`, Escape e IDs.
- Adicionar `ariaDescribedby`/`ariaInvalid` onde aplicavel.
- Melhorar semantica de TimePicker e ColorPicker sem mexer no layout visual.
- Adiar mudancas profundas no `Calendar`.

### Commit 3 - FileUpload

- Reduzir duplicacao da lista de arquivos com blocos/snippets internos.
- Adicionar invalid visual e live region quando aplicavel.
- Preservar todas as variantes.

### Commit 4 - Chips

- Adicionar `ariaInvalid` e invalid visual.
- Melhorar semantica de lista de chips.
- Preservar teclado atual.

## Validacao recomendada apos implementacao

- `pnpm test` em MonsanUI.
- Validacao visual do showcase para todos os sete componentes.
- Atualizar e testar consumidores afetados:
  - Examster: obrigatorio por `Select`/`MultiSelect`.
  - Manki: obrigatorio por `Select`/`FileUpload`.
  - Owlth: apenas se o update de MonsanUI for propagado nesta fase.
- Validacao manual recomendada:
  - abrir/fechar dropdowns com teclado;
  - navegar opcoes com setas;
  - selecionar com Enter/Space;
  - fechar com Escape;
  - remover arquivo/tag;
  - importar arquivo em Manki.

## Decisoes pendentes para aprovacao

1. Aprovar recontrato interno de `Select` e `MultiSelect` com teclado completo
   e ARIA consistente.
2. Aprovar hardening de popovers de `DatePicker`, `TimePicker` e `ColorPicker`.
3. Aprovar simplificacao interna de `FileUpload` mantendo variantes.
4. Aprovar `Chips` com semantica de lista e invalid visual.
5. Confirmar se `ColorPicker` deve usar `radiogroup` para a paleta nesta fase.
