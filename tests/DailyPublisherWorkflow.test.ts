import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Daily publisher workflow', () => {
  const workflow = fs.readFileSync(
    path.resolve(__dirname, '../.github/workflows/daily-insight-engine.yml'),
    'utf-8',
  );

  it('opens a reviewable branch pull request instead of pushing to main', () => {
    expect(workflow).toMatch(/^\s*contents:\s*write\s*$/m);
    expect(workflow).toMatch(/^\s*pull-requests:\s*write\s*$/m);
    expect(workflow).toContain('automation/daily-playbook-${TODAY}');
    expect(workflow).toContain('gh pr create');
    expect(workflow).not.toMatch(/git\s+push\s+origin\s+main\b/);
  });

  it('runs the complete quality gate before opening a pull request', () => {
    expect(workflow).toContain('npm run quality');
    expect(workflow).toContain('npm ci --ignore-scripts');
    expect(workflow).toContain('npx --no-install tsx');
  });

  // Why: the ruleset only accepts the gate from the PR's own pull_request run; merges by
  // GITHUB_TOKEN start no push run, so the production deploy must be dispatched explicitly.
  it('waits for the PR gate run before merging, then deploys main', () => {
    const ci = fs.readFileSync(path.resolve(__dirname, '../.github/workflows/ci.yml'), 'utf-8');
    expect(ci).toMatch(/^\s*workflow_dispatch:/m);
    expect(ci).toContain("github.event_name == 'workflow_dispatch'");
    expect(workflow).not.toContain('/approve');
    const find = workflow.indexOf('--event pull_request');
    const watch = workflow.indexOf('gh run watch "${RUN_ID}" --exit-status');
    const merge = workflow.indexOf('gh pr merge "${BRANCH}"');
    const deploy = workflow.indexOf('gh workflow run ci.yml --ref main');
    expect(find).toBeGreaterThan(-1);
    expect(find).toBeLessThan(watch);
    expect(watch).toBeLessThan(merge);
    expect(merge).toBeLessThan(deploy);
  });

  // Why: the main ruleset blocks merging commits that are not attributed to a GitHub account.
  it('commits as the attributed github-actions bot identity', () => {
    expect(workflow).toContain('41898282+github-actions[bot]@users.noreply.github.com');
    expect(workflow).not.toContain('action@github.com');
  });
});
