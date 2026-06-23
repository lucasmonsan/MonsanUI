# Fase 9 - Componentes de Produto: auditoria estrutural

Data: 2026-06-22
Projeto: MonsanUI
Status: auditoria proposta, sem alteracao de codigo de componente nesta etapa.

Componentes auditados:

- `Deck`
- `CardEditor`
- `Folders`
- `Calendar`
- `ChoiceCard`
- `SingleChoice`
- `MultipleChoice`
- `DndOrder`
- `DndMatch`
- `Terminal`
- `ProgressBar`
- `ProgressSummary`
- `ProfileSummary`
- `PromptPanel`
- `CountdownBadge`
- `MetaDisclosure`
- `Credits`
- `BrandHeader`

## Objetivo

Auditar os componentes de produto com foco em:

- separar componentes de produto reutilizaveis de logica especifica de app;
- remover strings user-facing hardcoded de componentes compartilhados;
- manter a API publica dos consumidores sempre que possivel;
- revisar semantica de questoes, DnD, calendario, terminal e progresso;
- reduzir wrappers, margens estruturais e responsabilidades misturadas;
- preservar a linguagem visual da suite sem empurrar estilo local para apps.

## Estado do worktree no inicio da auditoria

Ha alteracoes antigas nao relacionadas no MonsanUI:

- `docs/component-inventory.md`
- `src/lib/components/Deck.svelte`
- auditorias antigas nao rastreadas em `docs/component-audits/`

`Deck.svelte` tem diff local relevante para esta fase. A auditoria abaixo
considera esse diff, mas nao o incorpora nem commita nesta etapa.

## Contrato estrutural recomendado

### Produto de Manki

Contrato recomendado para `Deck`, `CardEditor`, `Folders` e `Calendar`:

```text
root -> content/header/body/actions -> optional overlay/panel
```

Regras:

- componente recebe dados e callbacks; app continua dono de persistencia;
- copy user-facing deve vir de `i18n` de MonsanUI ou de props de labels bem
  definidas;
- fallback em portugues/ingles/espanhol solto dentro de componente nao deve ser
  aceito;
- overlays internos devem usar componentes aprovados (`QuickActions`, `Dialog`,
  `Select`, `Button`) sem recriar contratos de menu/painel;
- componente nao deve aplicar margem externa estrutural; o pai controla o
  espacamento.

### Questoes e respostas

Contrato recomendado para `SingleChoice`, `MultipleChoice`, `DndOrder`,
`DndMatch` e `Terminal`:

```text
question control -> options/interactions -> value update -> accessible feedback
```

Regras:

- componente e controlado por `value` bindable e nao valida persistencia;
- opcoes precisam de semantica consistente;
- teclado precisa ser completo e previsivel;
- feedback para leitor de tela deve usar live region unica, com copy
  internacionalizada;
- DnD precisa continuar usavel sem drag real, por teclado e por toque;
- `Terminal` precisa manter mensagens e comandos separados de layout visual.

### Progresso, perfil e identidade

Contrato recomendado para `ProgressBar`, `ProgressSummary`, `ProfileSummary`,
`PromptPanel`, `CountdownBadge`, `MetaDisclosure`, `Credits` e `BrandHeader`:

```text
semantic root -> visual content -> optional action/summary
```

Regras:

- componentes pequenos nao devem adicionar margem externa estrutural;
- labels/links/copy devem ser props ou i18n interna;
- elemento semantico deve refletir a funcao real (`progressbar`, `button`,
  `header`, `footer`, `status` quando aplicavel);
- animacoes devem respeitar `prefers-reduced-motion`.

## Mapa de consumidores

Uso observado:

- Manki
  - `BrandHeader`: home.
  - `Deck`: home.
  - `Folders`: home e gerenciamento de decks.
  - `CardEditor`: gerenciamento de decks.
  - `Calendar`: stats.
  - `ProgressSummary`, `CountdownBadge`, `PromptPanel`: estudo.
  - `ProfileSummary`: perfil do usuario.
- Examster
  - `BrandHeader`: landing.
  - `ProgressSummary`, `ProgressBar`: landing, prova, preview e review.
  - `SingleChoice`, `MultipleChoice`, `DndOrder`, `DndMatch`, `Terminal`:
    prova, preview e sandbox.
  - `ChoiceCard`: auth/link.
  - `MetaDisclosure`: admin.
