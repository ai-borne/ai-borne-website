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
});
