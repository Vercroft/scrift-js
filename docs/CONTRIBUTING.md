# Contributing to `scrift-sdk`

How to report a bug, who may open pull requests and how to report a vulnerability are the same for
every Vercroft repository: see the organisation's
[contribution guide](https://github.com/Vercroft/.github/blob/main/CONTRIBUTING.md) and
[security policy](https://github.com/Vercroft/.github/blob/main/SECURITY.md). This page holds only
what is specific to this repository.

## Set up

- **Node.js 24 or later.** `.nvmrc` names the version CI builds and publishes with.
- **npm**, bundled with Node. CI installs with `npm ci` from `package-lock.json`.

```bash
git clone https://github.com/Vercroft/scrift-js.git
cd scrift-js
npm ci
pre-commit install   # the gitleaks hook, from .pre-commit-config.yaml
```

The SDK is a pure HTTP client: no secrets, services or database are needed to develop or test it.

## Commands

Each row is what CI runs, in the job named in the last column.

| To | Run | CI job |
|---|---|---|
| Lint | `npm run lint` | Node 24, Node 26 |
| Type check | `npm run typecheck` | Node 24, Node 26 |
| Run the tests with the coverage floor of `vitest.config.ts` | `npm run test:coverage` | Node 24, Node 26 |
| Run one test file | `npx vitest run tests/catalog.test.ts` | - |
| Build the ESM, CJS and type declarations into `dist/` | `npm run build` | Node 24, Node 26 |
| Audit the workflows (set up once: `VENV="${TMPDIR:-/tmp}/scrift-js-ci-venv"; python3 -m venv "$VENV"; "$VENV/bin/pip" install --require-hashes -r .github/requirements/zizmor.txt`) | `"$VENV/bin/zizmor" --offline .github/workflows` | zizmor |
| Check the links between the repository's own files | `lychee --offline --no-progress './**/*.md'` | Local links |
| Scan the staged changes for secrets with `.gitleaks.toml` (CI scans the full history) | `pre-commit run gitleaks` | Secret scan / Full history |

A pull request needs these checks: `Gate summary` (it passes only when every CI job passed or was
skipped), `Secret scan / Full history`, `Analyze (actions)`, `Analyze (javascript-typescript)` and
`Local links`.

Tests never make real network calls: `tests/fixtures.ts` has `createFetchStub`, a queue-backed fake
`fetch` passed through the `fetch` constructor option. `tests/ci/` checks the workflows and the
supported Node versions.

## Repository map

| Path | What it holds |
|---|---|
| `src/` | The SDK; [ARCHITECTURE.md](./ARCHITECTURE.md) explains the layers and how to add an endpoint or a resource |
| `tests/` | vitest suites, one per resource, and `tests/ci/` |
| `docs/` | Architecture, this guide, the changelog and `decisions/` |
| `.github/workflows/` | CI with its Gate summary, the npm release, the secret scan, CodeQL, Scorecard and the link checks |
| `.github/requirements/` | The hash-pinned CI tools (zizmor) |
| `.github/dependabot.yml` | Monthly grouped updates for the actions, the npm packages and the CI tools |
| `.gitleaks.toml`, `.gitleaksignore`, `.pre-commit-config.yaml` | The secret and personal-data rules, the history findings that are not secrets, and the git hook |
| `.nvmrc` | The Node version that builds and publishes |

`dist/` and `coverage/` are generated; never edit or commit them.