- Owlth
  - `ProfileSummary`: portal.
  - `BrandHeader`: login/portal.
- Frequence
  - `BrandHeader`: landing.
- Shellfish
  - Nenhum uso encontrado em `src` nesta busca.

Conclusao: o maior risco real esta em Examster (`SingleChoice`,
`MultipleChoice`, `DndOrder`, `DndMatch`, `Terminal`, `ProgressBar`) e Manki
(`Deck`, `Folders`, `CardEditor`, `Calendar`). `BrandHeader` e
`ProfileSummary` sao compartilhados entre apps, mas tem menor complexidade.

## Resumo executivo

| Componente        | Diagnostico                                                            | Acao recomendada                                      |
| ----------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| `Deck`            | Diff local melhora a11y, mas adiciona fallbacks em ingles hardcoded.   | Reescrever labels via i18n/props obrigatorias.        |
| `CardEditor`      | Funciona, mas mistura editor, DnD, field defaults e copy PT hardcoded. | Extrair contrato de labels/fields e revisar a11y.     |
| `Folders`         | Tem modal, select de cor e QuickActions internos com copy PT.          | Padronizar labels, menu, modal footer e color picker. |
| `Calendar`        | Muito comportamento em um componente e varias strings manuais.         | Separar contratos por modo e i18n de aria/copy.       |
| `ChoiceCard`      | Estrutura simples e boa.                                               | Pequeno hardening de aria-label configuravel.         |
| `SingleChoice`    | Semantica basica presente.                                             | Adicionar label de grupo e revisar teclado.           |
| `MultipleChoice`  | Semantica basica presente.                                             | Adicionar label de grupo e revisar teclado.           |
| `DndOrder`        | Teclado existe, mas anuncios sao strings manuais por locale.           | I18n/labels para aria e live region.                  |
| `DndMatch`        | Interacao completa, mas complexa e com copy hardcoded.                 | I18n/labels e auditoria de roles/listbox.             |
| `Terminal`        | Simulador robusto, mas copy/commands e UI estao acoplados.             | Separar mensagens e hardening de a11y/IDs.            |
| `ProgressBar`     | Semantica boa de progressbar.                                          | Pequeno hardening de aria e reduced text.             |
| `ProgressSummary` | Wrapper simples e correto.                                             | Sem mudanca estrutural relevante.                     |
| `ProfileSummary`  | Simples e correto.                                                     | Evitar `h2` fixo ou permitir nivel configuravel.      |
| `PromptPanel`     | Usa `Panel`, mas tem margem externa estrutural.                        | Remover margem default e delegar ao pai.              |
| `CountdownBadge`  | Visual simples; warning animado correto.                               | Adicionar role/aria opcional se usado como timer.     |
| `MetaDisclosure`  | Bom contrato de disclosure.                                            | Adicionar `aria-controls` e ID por instancia.         |
| `Credits`         | Usa i18n, mas carrega margem externa e links fixos.                    | Tornar spacing opt-in e documentar links.             |
| `BrandHeader`     | Simples e usado em apps.                                               | Corrigir semantica do logo sem imagem real.           |

## Auditoria por componente

### Deck

Arquivo: `src/lib/components/Deck.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="deck-card panel" role="button" tabindex="0">
	<div class="deck-info">...</div>
	<QuickActions>...</QuickActions>
	<div class="mode-popover">...</div>
</div>
```

Diff local atual:

- adiciona `labels.moreOptions` e `labels.closePopover`;
- troca classe string por `class:selected-for-play`;
- adiciona `type="button"`, `aria-haspopup`, `aria-expanded`;
- adiciona `ariaLabel` nos botoes de duplicate/edit/delete;
- move cursor/position para CSS;
- adiciona reduced motion;
- mantem fallbacks em ingles:
  - `More options`
  - `Close popover`
  - `Duplicate`
  - `Edit`
  - `Delete`
- mantem outros fallbacks:
  - `cartas`
  - `due`
  - `new`

Diagnostico:

- a intencao do diff e correta para a11y e limpeza estrutural;
- o componente continua sendo sensivel porque combina card clicavel, menu,
  popover de modo de estudo, long press e outside click;
- `role="button"` no card inteiro com botoes internos cria risco de interacao
  aninhada confusa para leitor de tela;
- fallback em ingles dentro de MonsanUI viola a regra de strings user-facing em
  componentes compartilhados;
