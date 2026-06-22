# Fase 8 - Overlays: auditoria estrutural

Data: 2026-06-22
Projeto: MonsanUI
Status: auditoria proposta, sem alteracao de codigo de componente nesta etapa.

Componentes auditados:

- `Dialog`
- `ConfirmDialog`
- `MediaDialog`
- `Loading`
- `Toast`
- `ToastViewport`
- `FlashOverlay`
- `SplashScreen`

## Objetivo

Auditar os overlays da suite com foco em:

- acessibilidade de modais, incluindo foco inicial, retorno de foco, Escape,
  clique fora e foco preso pelo modal quando aplicavel;
- comportamento de scroll e bloqueio/interacao da pagina de fundo;
- consistencia entre overlays bloqueantes, informativos e decorativos;
- `aria-live`, tempo de vida e transicoes de toasts;
- reducao de contratos ambiguos sem mudar a API publica dos consumidores.

## Estado do worktree no inicio da auditoria

Ha alteracoes antigas nao relacionadas no MonsanUI:

- `docs/component-inventory.md`
- `src/lib/components/Deck.svelte`
- auditorias antigas nao rastreadas em `docs/component-audits/`

Esta auditoria nao altera, reverte, incorpora ou commita essas mudancas. O
unico arquivo esperado nesta etapa e este relatorio.

## Contrato estrutural recomendado

### Modal bloqueante

Contrato recomendado para `Dialog`, `ConfirmDialog`, `MediaDialog` e `Loading`:

```text
native dialog -> panel/document -> header/body/footer/actions
```

Regras:

- usar `<dialog>.showModal()` como base de foco e inertness do fundo;
- manter IDs estaveis para `aria-labelledby` e `aria-describedby`;
- devolver foco ao elemento que abriu o modal sempre que possivel;
- fechar com Escape quando o overlay for cancelavel;
- bloquear Escape e outside click quando o overlay for nao cancelavel;
- clique fora deve ser opt-in ou configuravel, nao uma regra fixa para todo
  dialog;
- painel deve controlar o scroll interno, sem deslocar ou depender do scroll da
  pagina de fundo;
- animacao de saida nao pode deixar dialog nativo aberto sem estado coerente;
- respeitar `prefers-reduced-motion`.

### Overlay informativo nao bloqueante

Contrato recomendado para `Toast` e `ToastViewport`:

```text
fixed viewport/live region -> toast item -> message/action
```

Regras:

- o live region deve existir em um unico nivel claro;
- `ToastViewport` deve controlar pilha, posicao e anuncio;
- `Toast` deve controlar apenas visual do item, mensagem e acao;
- erro pode usar `assertive`; sucesso/info devem poder usar `polite`;
- acao deve ser botao real e manter foco/teclado normal;
- viewport deve usar `pointer-events: none` e item com `pointer-events: auto`;
- tempo de vida deve ser responsabilidade do store/consumidor ou API dedicada,
  nao do item visual se nao houver contrato explicito.

### Overlay decorativo ou transitorio

Contrato recomendado para `FlashOverlay` e `SplashScreen`:

```text
fixed layer -> visual content
```

Regras:

- `FlashOverlay` e decorativo e deve continuar `aria-hidden`;
- `FlashOverlay` nao deve capturar foco, pointer ou scroll;
- `SplashScreen` e bloqueante visual de bootstrap, mas nao deve competir com
  modais reais;
- `SplashScreen` deve respeitar reduced motion e nao prender foco sem
  necessidade;
- se `SplashScreen` comunicar carregamento, precisa de semantica consistente
  (`role="status"` ou equivalente), sem repetir anuncios ruidosos.

## Mapa de consumidores

Uso observado:

- Examster
  - `Loading`: landing, sandbox, prova, dashboard, auth e admin.
  - `Dialog`: landing e modais admin.
  - `ConfirmDialog`: layout global, prova e admin.
  - `MediaDialog`: sandbox, prova, preview e admin.
  - `ToastViewport`: layout global.
  - `SplashScreen`: layout global.
- Manki
  - `Loading`: home, IA, perfil.
  - `Dialog`: pastas, IA, rascunho, importacao e filtros.
  - `ConfirmDialog`: exclusao de deck.
  - `ToastViewport`: layout global.
  - `FlashOverlay`: layout global para feedback de sessao.
  - `SplashScreen`: layout global.
