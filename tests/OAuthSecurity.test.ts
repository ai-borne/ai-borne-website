import { describe, it, expect, vi } from 'vitest';
import { onRequestGet as authOnRequestGet } from '../functions/api/auth';
import { onRequestGet as callbackOnRequestGet } from '../functions/api/callback';

describe('OAuth API Security & CSRF Hardening', () => {
  it('auth endpoint generates redirect with state parameter and sets HttpOnly cookie', async () => {
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

  it('callback endpoint accepts matching state token and renders script with target origin restriction', async () => {
    const validState = 'secure_state_12345';

    // Mock fetch for GitHub OAuth exchange
    const globalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'gho_mock_access_token' }),
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

      const html = await response.text();
      // Verify wildcard postMessage '*' is NOT present for initial handshake
      expect(html).not.toContain('window.opener.postMessage("authorizing:github", "*");');
      expect(html).toContain('https://ai-borne.in');

      // Verify oauth_state cookie is cleared
      const setCookie = response.headers.get('Set-Cookie') || '';
      expect(setCookie).toContain('oauth_state=;');
      expect(setCookie).toContain('Max-Age=0');
    } finally {
      global.fetch = globalFetch;
    }
  });
});
