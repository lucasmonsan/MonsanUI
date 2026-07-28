# MonsanUI consumer propagation

MonsanUI is consumed from its Git repository. Every consumer must pin an exact
MonsanUI commit in its `package.json` and `pnpm-lock.yaml`; deployment keeps
using `pnpm install --frozen-lockfile`.

After a merge to `main` that changes MonsanUI source or package metadata,
`.github/workflows/propagate-consumers.yml` creates one tested pull request for
each consumer. The workflow writes a dependency reference in this form:

```text
github:lucasmonsan/MonsanUI#<full-commit-sha>
```

It runs `pnpm install --lockfile-only`, allows only `package.json` and
`pnpm-lock.yaml` and `pnpm-workspace.yaml` to change, then runs a frozen
install and the consumer's complete `pnpm test`. The workspace allowlist pins
the MonsanUI Git revision permitted to execute `prepare`. It pushes a
`chore/update-monsan-ui-<short-sha>` branch and opens a pull request. Existing
open pull requests or remote branches with that name are never overwritten.
The automation token is removed from the environment before a consumer install
or test command runs. A prior MonsanUI revision discovered during the lockfile
rewrite is explicitly denied, never broadly trusted. The workspace file is
formatted before the consumer test runs. A short-lived GitHub Actions read
token fetches the private MonsanUI source while scripts are disabled; the
subsequent frozen install prefers that cached source while downloading missing
public packages without either token. The consumer test also runs without
either token.

## Required GitHub configuration

Create the `MONSAN_SUITE_AUTOMATION_TOKEN` secret in the MonsanUI repository.
Use a GitHub App installation token or a fine-grained personal access token
with repository access limited to Crocode, Koalify, Manki, Monsan, Owlth and
Rooster. It needs only `Contents: Read and write` and `Pull requests: Read and
write` for those consumers.

The workflow does not merge pull requests, publish packages or deploy an app.
Until the secret is configured, it completes successfully without propagating
changes. Configure the secret and use **Run workflow** to activate propagation.