- Owlth
  - `Loading`: redirecionamento e portal.
  - `Toast`: uso direto no portal, sem `ToastViewport`.
- Frequence
  - `SplashScreen`: layout global.
  - `ToastViewport`: layout global vazio.

Conclusao: `Dialog`, `Loading` e `Toast/ToastViewport` tem raio de impacto alto.
`MediaDialog` e `ConfirmDialog` dependem diretamente do contrato de `Dialog`.
`FlashOverlay` e simples e deve permanecer decorativo. `SplashScreen` afeta todo
app no boot, mas a mudanca precisa ser conservadora para nao quebrar SSR/hidratacao.

## Resumo executivo

| Componente      | Diagnostico                                                               | Acao recomendada                                      |
| --------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| `Dialog`        | Usa `<dialog>` nativo, mas tem ID fixo, outside click obrigatorio e foco  | Hardening de IDs, foco, fechamento e semantica.       |
|                 | inicial/descricao incompletos.                                            |                                                       |
| `ConfirmDialog` | Compoe `Dialog`, mas acoes ficam no body e nao usam o footer do Dialog.   | Reorganizar para footer/actions sem mudar API.        |
| `MediaDialog`   | Compoe `Dialog`, mas media nao descreve bem conteudo/erro e iframes podem | Ajustar semantica e contratos de titulo/descricao.    |
|                 | exigir refinamento.                                                       |                                                       |
| `Loading`       | Usa `<dialog>` bloqueante e impede cancelamento; foco retorna.            | Manter bloqueante, adicionar IDs e revisar live text. |
| `Toast`         | Item visual tambem anuncia `aria-live`; risco de live region duplicada.   | Delegar live region ao viewport por padrao.           |
| `ToastViewport` | Controla stack visual, mas nao define role/regiao de forma completa.      | Centralizar `aria-live`, role e atomicidade.          |
| `FlashOverlay`  | Decorativo e simples; correto como `aria-hidden`.                         | Apenas reduzir movimento/tempo sem mudar contrato.    |
| `SplashScreen`  | Bloqueante visual de boot; sem semantica de carregamento explicita.       | Hardening conservador de status/reduced motion.       |

## Auditoria por componente

### Dialog

Arquivo: `src/lib/components/Dialog.svelte`
Exportado: sim.

DOM atual:

```svelte
{#if mounted}
	<dialog
		oncancel={handleCancel}
		onclose={handleNativeClose}
		onpointerdown={handlePointerDown}
		class="dialog-wrapper"
		aria-labelledby="modal-title"
	>
		<div class="modal-container" role="document">
			<header class="modal-header">
				<h2 id="modal-title">{title}</h2>
				<div class="modal-header-actions">...</div>
			</header>
			<div class="modal-subheader">...</div>
			<div class="modal-content">...</div>
			<footer class="modal-footer">...</footer>
		</div>
	</dialog>
{/if}
```

Wrappers:

- `dialog`: necessario e correto para modal nativo.
- `modal-container`: necessario como painel animado e limite de scroll.
- `header`, `content`, `footer`: corretos como estrutura interna.
- `modal-header-actions`: justificado para acoes e botao de fechar.

Problemas:

- `aria-labelledby="modal-title"` usa ID fixo; multiplos dialogs montados podem
  gerar IDs duplicados.
- nao ha `aria-describedby` opcional para conectar descricao/subheader.
- nao ha prop para controlar `closeOnOutsideClick`; clicar backdrop sempre fecha.
- `Escape` sempre fecha via `oncancel`; nao ha modo nao cancelavel exceto uso de
  outro componente como `Loading`.
- `showModal()` roda quando montado, mas nao captura explicitamente o elemento
  ativo anterior.
- retorno de foco depende do comportamento nativo e pode falhar com animacao de
  saida ou quando o trigger desmonta.
- `onClose` roda tanto para botao quanto cancelamento; isso e bom, mas precisa
  continuar idempotente durante animacao.
- `Dialog` tem strings default (`Fechar`) dentro da biblioteca; ja existe prop
  `closeLabel`, mas o default em portugues deve ser considerado legado e idealmente
  vir de i18n/hook interno em etapa futura.

Proposta:

