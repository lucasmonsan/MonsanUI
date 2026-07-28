# MonsanUI Release And Deployment

MonsanUI is the suite component package and visual language source. It is not a
search-discoverable product service and normally has no production runtime like
Koalify, Manki or Owlth.

## Runtime

- Package manager: `pnpm@11.17.0`
- Local dev origin: Vite dev server at `http://localhost:5180` when run
  standalone
- Production domain: none required for the package itself
- Build command: `pnpm install --frozen-lockfile && pnpm build:package`
- Validation command: `pnpm test`
- Node runtime: `>=22.12.0`

## Required Environment

MonsanUI should not require runtime secrets for package builds. If future
examples or docs need private values, they must be provided through local
environment configuration and kept out of commits.

## Consumer Release Rules

- Visual language changes start in MonsanUI.
- Run `pnpm test` before updating consumers.
- Consumers update with `pnpm update monsan-ui`.
- Commit consumer `pnpm-lock.yaml` changes when the package reference changes.
- Do not solve suite visual changes by locally restyling consumer apps.

## Post-Release Smoke Checks

- `pnpm test` passes.
- `pnpm build:package` produces the expected package output.
- `publint` passes through `pnpm test`.
- Affected consumers pass `pnpm test` after updating `monsan-ui`.
