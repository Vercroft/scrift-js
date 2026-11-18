# Contributing to `scrift-sdk`

The TypeScript SDK for the Scrift API, published to npm as `scrift-sdk`. How to report a bug, who may open pull
requests and how to report a vulnerability are the same for every Vercroft repository: see the organisation's
[contribution guide](https://github.com/Vercroft/.github/blob/main/CONTRIBUTING.md) and
[security policy](https://github.com/Vercroft/.github/blob/main/SECURITY.md). This page holds only what is specific
here.

## Commands

Node.js 24 or later; `.nvmrc` names the version CI builds and publishes with. pnpm 12.19.0, the version
`packageManager` names; pnpm does not switch to it by itself here (`pmOnFail: ignore` in `pnpm-workspace.yaml`). Each
row is what CI runs, in the job named in the last column.

| To | Run | CI job |
|---|---|---|
| Install, with the git hook | `pnpm install --frozen-lockfile && pre-commit install` | Node 24, Node 26 (`pnpm install --frozen-lockfile`) |
| Lint | `pnpm run lint` | Node 24, Node 26 |
| Type check the SDK, then the SDK with the tests (`tsconfig.tests.json`) | `pnpm run typecheck` | Node 24, Node 26 |
| Run the full tests with the coverage floor of `vitest.config.ts` | `pnpm run test:coverage` | Node 24, Node 26 |
| Run one test file | `pnpm test tests/catalog.test.ts` | none |
| Build the ESM, CJS and type declarations into `dist/` | `pnpm run build` | Node 24, Node 26 |
| Run every small check, the hooks of `.pre-commit-config.yaml`: no em or en dashes, suppressions listed in `.suppressions` ([allowed forms](https://github.com/Vercroft/engineering-practices/blob/main/docs/suppressions.md)), zizmor (set up once: `VENV="${TMPDIR:-/tmp}/scrift-js-ci-venv"; python3 -m venv "$VENV"; "$VENV/bin/pip" install --require-hashes --only-binary :all: -r .github/requirements/pre-commit.txt -r .github/requirements/zizmor.txt`) | `PATH="$VENV/bin:$PATH" pre-commit run --all-files --hook-stage manual` | Repository checks |
| Check the links between the repository's own files | `lychee --offline --no-progress './**/*.md'` | Local links |
| Scan the staged changes for secrets with `.gitleaks.toml` (CI scans the full history) | `pre-commit run gitleaks` | Secret scan / Full history |

## Map

| Path | Holds |
|---|---|
| `src/` | The SDK; [ARCHITECTURE.md](./ARCHITECTURE.md) explains its layers |
| `tests/` | One suite per resource; `fixtures.ts` holds the fake `fetch`; `ci/` checks the workflows and the Node versions |
| `docs/` | [Invariants](./invariants.md), [adding an endpoint](./add-an-endpoint.md), the architecture and the changelog; `decisions/` holds why |
| `.github/workflows/` | CI with its Gate summary, the npm release, the secret scan, CodeQL, Scorecard and the link checks |
| `.github/requirements/` | The hash-pinned pre-commit and zizmor that CI installs |
| `.gitleaks.toml`, `.gitleaksignore`, `.pre-commit-config.yaml` | The secret and personal-data rules, the history findings that are not secrets, and the git hook |
| `scripts/check-suppressions.sh`, `.suppressions` | The suppression check and the listing it compares against |
| `tsconfig.tests.json` | Type-checks the tests too, so a stale `@ts-expect-error` fails |

## Boundaries

- Never edit generated files: `pnpm-lock.yaml` (pnpm writes it), `dist/` and `coverage/` (the build and the tests
  write them).
- Install scripts run only for packages that `allowBuilds` in `pnpm-workspace.yaml` sets to `true`; an unlisted one
  fails the install (`strictDepBuilds`). Never allow one without a reason on its line.
- Never call the real API in a test: pass `createFetchStub` from `tests/fixtures.ts` as the `fetch` option.
- Never put a real API key in a test: use `scrf_testkey123456`, the one placeholder `.gitleaks.toml` allows.
- Never edit `scripts/check-suppressions.sh`: it is the organisation's script from
  [suppressions](https://github.com/Vercroft/engineering-practices/blob/main/docs/suppressions.md), replaced whole.
- Never break a rule in [invariants.md](./invariants.md); loosening one is a decision of its own.

## Done means

- Every command in the table passes, as CI runs it.
- New behaviour has a test that failed before the change.
- Every document the change makes wrong is updated or deleted in the same pull request; a change users notice adds a
  line to [CHANGELOG.md](./CHANGELOG.md).

## Commits and pull requests

Follow the standard's [section 6](https://github.com/Vercroft/engineering-practices/blob/main/STANDARD.md#6-git-pull-requests-and-merging).
