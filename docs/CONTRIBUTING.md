# Contributing to `scrift-sdk`

The TypeScript SDK for the Scrift API, published to npm as `scrift-sdk`. How to report a bug, who may open pull
requests and how to report a vulnerability are the same for every Vercroft repository: see the organisation's
[contribution guide](https://github.com/Vercroft/.github/blob/main/CONTRIBUTING.md) and
[security policy](https://github.com/Vercroft/.github/blob/main/SECURITY.md). This page holds only what is specific
here.

## Commands

Node.js 24 or later; `.nvmrc` names the version CI builds and publishes with. Each row is what CI runs, in the job
named in the last column.

| To | Run | CI job |
|---|---|---|
| Install, with the git hook | `npm ci && pre-commit install` | Node 24, Node 26 (`npm ci`) |
| Lint | `npm run lint` | Node 24, Node 26 |
| Type check the SDK, then the SDK with the tests (`tsconfig.tests.json`) | `npm run typecheck` | Node 24, Node 26 |
| Run the full tests with the coverage floor of `vitest.config.ts` | `npm run test:coverage` | Node 24, Node 26 |
| Run one test file | `npm test -- tests/catalog.test.ts` | none |
| Build the ESM, CJS and type declarations into `dist/` | `npm run build` | Node 24, Node 26 |
| Check that every lint suppression names one rule, gives a reason and is listed in `.suppressions` ([allowed forms](https://github.com/Vercroft/engineering-practices/blob/main/docs/suppressions.md)) | `sh scripts/check-suppressions.sh` | Suppressions are listed |
| Find em and en dashes (use a hyphen, a colon or a new sentence; only the generated lockfile is exempt) | `git grep -nP '[\x{2013}\x{2014}]' -- . ':!package-lock.json'` | No em or en dashes |
| Audit the workflows (set up once: `VENV="${TMPDIR:-/tmp}/scrift-js-ci-venv"; python3 -m venv "$VENV"; "$VENV/bin/pip" install --require-hashes -r .github/requirements/zizmor.txt`) | `"$VENV/bin/zizmor" --offline .github/workflows` | zizmor |
| Check the links between the repository's own files | `lychee --offline --no-progress './**/*.md'` | Local links |
| Scan the staged changes for secrets with `.gitleaks.toml` (CI scans the full history) | `pre-commit run gitleaks` | Secret scan / Full history |

## Map

| Path | Holds |
|---|---|
| `src/` | The SDK; [ARCHITECTURE.md](./ARCHITECTURE.md) explains its layers |
| `tests/` | One suite per resource; `fixtures.ts` holds the fake `fetch`; `ci/` checks the workflows and the Node versions |
| `docs/` | [Invariants](./invariants.md), [adding an endpoint](./add-an-endpoint.md), the architecture and the changelog; `decisions/` holds why |
| `.github/workflows/` | CI with its Gate summary, the npm release, the secret scan, CodeQL, Scorecard and the link checks |
| `.github/requirements/` | The hash-pinned zizmor that CI installs |
| `.gitleaks.toml`, `.gitleaksignore`, `.pre-commit-config.yaml` | The secret and personal-data rules, the history findings that are not secrets, and the git hook |
| `scripts/check-suppressions.sh`, `.suppressions` | The suppression check and the listing it compares against |
| `tsconfig.tests.json` | Type-checks the tests too, so a stale `@ts-expect-error` fails |

## Boundaries

- Never edit generated files: `package-lock.json` (npm writes it), `dist/` and `coverage/` (the build and the tests
  write them).
- `npm ci` runs no package's install script, unlike npm's default (`ignore-scripts=true` in `.npmrc`); never turn it
  back on for one package.
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
