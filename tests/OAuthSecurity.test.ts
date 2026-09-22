import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestGet as authOnRequestGet, authRateLimiter } from '../functions/api/auth';
import { onRequestGet as callbackOnRequestGet, callbackRateLimiter } from '../functions/api/callback';

describe('OAuth API Security & CSRF Hardening', () => {
  beforeEach(() => {
    authRateLimiter.clear();
    callbackRateLimiter.clear();
    vi.restoreAllMocks();
  });

  it('auth endpoint generates redirect with state parameter, sets HttpOnly cookie, and applies secure API headers', async () => {
    const mockContext: any = {
      request: new Request('https://ai-borne.in/api/auth'),
      env: { GITHUB_CLIENT_ID: 'test_client_id' },
    };

    const response = await authOnRequestGet(mockContext);
    expect(response.status).toBe(302);

    const location = response.headers.get('Location') || '';
    expect(location).toContain('https://github.com/login/oauth/authorize');
    expect(location).toContain('client_id=test_client_id');
    expect(location).toContain('state=');

    const stateMatch = location.match(/state=([a-f0-9-]+)/i);
    expect(stateMatch).not.toBeNull();
    const stateVal = stateMatch![1];

    const setCookie = response.headers.get('Set-Cookie') || '';
    expect(setCookie).toContain(`oauth_state=${stateVal}`);
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');

    // Secure API headers verification
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
  });

  it('auth endpoint enforces sliding-window rate limit (10 req/5 min/IP)', async () => {
    const ip = '203.0.113.50';
    const mockContext: any = {
      request: new Request('https://ai-borne.in/api/auth', {
        headers: { 'CF-Connecting-IP': ip },
      }),
      env: { GITHUB_CLIENT_ID: 'test_client_id' },
    };

    for (let i = 0; i < 10; i++) {
      const res = await authOnRequestGet(mockContext);
      expect(res.status).toBe(302);
    }

    const blockedRes = await authOnRequestGet(mockContext);
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get('Retry-After')).toBeDefined();
    expect(blockedRes.headers.get('Cache-Control')).toContain('no-store');
  });

  it('callback endpoint enforces sliding-window rate limit (10 req/5 min/IP)', async () => {
    const ip = '203.0.113.60';
    const mockContext: any = {
      request: new Request('https://ai-borne.in/api/callback', {
        headers: { 'CF-Connecting-IP': ip },
      }),
      env: { GITHUB_CLIENT_ID: 'test_client_id', GITHUB_CLIENT_SECRET: 'test_secret' },
    };

    for (let i = 0; i < 10; i++) {
      const res = await callbackOnRequestGet(mockContext);
      // Fails with 400 (missing code) but increments rate limiter
      expect(res.status).toBe(400);
    }

    const blockedRes = await callbackOnRequestGet(mockContext);
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get('Retry-After')).toBeDefined();
    expect(blockedRes.headers.get('Cache-Control')).toContain('no-store');
  });

  it('callback endpoint rejects request if state parameter or state cookie is missing (CSRF protection)', async () => {
    const mockContext: any = {
      request: new Request('https://ai-borne.in/api/callback?code=test_code'),
      env: { GITHUB_CLIENT_ID: 'test_client_id', GITHUB_CLIENT_SECRET: 'test_secret' },
    };

    const response = await callbackOnRequestGet(mockContext);
    expect(response.status).toBe(403);
    const text = await response.text();
    expect(text).toContain('CSRF check failed');
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });

  it('callback endpoint rejects request if state parameter does not match state cookie', async () => {
    const mockContext: any = {
      request: new Request('https://ai-borne.in/api/callback?code=test_code&state=attack_state', {
        headers: { Cookie: 'oauth_state=legit_state' },
      }),
      env: { GITHUB_CLIENT_ID: 'test_client_id', GITHUB_CLIENT_SECRET: 'test_secret' },
    };

    const response = await callbackOnRequestGet(mockContext);
    expect(response.status).toBe(403);
    const text = await response.text();
    expect(text).toContain('CSRF check failed');
  });

  it('callback endpoint accepts matching state token, enforces exact SHA-256 CSP hash without unsafe-inline', async () => {
    const validState = 'secure_state_12345';

    // Mock fetch for GitHub OAuth exchange
    const globalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'gho_mock_access_token<script>' }),
    } as Response);

    try {
      const mockContext: any = {
        request: new Request(`https://ai-borne.in/api/callback?code=valid_code&state=${validState}`, {
          headers: { Cookie: `oauth_state=${validState}` },
        }),
        env: { GITHUB_CLIENT_ID: 'test_client_id', GITHUB_CLIENT_SECRET: 'test_secret' },
      };

      const response = await callbackOnRequestGet(mockContext);
      expect(response.status).toBe(200);

      // Verify explicit security headers on HTML callback response
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('Cache-Control')).toContain('no-store');

      // Verify CSP eliminates unsafe-inline and enforces sha256 hash
      const csp = response.headers.get('Content-Security-Policy') || '';
      expect(csp).toContain("default-src 'none'");
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).toMatch(/script-src 'sha256-[A-Za-z0-9+/=]+'/);

      const html = await response.text();

      // Extract script content from HTML and verify the SHA-256 hash matches the CSP declaration exactly
      const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
      expect(scriptMatch).not.toBeNull();
      const scriptBody = scriptMatch![1];

      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(scriptBody));
      const hashBytes = new Uint8Array(digest);
      let binary = '';
      for (let i = 0; i < hashBytes.byteLength; i++) {
        binary += String.fromCharCode(hashBytes[i]);
      }
      const calculatedHash = btoa(binary);

      expect(csp).toContain(`script-src 'sha256-${calculatedHash}'`);

      // Verify origin restriction and lack of wildcard postMessage
      expect(html).not.toContain('window.opener.postMessage("authorizing:github", "*");');
      expect(html).toContain('https://ai-borne.in');
      expect(html).toContain('https://www.ai-borne.in');
      expect(html).toContain('isOriginAllowed(e.origin)');

      // Verify token is Unicode-escaped inside the JSON data block to prevent script injection breakout
      expect(html).toContain('\\u003cscript\\u003e');
      expect(html).not.toContain('<script>alert');

      // Verify null/closed window.opener guards are present
      expect(html).toContain('!window.opener || window.opener.closed');

      // Verify oauth_state cookie is cleared
      const setCookie = response.headers.get('Set-Cookie') || '';
      expect(setCookie).toContain('oauth_state=;');
      expect(setCookie).toContain('Max-Age=0');
    } finally {
      global.fetch = globalFetch;
    }
  });
});