- `document.getElementById(deck.id)` depende de ID externo unico e pode colidir
  se consumidor reutilizar ID de deck em contexto de preview/showcase.

Proposta:

- nao aceitar o diff local do jeito atual.
- reaproveitar as melhorias de `class:*`, `type="button"`, ARIA e reduced
  motion.
- trocar fallbacks por um destes contratos:
  - preferencial: usar `i18n.t('deck.moreOptions')`, `i18n.t('deck.duplicate')`,
    etc. dentro do MonsanUI;
  - alternativa: tornar `labels` obrigatorio para toda copy user-facing em
    `Deck`.
- adicionar `ariaLabel`/`title` derivados do mesmo contrato de labels.
- revisar raiz clicavel: considerar um botao/area principal para selecionar e
  uma regiao separada de acoes, evitando botoes dentro de um elemento com
  `role="button"`.
- trocar outside click para referencia local `bind:this` em vez de lookup por
  `document.getElementById`.

### CardEditor

Arquivo: `src/lib/components/CardEditor.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="card-editor-item" role="listitem" draggable>
	<div class="card-header">drag handle + title + actions</div>
	<div class="inputs-stack">fields</div>
</div>
```

Problemas:

- `defaultFields` tem copy PT hardcoded: `Pergunta`, `Resposta`, `Dica`,
  placeholders e defaults de labels;
- labels de acoes misturam PT e fallback `Card ${n}`;
- botoes icon-only dependem de `title`, mas nao tem `aria-label` explicito;
- drag por header e touch listeners sao manuais e sensiveis;
- o componente combina field schema, editor visual e DnD de lista.

Proposta:

- manter API atual, mas mover defaults para i18n interna.
- adicionar `aria-label` nos botoes de mover, duplicar, excluir e toggle de
  campo opcional.
- manter `fields` como contrato principal para apps que precisam campos
  customizados.
- revisar `role="listitem"` somente se o consumidor garantir parent `role=list`;
  caso contrario, permitir prop ou remover role.
- nao alterar comportamento de DnD sem teste visual/interativo no Manki.

### Folders

Arquivo: `src/lib/components/Folders.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="folders-bar">
	<button class="folder-chip-all">...</button>
	<div class="folder-chip">
		<button class="folder-chip-text">...</button>
		<QuickActions>...</QuickActions>
	</div>
</div>
<Dialog>folder form</Dialog>
```

Problemas:

- muitos labels PT hardcoded em fallback;
- modal de pasta implementa formulario local sem `FormField`;
- paleta de cor recria comportamento de escolha unica sem `ColorPicker` ou
  radiogroup claro;
- `QuickActions` interno nao expõe `aria-expanded` no trigger;
- scroll horizontal com wheel e fades e util, mas precisa ser mantido sem
  assumir layout de pagina.

Proposta:

- mover fallback de labels para i18n interna ou tornar labels obrigatorio.
- usar `FormField` para nome da pasta.
- transformar cores em `radiogroup` com labels acessiveis ou reaproveitar
  `ColorPicker` se o produto aceitar os presets.
- manter `layout` atual.
- nao mexer no comportamento de criar/editar/excluir sem validar Manki.

### Calendar

Arquivo: `src/lib/components/Calendar.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="calendar-card panel">
	<div class="calendar-top-bar">title/month picker/nav</div>
	<div class="calendar-header">weekdays</div>
	<div class="calendar-grid | heatmap-grid | calendar-list-view">...</div>
	<div class="calendar-details-panel">...</div>
</div>
```

Problemas:

- um componente concentra quatro modos: `heatmap`, `calendar`, `week`, `list`;
- varias strings ainda sao manuais por locale:
  - `Semana Atual`, `Current Week`, `Semana Actual`;
  - `Selecionar mes e ano`;
  - `Ano Anterior`, `Proximo Ano`;
  - `Mes anterior`, `Proximo mes`;
  - `Fechar detalhes`;
  - textos de `getAriaLabelForDay`;
- popover de mes/ano tem `role="dialog"` mas nao usa contrato de Dialog nem
  controle de foco;
- grid de calendario usa botoes, mas nao `grid`/`gridcell`;
- `max-width: 480px` e `margin: 0 auto` sao layout estrutural dentro do
  componente, podendo conflitar com grids de stats.

Proposta:

