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

    // Check Permissions-Policy
    const permissionsPolicy = headerMap.get('permissions-policy') || '';
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=()');
    expect(permissionsPolicy).toContain('geolocation=()');

    // Check Content-Security-Policy
    const csp = headerMap.get('content-security-policy') || '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
});
