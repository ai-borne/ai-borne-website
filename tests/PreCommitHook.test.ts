import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Pre-Commit Hook Guardrails', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('verifies package.json contains pre-commit script', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts['pre-commit']).toBe('npm run build && npm test -- --run');
    expect(pkg.scripts['prepare']).toBe('husky');
  });

  it('verifies .husky/pre-commit script exists and calls npm run pre-commit', () => {
    const huskyHookPath = path.join(rootDir, '.husky', 'pre-commit');
    expect(fs.existsSync(huskyHookPath)).toBe(true);

    const content = fs.readFileSync(huskyHookPath, 'utf-8');
    expect(content).toContain('npm run pre-commit');
  });

  it('verifies .git/hooks/pre-commit script exists', () => {
    const gitHookPath = path.join(rootDir, '.git', 'hooks', 'pre-commit');
    expect(fs.existsSync(gitHookPath)).toBe(true);

    const content = fs.readFileSync(gitHookPath, 'utf-8');
    expect(content).toContain('npm run pre-commit');
  });
});