- primeiro lote: mover toda copy para i18n interna do MonsanUI.
- adicionar labels props opcionais apenas para override.
- revisar popover de mes/ano com Escape, outside click condicional e
  `aria-controls`.
- considerar separar internamente por modo em snippets/funcoes, sem mudar API:
  `HeatmapView`, `CalendarGridView`, `WeekView`, `AgendaView` podem ser blocos
  internos antes de virarem componentes.
- remover `max-width`/`margin auto` ou tornar opt-in se aprovado, deixando o pai
  controlar largura.

### ChoiceCard

Arquivo: `src/lib/components/ChoiceCard.svelte`
Exportado: sim.

Diagnostico:

- estrutura simples e boa: botao real, conteudo vertical, action no final.
- `aria-label` concatena `title` e `actionLabel`, o que pode duplicar texto ja
  visivel.

Proposta:

- adicionar prop `ariaLabel` opcional.
- manter DOM e visual.

### SingleChoice

Arquivo: `src/lib/components/questions/SingleChoice.svelte`
Exportado: sim.

Diagnostico:

- usa `role="radiogroup"` e botoes com `role="radio"`;
- value bindable simples;
- nao tem label de grupo ou `aria-labelledby`;
- navegacao por setas nao esta implementada; foco passa por todos os botoes via
  Tab.

Proposta:

- adicionar props `ariaLabel`/`ariaLabelledby`.
- implementar ArrowUp/Down/Left/Right para mover selecao/foco dentro do grupo.
- manter API `options`, `value`, `columns`, `size`.

### MultipleChoice

Arquivo: `src/lib/components/questions/MultipleChoice.svelte`
Exportado: sim.

Diagnostico:

- usa `role="group"` e botoes com `role="checkbox"`;
- nao tem label de grupo;
- teclado Space/Enter funciona por ser botao, mas setas nao navegam.

Proposta:

- adicionar props `ariaLabel`/`ariaLabelledby`.
- considerar roving focus opcional se o grupo for grande.
- manter visual e API.

### DndOrder

Arquivo: `src/lib/components/DndOrder.svelte`
Exportado: sim.

Diagnostico:

- oferece drag desktop, toque e teclado;
- live region existe;
- usa strings manuais por locale para anuncios e aria-label;
- `role="listbox"`/`role="option"` pode funcionar, mas reordenacao nao e uma
  selecao tradicional;
- `document.querySelector([data-index])` pode acertar outro DnD se houver mais
  de uma instancia na pagina.

Proposta:

- mover aria/live strings para i18n interna ou labels props:
  `itemPosition`, `moveUpAnnouncement`, `moveDownAnnouncement`,
  `reorderInstructions`.
- escopar foco com `bind:this` no root em vez de `document.querySelector`.
- avaliar se `role="list"` + items focusables e live region comunica melhor que
  `listbox`.
- manter comportamento de drag.

### DndMatch

Arquivo: `src/lib/components/DndMatch.svelte`
Exportado: sim.

Diagnostico:

- oferece drag, toque, clique-seleciona e teclado;
- tem `labels` parcial, mas fallbacks PT hardcoded;
- anuncios e aria-labels ainda usam strings manuais por locale;
- areas usam `role="listbox"` com chips `role="option"`, mas a interacao e
  classificacao entre grupos, nao selecao simples;
- comentarios e strings internas estao misturados no componente.

Proposta:

- expandir `labels` ou i18n interna para toda copy:
  pool, vazio, drop, instrucoes, anuncios e labels de chips.
- revisar roles: possivel contrato `list`/`listitem` + botoes/chips focusables,
  mantendo live region para movimento.
- manter click-to-select como alternativa acessivel ao drag.
- nao mexer em layout mobile sem teste em Examster.

### Terminal

Arquivo: `src/lib/components/Terminal.svelte`
Exportado: sim.

Diagnostico:

- componente complexo: filesystem virtual, interpretador de comandos, historico,
  explorer e UI responsiva;
- `messages` cobre boa parte da copy, mas defaults sao PT hardcoded e duas
  mensagens de help sao hardcoded no comando `help`;
- `term-input` e ID fixo; multiplas instancias podem colidir;
- foco no wrapper usa listener manual e `document.getElementById`;
- historico visual nao tem live region/role log;
- SVGs inline de explorer poderiam virar icons compartilhados em etapa futura.

Proposta:

