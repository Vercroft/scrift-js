/**
 * SDK version, surfaced in the `User-Agent` header.
 *
 * This is intentionally a hand-maintained constant rather than a dynamic
 * read of package.json, so the value is baked into the bundle and works in
 * every runtime (browser, Deno, Cloudflare Workers, edge) without needing
 * JSON import assertions or filesystem access.
 *
 * `tests/package.test.ts` fails when it differs from `package.json`.
 */
export const VERSION = '0.2.0';
