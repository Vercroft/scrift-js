/**
 * The supported Node lines are written in four places: package.json "engines", the CI matrix that
 * tests them, .nvmrc (the version that builds and publishes) and the README that promises them to
 * users. Nothing makes them move together, so this test fails when they disagree.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (file: string): string => readFileSync(path.join(ROOT, file), 'utf8');

function engineMinimum(): number {
  const engines = (JSON.parse(read('package.json')) as { engines: { node: string } }).engines.node;
  const match = /^>=(\d+)$/.exec(engines);
  expect(match, `package.json engines.node is "${engines}", not ">=<major>"`).not.toBeNull();
  return Number(match?.[1]);
}

function matrix(): number[] {
  const ci = parse(read('.github/workflows/ci.yml')) as {
    jobs: { node: { strategy: { matrix: { node: string[] } } } };
  };
  return ci.jobs.node.strategy.matrix.node.map(Number);
}

describe('supported Node versions', () => {
  it('CI tests from the engines minimum up', () => {
    expect(Math.min(...matrix())).toBe(engineMinimum());
  });

  it('builds and publishes on the newest line CI tests', () => {
    expect(Number(read('.nvmrc').trim())).toBe(Math.max(...matrix()));
  });

  it('the README lists exactly the lines CI tests', () => {
    const line = read('README.md')
      .split('\n')
      .find((l) => l.startsWith('- Node.js '));
    expect(line, 'README has no "- Node.js ..." line under "Works everywhere"').toBeDefined();
    const listed = (line?.match(/\b\d+\b/g) ?? []).map(Number);
    expect(listed).toEqual(matrix());
  });
});
