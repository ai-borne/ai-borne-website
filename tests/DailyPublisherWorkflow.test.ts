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

  // Why: PRs and merges made with GITHUB_TOKEN start no push/pull_request runs, so the
  // required gate and the production deploy must be dispatched explicitly, in this order.
  it('merges only after dispatching and passing the CI gate, then deploys main', () => {
    const ci = fs.readFileSync(path.resolve(__dirname, '../.github/workflows/ci.yml'), 'utf-8');
    expect(ci).toMatch(/^\s*workflow_dispatch:/m);
    expect(ci).toContain("github.event_name == 'workflow_dispatch'");
    expect(workflow).toMatch(/^\s*actions:\s*write\s*$/m);
    const gate = workflow.indexOf('gh workflow run ci.yml --ref "${BRANCH}"');
    const watch = workflow.indexOf('gh run watch "${RUN_ID}" --exit-status');
    const merge = workflow.indexOf('gh pr merge "${BRANCH}"');
    const deploy = workflow.indexOf('gh workflow run ci.yml --ref main');
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(watch);
    expect(watch).toBeLessThan(merge);
    expect(merge).toBeLessThan(deploy);
  });
});
