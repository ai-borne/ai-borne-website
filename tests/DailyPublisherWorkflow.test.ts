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

  // Why: PRs opened with GITHUB_TOKEN do not trigger pull_request workflows, so the
  // required quality gate would never run and the daily PR could not be merged.
  it('opens the pull request with a least-privilege GitHub App token, pinned by SHA', () => {
    expect(workflow).toMatch(/actions\/create-github-app-token@[0-9a-f]{40}/);
    expect(workflow).toContain('permission-pull-requests: write');
    expect(workflow).toContain('permission-contents: read');
    expect(workflow).toContain('GH_TOKEN: ${{ steps.app-token.outputs.token }}');
    expect(workflow).not.toContain('GH_TOKEN: ${{ github.token }}');
  });
});
