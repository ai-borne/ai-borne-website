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
    const srcCodeFiles = getAllFiles(path.join(rootDir, 'src')).filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js'));
    const fnCodeFiles = getAllFiles(path.join(rootDir, 'functions')).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    const allCodeFiles = [...srcCodeFiles, ...fnCodeFiles];

    expect(allCodeFiles.length).toBeGreaterThan(0);

    for (const filePath of allCodeFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lineCount = content.split('\n').length;
      const relativePath = path.relative(rootDir, filePath);

      expect(lineCount, `Code file ${relativePath} exceeds 300 lines of code limit (${lineCount} lines)`).toBeLessThanOrEqual(300);
    }

    // Guardrail: Any other file in src/ exceeding 300 LOC must document an SRP architectural exception
    const allSrcFiles = getAllFiles(path.join(rootDir, 'src'));
    for (const filePath of allSrcFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lineCount = content.split('\n').length;
      const relativePath = path.relative(rootDir, filePath);

      if (lineCount > 300) {
        expect(
          content.includes('ARCHITECTURAL EXCEPTION: Single Responsibility Principle (SRP)'),
          `File ${relativePath} exceeds 300 LOC limit (${lineCount} lines) without documented SRP exception header`
        ).toBe(true);
      }
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

  it('guardrail: validates that all API routes in functions/api enforce getSecureApiResponseHeaders', () => {
    const apiDir = path.join(rootDir, 'functions', 'api');
    const apiRouteFiles = fs.readdirSync(apiDir)
      .filter(f => (f.endsWith('.ts') || f.endsWith('.js')) && !f.startsWith('.'))
      .map(f => path.join(apiDir, f));

    expect(apiRouteFiles.length).toBeGreaterThanOrEqual(4);

    for (const filePath of apiRouteFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relPath = path.relative(rootDir, filePath);
      expect(
        content.includes('getSecureApiResponseHeaders'),
        `API route ${relPath} must import and enforce 'getSecureApiResponseHeaders'`
      ).toBe(true);
    }
  });

  it('guardrail: validates zero unencrypted http:// links across the repository', () => {
    const scanDirs = [
      path.join(rootDir, 'src'),
      path.join(rootDir, 'functions'),
      path.join(rootDir, 'public'),
      path.join(rootDir, 'content'),
    ];

    const allowedHttpLocalPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\S+)?$/;
    const allowedXmlSchemas = ['w3.org', 'sitemaps.org'];

    for (const dir of scanDirs) {
      const files = getAllFiles(dir).filter(f =>
        f.endsWith('.html') || f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.md')
      );

      for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relPath = path.relative(rootDir, filePath);
        const httpMatches = content.match(/http:\/\/[^\s"'`<>)]+/g) || [];

        for (const url of httpMatches) {
          if (allowedHttpLocalPattern.test(url)) continue;
          if (allowedXmlSchemas.some(schema => url.includes(schema))) continue;
          expect.fail(`Insecure HTTP URL found in ${relPath}: ${url}`);
        }
      }
    }
  });

  it('guardrail: validates that public/.well-known/security.txt references an existing PGP key file', () => {
    const securityTxtPath = path.resolve(rootDir, 'public/.well-known/security.txt');
    expect(fs.existsSync(securityTxtPath), 'public/.well-known/security.txt must exist').toBe(true);

    const content = fs.readFileSync(securityTxtPath, 'utf-8');
    const encryptionMatch = content.match(/^Encryption:\s*(?:https:\/\/ai-borne\.in)?(\/\.well-known\/[^\s]+)/m);
    expect(encryptionMatch, 'security.txt must contain an Encryption directive pointing to .well-known').not.toBeNull();

    const keyRelativePath = encryptionMatch![1].replace(/^\//, '');
    const pgpKeyPath = path.resolve(rootDir, 'public', keyRelativePath);
    expect(fs.existsSync(pgpKeyPath), `Referenced PGP key file must exist at ${pgpKeyPath}`).toBe(true);

    const pgpContent = fs.readFileSync(pgpKeyPath, 'utf-8');
    expect(pgpContent).toContain('-----BEGIN PGP PUBLIC KEY BLOCK-----');
    expect(pgpContent).toContain('-----END PGP PUBLIC KEY BLOCK-----');
  });

  it('guardrail: validates that CSP reporting endpoint exists and has sliding-window rate limiting configured', () => {
    const cspReportPath = path.resolve(rootDir, 'functions/api/csp-report.ts');
    expect(fs.existsSync(cspReportPath), 'functions/api/csp-report.ts must exist').toBe(true);

    const content = fs.readFileSync(cspReportPath, 'utf-8');
    expect(content).toContain('SlidingWindowRateLimiter');
    expect(content).toMatch(/cspReportRateLimiter\s*=\s*new\s+SlidingWindowRateLimiter\(\s*60\s*\*\s*1000\s*,\s*20\s*\)/);
    expect(content).toContain('reportData');
    expect(content).toContain('204');

    const headersPath = path.resolve(rootDir, 'public/_headers');
    const headersContent = fs.readFileSync(headersPath, 'utf-8');
    expect(headersContent).toContain('report-uri /api/csp-report;');
    expect(headersContent).toContain('report-to csp-endpoint;');
    expect(headersContent).toContain('Reporting-Endpoints: csp-endpoint="https://ai-borne.in/api/csp-report"');
  });
});
