/**
 * `Gate summary` is the one CI check the ruleset requires, so it must judge every other CI job.
 *
 * A matrix job's check name carries its Node version (`Node 24`), so a required check named that
 * way breaks the day the matrix changes. One job that needs every other job, and fails unless each
 * passed or was skipped, keeps the required name stable. Three ways it could stop meaning anything,
 * and each has a test here: a job added to `ci.yml` but left out of `needs` runs with nothing
 * requiring it to pass, a verdict that accepts a failure lets every job fail behind a green check,
 * and an `if:` on another job skips that job, which the gate counts as passed.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CI = path.join(ROOT, '.github', 'workflows', 'ci.yml');
const GATE = 'gate-summary';
// The only job-level conditions, each with its reason. A job skipped by its own `if:` counts as passed.
const CONDITIONS: Record<string, string> = {
  [GATE]: 'always()', // the gate must report even when a job it needs failed
};

interface Step {
  run?: string;
  env?: Record<string, string>;
}

interface Job {
  name?: string;
  if?: string;
  needs?: string | string[];
  steps?: Step[];
}

function jobs(): Record<string, Job> {
  const parsed = parse(readFileSync(CI, 'utf8')) as { jobs: Record<string, Job> };
  expect(Object.keys(parsed.jobs).length, 'ci.yml parsed to one job or none; the shape changed').toBeGreaterThan(1);
  return parsed.jobs;
}

function gate(): Job {
  const all = jobs();
  expect(all, `ci.yml has no \`${GATE}\` job; the ruleset requires its check`).toHaveProperty(GATE);
  return all[GATE] as Job;
}

const scratch = mkdtempSync(path.join(tmpdir(), 'scrift-gate-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** Run the gate's own step, as CI does, on the given needs results. */
function verdict(results: Record<string, string>): number | null {
  const step = (gate().steps ?? []).find((s) => s.env !== undefined && 'NEEDS_JSON' in s.env);
  expect(step?.run, 'the gate has no step that reads NEEDS_JSON').toBeTypeOf('string');
  const script = path.join(scratch, 'gate.sh');
  writeFileSync(script, step?.run ?? '');
  const needs = Object.fromEntries(
    Object.entries(results).map(([job, result]) => [job, { result, outputs: {} }]),
  );
  return spawnSync('bash', [script], {
    env: { ...process.env, NEEDS_JSON: JSON.stringify(needs) },
    timeout: 30_000,
    stdio: 'ignore',
  }).status;
}

describe('Gate summary', () => {
  it('is named for the ruleset and always runs', () => {
    expect(gate().name).toBe('Gate summary');
    // Without always(), one failed job skips the gate, and a skipped required check is not a red one.
    expect(gate().if).toBe('always()');
  });

  it('needs every other job', () => {
    const raw = gate().needs ?? [];
    const needed = new Set(typeof raw === 'string' ? [raw] : raw);
    const missing = Object.keys(jobs()).filter((job) => job !== GATE && !needed.has(job));
    expect(missing, `\`${GATE}\` does not need these, so nothing requires them to pass`).toEqual([]);
  });

  it('has no job condition but the listed ones', () => {
    const found = Object.fromEntries(
      Object.entries(jobs()).flatMap(([id, job]) => (job.if === undefined ? [] : [[id, job.if]])),
    );
    expect(found, 'a job skipped by its own `if:` counts as passed; list a new condition here with its reason').toEqual(
      CONDITIONS,
    );
  });

  it.each(['failure', 'cancelled'])('fails when a job ended in %s', (bad) => {
    expect(verdict({ node: 'success', zizmor: bad })).not.toBe(0);
  });

  it('fails when it is given no jobs', () => {
    expect(verdict({})).not.toBe(0);
  });

  it('passes when every job passed or was skipped', () => {
    expect(verdict({ node: 'success', zizmor: 'skipped' })).toBe(0);
  });
});