- criar ID por instancia para input.
- substituir `document.getElementById` por `bind:this`.
- mover defaults e help para i18n interna ou exigir `messages`.
- adicionar `role="log"`/`aria-live="polite"` no historico, com cuidado para
  nao anunciar todo historico a cada comando.
- manter comandos e API atuais.

### ProgressBar

Arquivo: `src/lib/components/ProgressBar.svelte`
Exportado: sim.

Diagnostico:

- semantica de `role="progressbar"` correta;
- valor e clampado;
- `aria-valuetext={text}` e bom quando existe texto;
- `showLabel` usa `{clampedValue}%`, sem casas, adequado.

Proposta:

- sem mudanca estrutural obrigatoria.
- considerar fallback `aria-label` i18n quando nenhum label vier, mas isso pode
  ser melhor como responsabilidade do consumidor.

### ProgressSummary

Arquivo: `src/lib/components/ProgressSummary.svelte`
Exportado: sim.

Diagnostico:

- wrapper simples: barra + texto `current/total`;
- nao adiciona margem estrutural;
- depende de `label` para acessibilidade.

Proposta:

- sem mudanca estrutural relevante.

### ProfileSummary

Arquivo: `src/lib/components/ProfileSummary.svelte`
Exportado: sim.

Diagnostico:

- estrutura simples e correta;
- usa `Text tag="h2"` fixo, o que pode conflitar com hierarquia de pagina.

Proposta:

- adicionar prop `nameTag?: 'h2' | 'h3' | 'p' | 'span'` ou `headingLevel`;
- manter default atual por compatibilidade.

### PromptPanel

Arquivo: `src/lib/components/PromptPanel.svelte`
Exportado: sim.

Diagnostico:

- encapsula `Panel`;
- aplica `margin-bottom: var(--space-xl)`, que e espacamento estrutural de pai;
- condensa com scale/opacity, adequado para estudo.

Proposta:

- remover margem default ou tornar opt-in (`spacing="none" | "bottom-lg"`).
- manter `condensed`.

### CountdownBadge

Arquivo: `src/lib/components/CountdownBadge.svelte`
Exportado: sim.

Diagnostico:

- visual simples;
- se usado como timer, pode precisar de `role="timer"` ou `aria-live`;
- animacao respeita reduced motion.

Proposta:

- adicionar props opcionais `role`, `ariaLive`, `ariaLabel`.
- manter default visual sem live region para nao anunciar a cada segundo por
  acidente.

### MetaDisclosure

Arquivo: `src/lib/components/MetaDisclosure.svelte`
Exportado: sim.

Diagnostico:

- contrato visual e semantico bom: trigger real com `aria-expanded`;
- falta `aria-controls` e ID por instancia no painel;
- `section` sem label pode ser aceitavel, mas nao vira regiao nomeada.

Proposta:

- adicionar ID interno para content.
- ligar trigger com `aria-controls`.
- manter API.

### Credits

Arquivo: `src/lib/components/Credits.svelte`
Exportado: sim.

Diagnostico:

- usa i18n interna para texto principal;
- tem author/link/Svelte como contrato de branding;
- aplica margem externa por default e `placement-page-bottom` com `margin-top:
auto`, competindo com layout de pai.

Proposta:

- tornar spacing opt-in ou adicionar `spacing="default" | "none"`.
- preservar default por compatibilidade, mas documentar que `AppShell`/layout
  deve controlar posicao em apps novos.

### BrandHeader

Arquivo: `src/lib/components/BrandHeader.svelte`
Exportado: sim.

Diagnostico:

- usado por Manki, Examster, Owlth e Frequence;
- visual simples e adequado;
- quando logo nao e clicavel, renderiza `span` mascarado com `aria-label`, mas
  `span` sem role pode nao comunicar imagem corretamente;
- `logoAlt` default vazio e aceitavel para logo decorativo, mas se for informativo
  precisa role/label correto.

Proposta:

- se `logoAlt` existir, usar `role="img"` no `span` mascarado;
- se `logoAlt` vazio, manter `aria-hidden="true"`;
- manter `logoButtonLabel` obrigatorio quando logo for botao.

## Ordem de implementacao proposta

### Commit 1 - Product labels hardening

Arquivos:

- `src/lib/components/Deck.svelte`
- `src/lib/components/CardEditor.svelte`
- `src/lib/components/Folders.svelte`
- `src/lib/components/Calendar.svelte`

