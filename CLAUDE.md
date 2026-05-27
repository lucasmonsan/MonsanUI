# Project Rules

## Scope

Você possui acesso e permissão apenas para a pasta deste projeto.

Resolver apenas o problema solicitado.
Não expandir escopo.
Não realizar refactors paralelos sem autorização.
Não corrigir problemas fora do escopo sem aprovação explícita.

---

## Workflow

Antes de qualquer alteração:

1. Explicar o problema encontrado
2. Explicar a solução proposta
3. Informar arquivos afetados
4. Informar riscos e impactos
5. Aguardar aprovação explícita

Nenhuma modificação pode ocorrer antes da aprovação.

---

## Permissions

Nenhum comando pode ser executado sem autorização explícita.

Inclui:

- pnpm
- npm
- yarn
- bun
- git
- docker
- scripts shell
- testes
- build
- lint
- format
- migrations
- generators
- scaffolding

Formatters e linters nunca devem rodar automaticamente.

Nenhum arquivo ou pasta pode ser criado sem aprovação prévia.

Nunca:

- instalar dependências
- atualizar dependências
- remover dependências
- alterar configurações de ambiente
- alterar CI/CD
- alterar Docker
- alterar configs globais

sem aprovação explícita.

---

## Git Workflow

Cada nova etapa deve começar em uma nova branch.

Fluxo obrigatório:

1. Criar branch
2. Fazer commit inicial de checkpoint
3. Explicar plano
4. Aguardar aprovação

Nunca fazer merge.
Nunca fazer push.
Nunca reescrever histórico git.

---

## Stack

- Svelte 5
- TypeScript rigoroso
- Prettier
- ESLint

---

## Svelte Rules

Usar exclusivamente sintaxe Svelte 5.

Preferir:

- $state
- $derived
- $effect

Não usar:

- APIs legacy
- sintaxe deprecated
- padrões antigos sem necessidade

---

## TypeScript Rules

TypeScript rigoroso obrigatório.

Proibido:

- any
- @ts-ignore
- @ts-nocheck
- non-null assertion (!) sem justificativa
- type assertions inseguras

Preferir:

- tipagem explícita
- unions discriminadas
- inference segura
- tipos reutilizáveis
- readonly quando aplicável

---

## Code Style

Código sempre em inglês.

Comunicação sempre em PT-BR:

- direta
- curta
- objetiva

Nunca ocultar:

- erros
- warnings
- limitações
- riscos

---

## Editing Rules

Preferir alterações mínimas e localizadas.

Nunca:

- sobrescrever arquivos inteiros sem necessidade
- recriar arquivos existentes
- reorganizar imports sem necessidade
- alterar código fora do escopo
- mover arquivos sem aprovação
- renomear arquivos sem aprovação

Não modificar:

- formatação existente
- estilo existente
- arquitetura existente

sem necessidade real.

---

## Architecture

Não introduzir sem aprovação explícita:

- novas dependências
- novos padrões arquiteturais
- abstrações grandes
- wrappers
- services
- state managers
- event buses
- factories
- classes desnecessárias
- helpers genéricos prematuros

Preferir soluções simples.
Evitar overengineering.

---

## UI / UX

Não alterar:

- layout
- estilos
- espaçamentos
- animações
- comportamento visual
- acessibilidade
- fluxo de navegação

sem aprovação explícita.

Mudanças visuais devem ser descritas antes da implementação.

Nunca gerar:

- imagens
- vídeos
- ícones
- assets
- mídias

Solicitar que o usuário adicione manualmente.

---

## Transparency

Sempre informar:

- arquivos que serão alterados
- motivo da alteração
- impacto esperado
- possíveis riscos
- tradeoffs

Se houver ambiguidade:

- perguntar
- não assumir comportamento

---

## Testing

O usuário executa os testes.

Apenas requisitar comandos como:

- pnpm test
- pnpm lint
- pnpm check
- pnpm build

Nunca executar testes automaticamente.

---

## Error Handling

Não ignorar erros temporariamente.

Não adicionar:

- hacks
- workarounds frágeis
- silenciamentos
- suppressions

sem explicar claramente.

Correções devem atacar a causa raiz.

---

## Security

Nunca:

- expor secrets
- alterar autenticação
- alterar permissões
- adicionar telemetry
- adicionar analytics
- enviar dados externamente

sem aprovação explícita.

---

## Decision Making

Se existir dúvida:

- perguntar antes

Se existir múltiplas soluções:

- apresentar opções
- explicar tradeoffs
- aguardar decisão

Nunca assumir preferência arquitetural.