- manter API publica atual.
- criar IDs internos estaveis: `titleId`, `descriptionId` quando aplicavel.
- trocar `aria-labelledby="modal-title"` por ID por instancia.
- adicionar prop opcional `ariaDescribedby` ou derivar quando subheader existir.
- adicionar `closeOnOutsideClick = true`.
- adicionar `closeOnEscape = true`, usando `oncancel` com bloqueio configuravel.
- capturar `previousActiveElement` ao abrir e devolver foco ao fechar/desmontar.
- manter `dialogStack` e `closeOnBackNavigation`.
- preservar DOM visual principal.

### ConfirmDialog

Arquivo: `src/lib/components/ConfirmDialog.svelte`
Exportado: sim.

DOM atual:

```svelte
<Dialog bind:open {title} onClose={handleClose}>
	<div class="confirm-content">
		<p class="modal-body">{message}</p>
		<div class="modal-actions">
			<Button>cancel</Button>
			<Button>confirm</Button>
		</div>
	</div>
</Dialog>
```

Wrappers:

- `Dialog`: correto.
- `confirm-content`: aceitavel para layout vertical.
- `modal-actions`: atualmente dentro do body, mas conceitualmente e footer/action
  area.

Problemas:

- acoes ficam dentro de `modal-content`, entao nao aproveitam o footer do
  `Dialog`.
- `message` nao esta conectado a `aria-describedby`.
- confirmacao primaria nao recebe foco inicial explicitamente; em confirmacoes
  destrutivas isso pode ser perigoso dependendo do uso.
- nao existe `variant`/`tone` para a confirmacao, mas isso e fora do escopo
  estrutural imediato.

Proposta:

- manter API publica atual.
- renderizar mensagem no body e acoes no snippet `footer` do `Dialog`.
- conectar mensagem como descricao do dialog quando possivel.
- manter ordem Cancelar -> Confirmar.
- nao auto focar confirmacao destrutiva; se houver foco inicial, preferir
  cancelamento ou botao fechar para evitar confirmacao acidental.

### MediaDialog

Arquivo: `src/lib/components/MediaDialog.svelte`
Exportado: sim.

DOM atual:

```svelte
<Dialog bind:open={isOpen} title={activeTitle} {onClose} size="lg">
	<div class="media-container">
		<img />
		<iframe />
		<video />
		<audio />
		<p class="error-msg" />
	</div>
</Dialog>
```

Wrappers:

- `Dialog`: correto.
- `media-container`: justificado para enquadramento visual.

Problemas:

- `img` tem alt configuravel, correto.
- `iframe` tem title configuravel, correto.
- `video` inclui `<track kind="captions" />` vazio; pode ser semanticamente fraco
  se nao houver captions reais.
- mensagem de erro nao e conectada como descricao.
- nao ha loading state para media remota.
- YouTube URL parsing e funcional, mas nao e foco desta fase.

Proposta:

- manter API publica atual.
- herdar melhorias de `Dialog`.
- conectar erro/mensagem de suporte a uma descricao quando media nao existe.
- avaliar se `<track>` vazio deve ser removido ou receber `src` apenas quando
  consumidor fornecer legenda em fase posterior.
- manter o painel visual atual.

### Loading

Arquivo: `src/lib/components/Loading.svelte`
Exportado: sim.

DOM atual:

```svelte
{#if active}
	<dialog
		class="monsan-loading-overlay"
		aria-label={displayMessage}
		aria-busy="true"
		tabindex="-1"
		oncancel={preventDismiss}
	>
		<div class="loading-card" role="status" aria-live="polite">...</div>
	</dialog>
{/if}
```

Wrappers:

- `dialog`: correto para overlay bloqueante nao cancelavel.
- `loading-card`: correto para cartao visual e status.
- `spinner-box`: aceitavel para conter animacao.

Problemas:

- `dialog` tem `aria-label` e filho `role="status"` com texto; pode haver
  anuncio redundante.
- nao ha ID estavel para texto/status.
- `showModal()` e chamado quando ativo; bom.
- retorno de foco existe e e correto.
- Escape e impedido; correto para loading bloqueante.
- `previousActiveElement?.focus()` pode tentar focar elemento desmontado; baixo
  risco, mas pode ser protegido.

Proposta:

- manter `Loading` nao cancelavel.
- criar `messageId` e usar `aria-labelledby` ou `aria-describedby` de forma
  consistente.
- manter `role="status"` e `aria-live="polite"` em um unico ponto.
- proteger retorno de foco quando elemento anterior nao estiver mais conectado.
- manter visual e API.

### Toast

Arquivo: `src/lib/components/Toast.svelte`
Exportado: sim.

