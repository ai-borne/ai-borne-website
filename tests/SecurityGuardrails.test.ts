import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Security Architecture & Codebase Audit Guardrails', () => {
  const rootDir = path.resolve(__dirname, '..');

  function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          getAllFiles(fullPath, arrayOfFiles);
        }
      } else {
        arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  }

  it('guardrail: strictly enforces < 300 LOC limit across all src/ and functions/ files', () => {
    const srcFiles = getAllFiles(path.join(rootDir, 'src')).filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js'));
    const fnFiles = getAllFiles(path.join(rootDir, 'functions')).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    const allCodeFiles = [...srcFiles, ...fnFiles];

    expect(allCodeFiles.length).toBeGreaterThan(0);

    for (const filePath of allCodeFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lineCount = content.split('\n').length;
      const relativePath = path.relative(rootDir, filePath);

      expect(lineCount, `File ${relativePath} exceeds 300 lines of code limit (${lineCount} lines)`).toBeLessThanOrEqual(300);
    }
  });

  it('guardrail: prevents wildcard Access-Control-Allow-Origin: * in functions/', () => {
    const fnFiles = getAllFiles(path.join(rootDir, 'functions')).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    for (const filePath of fnFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toContain("'Access-Control-Allow-Origin': '*'");
      expect(content).not.toContain('"Access-Control-Allow-Origin": "*"');
    }
  });

  it('guardrail: prevents hardcoded secrets or API key tokens in source code', () => {
    const srcFiles = getAllFiles(path.join(rootDir, 'src'));
    const fnFiles = getAllFiles(path.join(rootDir, 'functions'));
    const allFiles = [...srcFiles, ...fnFiles].filter(f => f.endsWith('.ts') || f.endsWith('.js'));

    const secretPatterns = [
      /re_[a-zA-Z0-9]{20,}/, // Resend key pattern
      /sk_live_[a-zA-Z0-9]{20,}/, // Stripe key pattern
      /AIzaSy[a-zA-Z0-9_-]{33}/, // Google API key pattern
    ];

    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const pattern of secretPatterns) {
        expect(pattern.test(content), `Potential secret match found in ${path.relative(rootDir, filePath)}`).toBe(false);
      }
    }
  });

  it('guardrail: verifies existence and configuration of .github/dependabot.yml', () => {
    const dependabotPath = path.resolve(rootDir, '.github/dependabot.yml');
    expect(fs.existsSync(dependabotPath)).toBe(true);

    const content = fs.readFileSync(dependabotPath, 'utf-8');
    expect(content).toContain('package-ecosystem: "npm"');
    expect(content).toContain('package-ecosystem: "github-actions"');
  });

  it('guardrail: verifies zero unescaped dynamic error or user-input interpolations in innerHTML across src/ts/', () => {
    const tsFiles = getAllFiles(path.join(rootDir, 'src', 'ts')).filter(f => f.endsWith('.ts'));
    expect(tsFiles.length).toBeGreaterThan(0);

    // Forbidden patterns where untrusted/runtime user input or dynamic error message is directly placed in innerHTML
    const dangerousPatterns = [
      /innerHTML\s*=\s*.*(?:\$\{[^}]*(?:errorMessage|error|err|value|input|params|searchParams)[^}]*\}).*/i,
      /alertEl\.innerHTML\s*=/,
      /formAlert\.innerHTML\s*=/,
      /\.innerHTML\s*=\s*['"`]<div class="alert-error">\$\{/
    ];

    for (const filePath of tsFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(rootDir, filePath);

      for (const pattern of dangerousPatterns) {
        expect(
          pattern.test(content),
          `Vulnerable unescaped dynamic innerHTML interpolation detected in ${relativePath}`
        ).toBe(false);
      }
    }
  });

  it('guardrail: ensures zero client bundle references to server-side email API endpoints (api.resend.com)', () => {
    const srcFiles = getAllFiles(path.join(rootDir, 'src')).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    expect(srcFiles.length).toBeGreaterThan(0);

    for (const filePath of srcFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(rootDir, filePath);

      expect(
        content.includes('api.resend.com'),
        `Client source file ${relativePath} must not reference server-side API endpoint 'api.resend.com'. Requests must proxy via /api/contact.`
      ).toBe(false);
    }
  });

  it('guardrail: verifies package.json dependency overrides and CI audit zero-tolerance', () => {
    const pkgPath = path.resolve(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.overrides).toBeDefined();
    expect(pkg.overrides['fast-uri']).toBeDefined();
    expect(pkg.overrides['nanoid']).toBeDefined();

    const ciPath = path.resolve(rootDir, '.github/workflows/ci.yml');
    const ciContent = fs.readFileSync(ciPath, 'utf-8');
    expect(ciContent).toContain('npm audit --audit-level=high');
    expect(ciContent).not.toContain('--omit=dev');
  });

  it('guardrail: verifies vite.config.ts uses ESM import.meta.dirname without legacy __dirname', () => {
    const viteConfigPath = path.resolve(rootDir, 'vite.config.ts');
    const content = fs.readFileSync(viteConfigPath, 'utf-8');
    expect(content).not.toContain('__dirname');
    expect(content).toContain('import.meta.dirname');
  });

  it('guardrail: enforces immutable 40-character commit SHAs on all GitHub Actions across workflows', () => {
    const workflowsDir = path.resolve(rootDir, '.github/workflows');
    const workflowFiles = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    expect(workflowFiles.length).toBeGreaterThan(0);

    const sha40Regex = /^[a-zA-Z0-9_\-./]+@[a-f0-9]{40}$/;

    for (const file of workflowFiles) {
      const content = fs.readFileSync(path.join(workflowsDir, file), 'utf-8');
      const lines = content.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('uses:')) {
          // Extract action reference before comments
          const actionRef = trimmed.replace(/^uses:\s*/, '').split('#')[0].trim();
          expect(
            sha40Regex.test(actionRef),
            `Action '${actionRef}' in ${file} must be pinned to an immutable 40-character commit SHA (SLSA L2/L3 & OpenSSF)`
          ).toBe(true);
        }
      }
    }
  });

  it('guardrail: enforces npm ci over npm install across all GitHub Actions workflows', () => {
    const workflowsDir = path.resolve(rootDir, '.github/workflows');
    const workflowFiles = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

    for (const file of workflowFiles) {
      const content = fs.readFileSync(path.join(workflowsDir, file), 'utf-8');
      expect(
        content,
        `Workflow ${file} must use 'npm ci' instead of 'npm install' for deterministic lockfile fidelity`
      ).not.toMatch(/run:\s*npm\s+install\b/);
      expect(content).toContain('npm ci');
    }
  });

  it('guardrail: verifies explicit least-privilege permissions in .github/workflows/ci.yml', () => {
    const ciPath = path.resolve(rootDir, '.github/workflows/ci.yml');
    const ciContent = fs.readFileSync(ciPath, 'utf-8');

    expect(ciContent).toMatch(/permissions:\s*\n\s*contents:\s*read/);
  });

  it('guardrail: verifies automated secret detection verification check in .github/workflows/ci.yml', () => {
    const ciPath = path.resolve(rootDir, '.github/workflows/ci.yml');
    const ciContent = fs.readFileSync(ciPath, 'utf-8');

    expect(ciContent).toContain('Verify Secret Detection Guardrails');
    expect(ciContent).toMatch(/npx vitest run tests\/SecurityGuardrails\.test\.ts/);
  });
});
