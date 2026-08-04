import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Security Headers Configuration (_headers)', () => {
  const headersFilePath = path.resolve(__dirname, '../public/_headers');

  it('public/_headers file exists in the public directory', () => {
    expect(fs.existsSync(headersFilePath)).toBe(true);
  });

  it('contains essential security response headers for all routes', () => {
    const content = fs.readFileSync(headersFilePath, 'utf-8');
    expect(content).toContain('/*');

    // Parse header lines under /*
    const lines = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && !line.startsWith('#'));

    const headerMap = new Map<string, string>();
    for (const line of lines) {
      if (line === '/*') continue;
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        headerMap.set(key, value);
      }
    }

    // Assert key HTTP security headers
    expect(headerMap.get('x-frame-options')).toBe('DENY');
    expect(headerMap.get('x-content-type-options')).toBe('nosniff');
    expect(headerMap.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(headerMap.get('strict-transport-security')).toContain('max-age=31536000');
    expect(headerMap.get('x-permitted-cross-domain-policies')).toBe('none');
    expect(headerMap.get('cross-origin-opener-policy')).toBe('same-origin-allow-popups');
    expect(headerMap.get('cross-origin-resource-policy')).toBe('same-origin');

    // Check Permissions-Policy
    const permissionsPolicy = headerMap.get('permissions-policy') || '';
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=()');
    expect(permissionsPolicy).toContain('geolocation=()');

    // Check Content-Security-Policy
    const csp = headerMap.get('content-security-policy') || '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("worker-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it('contains zero-trust anti-indexing headers for /admin/* route', () => {
    const content = fs.readFileSync(headersFilePath, 'utf-8');
    expect(content).toContain('/admin/*');
    expect(content).toContain('X-Robots-Tag: noindex, nofollow, noarchive');
    expect(content).toContain('Cache-Control: no-store, no-cache, must-revalidate');
  });

  it('contains no-cache headers for service worker /sw.js route', () => {
    const content = fs.readFileSync(headersFilePath, 'utf-8');
    expect(content).toContain('/sw.js');
    const swSection = content.substring(content.indexOf('/sw.js'));
    expect(swSection).toContain('Cache-Control: no-cache, no-store, must-revalidate');
  });

  it('verifies presence and content of public/.well-known/security.txt', () => {
    const secTxtPath = path.resolve(__dirname, '../public/.well-known/security.txt');
    expect(fs.existsSync(secTxtPath)).toBe(true);

    const content = fs.readFileSync(secTxtPath, 'utf-8');
    expect(content).toContain('Contact: mailto:support@ai-borne.in');
    expect(content).toContain('Canonical: https://ai-borne.in/.well-known/security.txt');
  });
});
