import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Security Headers Configuration (_headers)', () => {
  const rootDir = path.resolve(__dirname, '..');
  const headersFilePath = path.resolve(rootDir, 'public/_headers');

  function parseHeadersByRoute(content: string): Map<string, Map<string, string>> {
    const routeMap = new Map<string, Map<string, string>>();
    const lines = content.split('\n');
    let currentRoute: string | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('/')) {
        currentRoute = line;
        if (!routeMap.has(currentRoute)) {
          routeMap.set(currentRoute, new Map<string, string>());
        }
        continue;
      }

      if (currentRoute && line.includes(':')) {
        const colonIndex = line.indexOf(':');
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        routeMap.get(currentRoute)!.set(key, value);
      }
    }

    return routeMap;
  }

  it('public/_headers file exists in the public directory', () => {
    expect(fs.existsSync(headersFilePath)).toBe(true);
  });

  it('contains essential security response headers for all public routes under /*', () => {
    const content = fs.readFileSync(headersFilePath, 'utf-8');
    const routeMap = parseHeadersByRoute(content);
    const rootHeaders = routeMap.get('/*');

    expect(rootHeaders).toBeDefined();

    // Assert key HTTP security headers
    expect(rootHeaders!.get('x-frame-options')).toBe('DENY');
    expect(rootHeaders!.get('x-content-type-options')).toBe('nosniff');
    expect(rootHeaders!.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(rootHeaders!.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains; preload');
    expect(rootHeaders!.get('x-permitted-cross-domain-policies')).toBe('none');
    expect(rootHeaders!.get('cross-origin-opener-policy')).toBe('same-origin-allow-popups');
    expect(rootHeaders!.get('cross-origin-resource-policy')).toBe('same-origin');

    // Check Permissions-Policy
    const permissionsPolicy = rootHeaders!.get('permissions-policy') || '';
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=()');
    expect(permissionsPolicy).toContain('geolocation=()');
    expect(permissionsPolicy).toContain('payment=()');

    // Check Content-Security-Policy on root routes
    const csp = rootHeaders!.get('content-security-policy') || '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("worker-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");

    // Phase 2 Hardening: Verify 'unsafe-inline' is DROPPED from script-src
    expect(csp).toContain("script-src 'self' https://challenges.cloudflare.com");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");

    // Phase 2 Hardening: Verify Resend is removed from client connect-src
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain('https://api.resend.com');

    // Phase 2 Hardening: Cloudflare Turnstile frame-src
    expect(csp).toContain('frame-src https://challenges.cloudflare.com');

    // Phase 2 Hardening: Injection attack prevention directives
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('contains dedicated zero-trust and Decap CMS CSP headers for /admin/* route', () => {
    const content = fs.readFileSync(headersFilePath, 'utf-8');
    const routeMap = parseHeadersByRoute(content);
    const adminHeaders = routeMap.get('/admin/*');

    expect(adminHeaders).toBeDefined();
    expect(adminHeaders!.get('x-robots-tag')).toBe('noindex, nofollow, noarchive');
    expect(adminHeaders!.get('cache-control')).toBe('no-store, no-cache, must-revalidate');

    const adminCsp = adminHeaders!.get('content-security-policy') || '';
    expect(adminCsp).toContain("default-src 'self'");
    expect(adminCsp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://identity.netlify.com https://unpkg.com");
    expect(adminCsp).toContain("connect-src 'self' https://api.github.com https://identity.netlify.com");
    expect(adminCsp).toContain("frame-src 'self' https://identity.netlify.com");
    expect(adminCsp).toContain("base-uri 'self'");
  });

  it('contains no-cache headers for service worker /sw.js route', () => {
    const content = fs.readFileSync(headersFilePath, 'utf-8');
    const routeMap = parseHeadersByRoute(content);
    const swHeaders = routeMap.get('/sw.js');

    expect(swHeaders).toBeDefined();
    expect(swHeaders!.get('cache-control')).toBe('no-cache, no-store, must-revalidate');
  });

  it('verifies presence and content of public/.well-known/security.txt', () => {
    const secTxtPath = path.resolve(rootDir, 'public/.well-known/security.txt');
    expect(fs.existsSync(secTxtPath)).toBe(true);

    const content = fs.readFileSync(secTxtPath, 'utf-8');
    expect(content).toContain('Contact: mailto:founder@ai-borne.in');
    expect(content).toContain('Canonical: https://ai-borne.in/.well-known/security.txt');
  });

  it('verifies theme-bootstrap.js is externalized and eliminates inline scripts across all 14 HTML templates', () => {
    const bootstrapScriptPath = path.resolve(rootDir, 'public/assets/theme-bootstrap.js');
    expect(fs.existsSync(bootstrapScriptPath)).toBe(true);

    const scriptContent = fs.readFileSync(bootstrapScriptPath, 'utf-8');
    expect(scriptContent).toContain("localStorage.getItem('aiborne_theme_preference')");
    expect(scriptContent).toContain("setAttribute('data-theme', 'light')");

    const htmlFiles = [
      'index.html',
      'support.html',
      'terms.html',
      'privacy-policy.html',
      'data-deletion.html',
      'blog/index.html',
      'blog/post.html',
      'apps/index.html',
      'apps/defencewire.html',
      'apps/ssbmax.html',
      'apps/payslipmax.html',
      'apps/securemax.html',
      'apps/yoga-of-eating.html',
      'apps/action-station.html',
    ];

    for (const relPath of htmlFiles) {
      const filePath = path.resolve(rootDir, relPath);
      expect(fs.existsSync(filePath), `HTML file ${relPath} should exist`).toBe(true);

      const html = fs.readFileSync(filePath, 'utf-8');
      expect(html, `${relPath} should include theme-bootstrap.js`).toContain('<script src="/assets/theme-bootstrap.js"></script>');

      // Verify zero inline script tags without src
      const inlineScriptMatches = html.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi) || [];
      expect(inlineScriptMatches.length, `${relPath} should have zero inline script tags, found: ${inlineScriptMatches.join(', ')}`).toBe(0);
    }
  });
});