DOM atual:

```svelte
<div class="toast-item" {role} aria-live={ariaLive}>
	<div class="toast-icon">...</div>
	<p class="toast-message">{toast.message}</p>
	<button class="toast-action">...</button>
</div>
```

Wrappers:

- `toast-item`: necessario como item visual.
- `toast-icon`: correto.
- `toast-message`: correto.
- `toast-action`: correto como botao.

Problemas:

- `Toast` e `ToastViewport` podem anunciar ao mesmo tempo porque ambos recebem
  `aria-live`.
- role default `alert` com `aria-live="assertive"` e agressivo para todos os
  tipos, inclusive `success` e `info`.
- SVG inline de info poderia ser icon component em etapa futura; nao e bloqueio
  estrutural.
- acao nao fecha automaticamente; isso pode ser responsabilidade do consumidor,
  mas precisa estar documentado.

Proposta:

- preservar props `role` e `ariaLive` para compatibilidade.
- mudar default de `Toast` para item sem live region quando usado dentro do
  viewport, ou permitir `ToastViewport` passar um modo consistente.
- manter uso direto no Owlth funcionando com `role="status"` e `ariaLive="polite"`.
- nao mudar tempo de vida nesta fase.

### ToastViewport

Arquivo: `src/lib/components/ToastViewport.svelte`
Exportado: sim.

DOM atual:

```svelte
<section class="monsan-toast-viewport" aria-live={ariaLive} aria-atomic="false">
	{#each toasts as toast}
		<Toast {toast} {role} {ariaLive} />
	{/each}
</section>
```

Wrappers:

- `section`: aceitavel como regiao fixa de toasts, mas precisa de label/role ou
  pode virar `div` se nao for secao semantica.
- `Toast`: correto como item.

Problemas:

- live region duplicada com `Toast`.
- `section` sem label pode ser uma regiao sem nome se role for adicionado no
  futuro; hoje nao tem `role`.
- nao ha prop para `ariaLabel`.
- `position` so cobre `top-right` e `bottom-center`; isso e aceitavel no momento.
- z-index igual a `Dialog` (`1000`) pode competir com modais; toasts talvez
  devam ficar acima ou abaixo por contrato. Hoje `FlashOverlay` usa `9999`.

Proposta:

- centralizar `aria-live` no viewport.
- adicionar `role?: 'status' | 'alert' | 'log' | string` ou manter string atual
  com default menos agressivo.
- adicionar `ariaLabel` opcional para a regiao.
- passar para `Toast` um modo sem live region por padrao.
- revisar z-index usando `resolveLayer` apenas se ja houver layer preset adequado;
  caso contrario manter para evitar regressao visual.

### FlashOverlay

Arquivo: `src/lib/components/FlashOverlay.svelte`
Exportado: sim.

DOM atual:

```svelte
{#if active}
	<div class="monsan-flash-overlay tone-{tone}" aria-hidden="true"></div>
{/if}
```

Wrappers:

- unico `div` fixed e suficiente.

Problemas:

- `prefers-reduced-motion: reduce` remove a animacao, mas deixa opacidade fixa
  enquanto `active` permanecer true. Isso pode ser correto se o consumidor
  desativa rapido, mas e visualmente persistente se o estado travar.
- sem timeout interno; provavelmente correto, pois o estado e do consumidor.

Proposta:

- manter `aria-hidden`.
- manter sem foco e sem pointer events.
- em etapa de codigo, apenas revisar reduced motion para evitar flash persistente
  muito forte se `active` durar mais que o esperado.
- nao adicionar API nova agora.

### SplashScreen

Arquivo: `src/lib/components/SplashScreen.svelte`
Exportado: sim.

DOM atual:

```svelte
{#if !hidden}
	<div class="monsan-splash-screen" class:hiding>
		<div class="splash-content">...</div>
		<div class="splash-footer">...</div>
	</div>
{/if}
```

Wrappers:

- root fixed layer: necessario.
- `splash-content`: correto para animacao de conteudo.
- `splash-footer`: correto para creditos.
- `splash-brand`, `splash-loader`: corretos para visual default.

Problemas:

- nao ha `role="status"` ou `aria-live` para comunicar carregamento.
- como e SSR-visible, cobre tudo antes do mount; isso e intencional.
- nao prende foco, o que evita armadilha, mas tambem nao informa usuarios de
  leitor de tela que a aplicacao esta carregando.
