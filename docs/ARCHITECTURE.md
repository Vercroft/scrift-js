# SDK Architecture

## Overview

`scrift-sdk` is a thin, strongly-typed HTTP client for `api.scrift.app`.
It follows the same pattern as widely used API SDKs such as Stripe's - a
public client class that owns a transport layer and exposes resources, each
of which is a flat collection of methods that delegate to the transport.

**Target runtimes:** Node.js 24 or later, browsers, Deno, Bun, Cloudflare Workers,
Vercel Edge, AWS Lambda. The SDK uses only web-standard `fetch` and
`AbortController`, so it has zero runtime dependencies, which is what lets
it run on edge runtimes.

## Layer structure

```
src/
├── index.ts             Public entry point (re-exports only)
├── client.ts            ScriftClient - attaches resources to one HttpClient
├── api-key.ts           API key format validation (constructor-time)
├── http.ts              HttpClient - auth, retry, timeout, error mapping
├── errors.ts            Error class hierarchy
├── types.ts             Types, models, and client-side validation helpers
├── version.ts           Version constant (baked into User-Agent)
└── resources/           One class per API area; raster.ts returns PNG/WebP bytes
```

## Dependency direction

Dependencies point inward only. There is exactly one chokepoint for network
I/O and exactly one chokepoint for error mapping.

```
client.ts
   │
   └──► resources/*.ts
            │
            └──► http.ts ──► errors.ts
                       ├──► types.ts
                       ├──► api-key.ts
                       └──► version.ts
```

The rules a change must keep, and the lint that enforces the layer rules:
[invariants.md](invariants.md).

## HTTP layer contract

`HttpClient` exposes three methods to resources:

```ts
requestJson<T>(options: RequestOptions): Promise<T & { rateLimit: ... }>
requestText(options: RequestOptions): Promise<string>
requestArrayBuffer(options: RequestOptions): Promise<ArrayBuffer>
```

JSON responses include `rateLimit` parsed from `X-RateLimit-*` headers; nested
`ServiceResponse` entries in batch/list/search inherit the parent rate limit.

Resources never touch anything else on `HttpClient`. All of the following
behaviors are provided transparently:

- **Authentication.** The `X-API-Key` header is injected on every
  request from the `apiKey` passed to the constructor (validated via
  `api-key.ts`).
- **User-Agent.** `scrift-sdk/{VERSION}` is sent on every request.
- **Timeout.** Every request is bound to an `AbortController` with a
  default timeout of 30s (configurable via `timeoutMs`).
- **Retry.** Exactly one retry on HTTP 429, respecting the `Retry-After`
  header (both delta-seconds and HTTP-date forms), capped at 30 seconds.
  No other status is ever retried: retrying another 4xx hides a bug, and
  retrying a 5xx can make an incident worse.
- **Error mapping.** Any non-2xx response is mapped to a subclass of
  `ScriftError` in `raiseForStatus`.

To add an endpoint or a resource, follow [add-an-endpoint.md](add-an-endpoint.md).
