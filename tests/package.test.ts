/**
 * Two promises no type or lint can see: the package installs nothing with it (README: "Zero runtime
 * dependencies"), and User-Agent names the version npm published.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { VERSION } from '../src/version.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as Record<
  string,
  unknown
>;

describe('package.json', () => {
  it.each(['dependencies', 'peerDependencies', 'optionalDependencies'])('has no %s', (field) => {
    expect(pkg).not.toHaveProperty(field);
  });

  it('has the version src/version.ts sends in User-Agent', () => {
    expect(pkg.version).toBe(VERSION);
  });
});