- default `logoAlt = 'App Logo'` e string em ingles dentro da biblioteca; precisa
  continuar sobrescrevivel, mas idealmente nao ser user-facing hardcoded.
- `h1` dentro do splash pode competir com H1 real da pagina durante bootstrap,
  mas e removido apos carregamento.
- `letter-spacing: -0.02em` viola a regra visual atual de letter spacing 0; esta
  fase pode corrigir se aprovado, pois e componente do design system.

Proposta:

- adicionar semantica conservadora: `role="status"` e `aria-live="polite"` no
  conteudo ou root, sem tornar modal.
- manter SSR-visible e tempo minimo.
- ajustar `letter-spacing` para 0 se aprovado.
- manter API e comportamento de `loading`.
- preservar reduced motion.

## Ordem de implementacao proposta

### Commit 1 - Dialog base hardening

Arquivos:

- `src/lib/components/Dialog.svelte`
- possivelmente `src/lib/utils/dialogStack.ts` se aparecer bug real no stack.

Escopo:

- IDs por instancia para titulo/descricao.
- props `closeOnOutsideClick` e `closeOnEscape`.
- retorno de foco robusto.
- manter animacao e API atual.

Validacao obrigatoria:

- `pnpm test` no MonsanUI.
- depois da integracao, atenção especial aos modais de Examster e Manki.

### Commit 2 - Dialog wrappers

Arquivos:

- `src/lib/components/ConfirmDialog.svelte`
- `src/lib/components/MediaDialog.svelte`
- `src/lib/components/Loading.svelte`

Escopo:

- `ConfirmDialog` usa footer/actions do `Dialog`.
- `MediaDialog` conecta melhor erro/descricao quando aplicavel.
- `Loading` centraliza live/status e protege retorno de foco.

Validacao obrigatoria:

- `pnpm test` no MonsanUI.

### Commit 3 - Toast contract

Arquivos:

- `src/lib/components/Toast.svelte`
- `src/lib/components/ToastViewport.svelte`

Escopo:

- remover duplicacao de live region.
- preservar uso direto de `Toast` no Owlth.
- adicionar label/regiao opcional no viewport.
- manter API dos stores consumidores.

Validacao obrigatoria:

- `pnpm test` no MonsanUI.
- na integracao, conferir layouts globais de Examster/Manki/Frequence e uso
  direto do OwlthPortal.

### Commit 4 - Transient overlays

Arquivos:

- `src/lib/components/FlashOverlay.svelte`
- `src/lib/components/SplashScreen.svelte`

Escopo:

- manter `FlashOverlay` decorativo.
- hardening de reduced motion se necessario.
- `SplashScreen` com semantica de status conservadora.
- corrigir `letter-spacing` do titulo para 0, se aprovado.

Validacao obrigatoria:

- `pnpm test` no MonsanUI.

## Riscos e cuidados

- `Dialog` tem uso amplo em Examster e Manki; mudancas devem ser internas e
  conservadoras.
- `ConfirmDialog` pode alterar layout visual se mover acoes para footer; manter
  espacamento e largura dos botoes equivalentes.
- `Toast` e usado diretamente no Owlth; nao pode depender obrigatoriamente de
  `ToastViewport`.
- `Loading` e modal nao cancelavel; nao adicionar Escape ou outside click.
- `SplashScreen` aparece em todos os apps; qualquer mudanca de SSR/hidratacao
  pode gerar regressao perceptivel.

## Fora de escopo nesta fase

- tempo de vida dos toasts/stores de consumidor;
- novo sistema global de overlay manager;
- portal/teleport customizado para overlays;
- mudancas visuais grandes de dialog ou toast;
- reescrever `dialogStack` sem bug confirmado;
- alterar Fluxos de dados, Directus, SSO ou rotas dos consumidores.

## Decisoes solicitadas

Antes de implementar, confirmar:

- `Dialog`: aprovar props novas `closeOnOutsideClick` e `closeOnEscape` com
  default `true`.
- `ConfirmDialog`: aprovar mover acoes para o footer do `Dialog`, preservando o
  visual atual.
- `Toast`: aprovar centralizar `aria-live` no `ToastViewport`, mantendo suporte
  ao uso direto de `Toast` no Owlth.
- `SplashScreen`: aprovar adicionar `role="status"`/`aria-live="polite"` e
  corrigir `letter-spacing` para 0.