Escopo:

- resolver strings user-facing hardcoded via i18n interna ou labels completos;
- reaproveitar partes seguras do diff local de `Deck`;
- nao alterar layout visual.

Validacao:

- `pnpm test` no MonsanUI;
- depois da integracao, validar Manki com foco em home, pastas, editor de cards
  e stats.

### Commit 2 - Question controls a11y

Arquivos:

- `src/lib/components/questions/SingleChoice.svelte`
- `src/lib/components/questions/MultipleChoice.svelte`
- `src/lib/components/DndOrder.svelte`
- `src/lib/components/DndMatch.svelte`

Escopo:

- adicionar labels de grupo;
- mover aria/live strings para i18n/labels;
- escopar foco de DnD por instancia;
- revisar roles sem mudar comportamento.

Validacao:

- `pnpm test` no MonsanUI;
- depois da integracao, validar Examster prova, preview e sandbox.

### Commit 3 - Terminal hardening

Arquivos:

- `src/lib/components/Terminal.svelte`

Escopo:

- IDs por instancia;
- foco por refs, sem `document.getElementById`;
- mensagens/help via i18n/messages;
- role/log live region com escopo conservador.

Validacao:

- `pnpm test` no MonsanUI;
- depois da integracao, validar Examster terminal em prova/preview/sandbox.

### Commit 4 - Small product primitives

Arquivos:

- `src/lib/components/ChoiceCard.svelte`
- `src/lib/components/ProgressBar.svelte`
- `src/lib/components/ProgressSummary.svelte`
- `src/lib/components/ProfileSummary.svelte`
- `src/lib/components/PromptPanel.svelte`
- `src/lib/components/CountdownBadge.svelte`
- `src/lib/components/MetaDisclosure.svelte`
- `src/lib/components/Credits.svelte`
- `src/lib/components/BrandHeader.svelte`

Escopo:

- `ChoiceCard`: `ariaLabel` opcional.
- `ProfileSummary`: tag/heading configuravel.
- `PromptPanel`: remover/tornar opt-in margem estrutural.
- `CountdownBadge`: role/aria opcionais.
- `MetaDisclosure`: `aria-controls`.
- `Credits`: spacing opt-in.
- `BrandHeader`: logo semanticamente correto.
- `ProgressBar`/`ProgressSummary`: apenas ajustes se houver warning real.

Validacao:

- `pnpm test` no MonsanUI;
- depois da integracao, validar Manki, Examster, Owlth e Frequence quando o outro
  agente puder atualizar.

## Riscos e cuidados

- `Deck` tem diff local antigo; nao usar `git add .` no MonsanUI sem revisar
  cuidadosamente.
- `Calendar` afeta diretamente a pagina de stats do Manki.
- `DndOrder`, `DndMatch` e `Terminal` afetam fluxos de prova do Examster; qualquer
  mudanca deve preservar respostas ja serializadas.
- Remover margem de `PromptPanel` pode mudar a tela de estudo do Manki; se
  aprovado, o espacamento deve ser corrigido no pai ou em componente de layout,
  nao com margem local escondida.
- `Credits` e `BrandHeader` aparecem em splash/landing/login; mudancas devem ser
  conservadoras.

## Fora de escopo nesta fase

- reescrever completamente o simulador de terminal;
- trocar schema de respostas do Examster;
- alterar modelo de dados de decks, pastas ou cards;
- trocar `Calendar` por biblioteca externa;
- nova engine DnD;
- mudancas visuais grandes de cards, calendario, questoes ou terminal;
- atualizacao de consumidores antes de merge do MonsanUI.

## Decisoes solicitadas

Antes de implementar, confirmar:

- `Deck`: aprovar reescrever o diff local usando i18n interna de MonsanUI para
  todos os fallbacks de labels.
- `CardEditor`, `Folders`, `Calendar`, `DndOrder`, `DndMatch` e `Terminal`:
  aprovar mover toda copy default para i18n interna, preservando props de labels
  como override.
- `PromptPanel`: aprovar remover a margem estrutural default ou transformar em
  opt-in.
- `Credits`: aprovar transformar spacing externo em opt-in, preservando default
  se for necessario para compatibilidade.
- `BrandHeader`: aprovar corrigir a semantica do logo mascarado com
  `role="img"` apenas quando `logoAlt` existir.
