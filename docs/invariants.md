# Invariants

How the SDK must behave, one rule per line, with the check that enforces it. Loosening a rule is a reviewed decision
of its own.

## Requests

- Every request sends the constructor's key as `X-API-Key` and `scrift-sdk/<VERSION>` as `User-Agent`
  (`tests/catalog.test.ts`: "sends the X-API-Key header on every request", "sends a User-Agent identifying the SDK").
- A key that `validateApiKey` refuses fails in the constructor, before any request (`tests/api-key.test.ts`;
  `tests/errors.test.ts`: "client construction").
- Every request has a timeout, 30 seconds unless `timeoutMs` says otherwise, and a timeout raises `APIError`
  (`tests/errors.test.ts`: "wraps AbortError as a timeout APIError"; the 30-second default checked in review).
- Only HTTP 429 is retried, exactly once, after `Retry-After` capped at 30 seconds; a second 429 raises
  `ScriftRateLimitError` ([decision](decisions/2026-04-12-single-retry-on-429.md); `tests/errors.test.ts`: "429 retry
  logic", "parseRetryAfter").
- Every non-2xx response raises a `ScriftError` subclass from `raiseForStatus`, the one place that maps a status to an
  error (`tests/errors.test.ts`: "error mapping by HTTP status"; the one place checked in review).
- A network failure raises `APIError` (`tests/errors.test.ts`: "network and timeout errors").
- A response keeps the API's field names: the SDK never renames or reshapes a payload (checked in review).

## Layers

- `src/resources/` imports only `http.ts` and `types.ts`, never calls `fetch` and never catches; `http.ts` imports only
  `errors.ts`, `types.ts`, `version.ts` and `api-key.ts`; `errors.ts` and `types.ts` import nothing from the SDK
  (`eslint.config.mjs`, `pnpm run lint`).
- `src/index.ts` only re-exports (checked in review).

## Package

- The package has no runtime dependencies, so it runs on edge runtimes (`tests/package.test.ts`).
- `VERSION` in `src/version.ts` equals the version in `package.json` (`tests/package.test.ts`).
- A breaking change to a method signature, an error class or a response type ships only in a major version (checked in
  review).
