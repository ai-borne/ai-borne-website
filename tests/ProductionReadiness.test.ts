import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ARCHITECTURAL EXCEPTION: this suite inspects the cross-cutting production artifact and deployment boundary.

describe('Phase 6 production-readiness guardrails', () => {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');

  function read(relativePath: string): string {
    return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
  }

  function filesUnder(directory: string): string[] {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(fullPath) : [fullPath];
    });
  }

  it('keeps Pages configuration secret-free and explicitly disables production source maps', () => {
    const wrangler = read('wrangler.jsonc');
    const vite = read('vite.config.ts');

    expect(wrangler).toContain('"pages_build_output_dir": "./dist"');
    expect(wrangler).not.toMatch(/"(?:[A-Z0-9_]*(?:SECRET|TOKEN|KEY|PASSWORD)[A-Z0-9_]*)"\s*:/);
    expect(vite).toContain('sourcemap: false');
    expect(vite).toContain("globIgnores: ['admin/**']");
  });

  it('keeps the production deployment serialized, artifact-based, and protected by the quality gate', () => {
    const ci = read('.github/workflows/ci.yml');
    const packageJson = read('package.json');

    expect(ci).toContain('needs: validate-and-build');
    expect(ci).toContain("github.event_name == 'push' && github.ref == 'refs/heads/main'");
    expect(ci).toContain('environment: production');
    expect(ci).toContain('cloudflare-pages-production');
    expect(ci).toContain('include-hidden-files: true');
    expect(ci).toContain('npm run test:production');
    expect(ci).toContain('npx --no-install wrangler pages deploy dist --project-name=ai-borne');
    expect(ci).not.toContain('--commit-dirty=true');
    expect(packageJson).toContain('"test": "vitest --exclude tests/ProductionReadiness.test.ts"');
    expect(packageJson).toContain('"test:production": "vitest run tests/ProductionReadiness.test.ts"');
  });

  it('rejects secret-bearing environment files and generated sensitive artifacts', () => {
    const trackedTextFiles = filesUnder(rootDir).filter((filePath) => {
      const relative = path.relative(rootDir, filePath);
      return !relative.startsWith('node_modules/') && !relative.startsWith('dist/') && !relative.startsWith('.git/');
    });
    const sensitiveFilename = /(?:^|\/)(?:\.env(?:\..*)?|.*\.(?:pem|key|p12|pfx)|.*(?:secret|token)(?:\..*)?)$/i;
    const credential = /(?:-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*['"][^'"\s]{8,})/i;

    for (const filePath of trackedTextFiles) {
      const relative = path.relative(rootDir, filePath);
      if (!sensitiveFilename.test(relative)) continue;
      expect(fs.readFileSync(filePath, 'utf-8'), `${relative} must not contain a committed credential`).not.toMatch(credential);
    }

    const forbiddenGeneratedFiles = filesUnder(distDir).filter((filePath) =>
      /(?:\.map$|\.env(?:\..*)?$|\.(?:pem|key|p12|pfx)$|(?:secret|token|debug|trace)(?:\..*)?$)/i.test(path.basename(filePath)),
    );
    expect(forbiddenGeneratedFiles).toEqual([]);
  });

  it('publishes a production artifact without source maps, credentials, or server-only deployment identifiers', () => {
    expect(fs.existsSync(distDir), 'Run npm run build before production artifact verification').toBe(true);
    const artifactFiles = filesUnder(distDir);
    const inspectableFiles = artifactFiles.filter((filePath) => /\.(?:js|mjs|cjs|html|json|webmanifest|css)$/i.test(filePath));
    const forbiddenContent = [
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
      /(?:sk_live_|re_[A-Za-z0-9]{20,}|AIzaSy[A-Za-z0-9_-]{33})/,
      /(?:CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|GEMINI_API_KEY|TURNSTILE_SECRET_KEY|RESEND_API_KEY)/,
      /sourceMappingURL\s*=/i,
    ];

    expect(artifactFiles.some((filePath) => filePath.endsWith('.map'))).toBe(false);
    for (const filePath of inspectableFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const pattern of forbiddenContent) {
        expect(content, `${path.relative(rootDir, filePath)} exposes a sensitive production value`).not.toMatch(pattern);
      }
    }
  });

  it('ships secure static headers and prevents the service worker from caching admin or API navigation', () => {
    const headers = read('dist/_headers');
    const serviceWorker = read('dist/sw.js');

    expect(headers).toContain('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    expect(headers).toContain("Content-Security-Policy: default-src 'self'");
    expect(headers).toContain('/sw.js\n  Cache-Control: no-cache, no-store, must-revalidate');
    expect(serviceWorker).toContain('/^\\/(?:api|admin)(?:\\/|$)/');
    expect(serviceWorker).not.toContain('admin/index.html');
    expect(serviceWorker).not.toMatch(/url:"api\//);
  });

  it('documents verifiable TLS, rollback, monitoring, and privacy-safe incident handling', () => {
    const deployment = read('docs/deployment-security.md');
    const incidentResponse = read('docs/incident-response.md');

    expect(deployment).toContain('Full (strict)');
    expect(deployment).toContain('Always Use HTTPS');
    expect(deployment).toContain('protected GitHub Actions `production` environment');
    expect(deployment).toContain('source maps');
    expect(incidentResponse).toContain('rollback');
    expect(incidentResponse).toContain('release identifier');
    expect(incidentResponse).toContain('Do not collect');
  });
});
