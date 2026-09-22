import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestPost, onRequestOptions } from '../functions/api/contact';
import {
  contactRateLimiter,
  stripCrlf,
  validateContactInput,
  isAutoResponderSafe,
  hasPrototypePollution,
  sanitizePrototypePollution,
} from '../functions/api/utils/contactSecurity';

describe('Contact API Security Integration Tests', () => {
  beforeEach(() => {
    contactRateLimiter.clear();
    vi.restoreAllMocks();
  });

  const createMockContext = (
    method: string,
    body: any,
    origin: string = 'https://ai-borne.in',
    contentType: string = 'application/json',
    contentLength?: number,
    ip: string = '203.0.113.10'
  ) => {
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Origin': origin,
      'CF-Connecting-IP': ip,
    };
    if (contentLength !== undefined) {
      headers['Content-Length'] = contentLength.toString();
    }

    const request = new Request('https://ai-borne.in/api/contact', {
      method,
      headers: new Headers(headers),
      body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : null,
    });

    return {
      request,
      env: { RESEND_API_KEY: 'test_key' } as Record<string, string | undefined>,
      waitUntil: vi.fn(),
    };
  };

  it('allows trusted origin (ai-borne.in) and sets specific Access-Control-Allow-Origin', async () => {
    const ctx = createMockContext('POST', { email: 'user@example.com', message: 'Hello AI-Borne' }, 'https://ai-borne.in');
    const response = await onRequestOptions(ctx);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://ai-borne.in');
  });

  it('allows www.ai-borne.in as trusted origin', async () => {
    const ctx = createMockContext('POST', { email: 'user@example.com', message: 'Hello AI-Borne' }, 'https://www.ai-borne.in');
    const response = await onRequestOptions(ctx);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://www.ai-borne.in');
  });

  it('rejects untrusted origin by not returning Access-Control-Allow-Origin header', async () => {
    const ctx = createMockContext('POST', { email: 'user@example.com', message: 'Hello AI-Borne' }, 'https://malicious-site.com');
    const response = await onRequestOptions(ctx);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('enforces enterprise zero-trust security headers on API responses', async () => {
    const ctx = createMockContext('POST', { email: 'user@example.com', message: 'Hello AI-Borne' }, 'https://ai-borne.in');
    const response = await onRequestOptions(ctx);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=31536000');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(response.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
    expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'none'; frame-ancestors 'none';");
  });

  it('rejects non-json content-type requests with 415 Unsupported Media Type', async () => {
    const ctx = createMockContext('POST', { email: 'user@example.com', message: 'Hello' }, 'https://ai-borne.in', 'text/plain');
    const response = await onRequestPost(ctx);
    expect(response.status).toBe(415);
    const data = await response.json();
    expect(data.error).toContain('Unsupported Content-Type');
  });

  it('rejects oversized payload (greater than 10KB) with 413 Payload Too Large', async () => {
    const hugeMessage = 'A'.repeat(11 * 1024);
    const ctx = createMockContext('POST', { email: 'user@example.com', message: hugeMessage }, 'https://ai-borne.in', 'application/json', 12 * 1024);
    const response = await onRequestPost(ctx);
    expect(response.status).toBe(413);
    const data = await response.json();
    expect(data.error).toContain('Payload exceeds maximum allowed limit');
  });

  it('rejects invalid email formats', async () => {
    const ctx = createMockContext('POST', { email: 'not-an-email', message: 'Valid length message' });
    const response = await onRequestPost(ctx);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid email address format.');

    const emptyCtx = createMockContext('POST', { email: '', message: 'Valid length message' });
    const emptyRes = await onRequestPost(emptyCtx);
    expect(emptyRes.status).toBe(400);
    const emptyData = await emptyRes.json();
    expect(emptyData.error).toBe('Email address is required.');
  });

  it('rejects request when CF_TURNSTILE_SECRET_KEY is configured but token is missing', async () => {
    const ctx = createMockContext('POST', { email: 'user@example.com', message: 'Valid support message' });
    ctx.env.CF_TURNSTILE_SECRET_KEY = 'mock_secret';

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('Bot verification failed');
  });

  it('enforces 429 Too Many Requests when burst limit (5 req/5 min) is exceeded', async () => {
    const ip = '198.51.100.77';
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_123' }),
    } as Response);

    try {
      for (let i = 0; i < 5; i++) {
        const ctx = createMockContext('POST', { email: `user${i}@example.com`, message: 'Test message here' }, 'https://ai-borne.in', 'application/json', undefined, ip);
        const res = await onRequestPost(ctx);
        expect(res.status).toBe(200);
      }

      const blockedCtx = createMockContext('POST', { email: 'burst@example.com', message: 'Test message here' }, 'https://ai-borne.in', 'application/json', undefined, ip);
      const blockedRes = await onRequestPost(blockedCtx);
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get('Retry-After')).not.toBeNull();

      const body = await blockedRes.json();
      expect(body.error).toContain('Too many requests');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('rejects prototype pollution payload with 400 Bad Request', async () => {
    const pollutedPayload = '{"email":"user@example.com","message":"Hello","__proto__":{"polluted":true}}';
    const ctx = createMockContext('POST', pollutedPayload);
    const res = await onRequestPost(ctx);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Prototype pollution attempt rejected');
  });

  it('sanitizePrototypePollution helper recursively strips pollution keys', () => {
    const pollutedObj = {
      email: 'safe@example.com',
      __proto__: { isAdmin: true },
      nested: {
        constructor: { evil: true },
        prototype: { hijacked: true },
        ok: 'value',
      },
    };

    expect(hasPrototypePollution(pollutedObj)).toBe(true);
    expect(hasPrototypePollution('{"__proto__": {}}')).toBe(true);
    expect(hasPrototypePollution({ clean: 'data' })).toBe(false);

    const sanitized = sanitizePrototypePollution(pollutedObj);
    expect(sanitized.email).toBe('safe@example.com');
    expect(sanitized.nested.ok).toBe('value');
    expect(Object.prototype.hasOwnProperty.call(sanitized, '__proto__')).toBe(false);
    expect((sanitized as any).isAdmin).toBeUndefined();
    expect((sanitized.nested as any).constructor?.evil).toBeUndefined();
    expect((sanitized.nested as any).prototype).toBeUndefined();
  });

  it('masks upstream third-party Resend error details and prevents information leakage', async () => {
    const originalFetch = global.fetch;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Restricted API Key key_sec_12345: domain not verified' }),
    } as Response);

    try {
      const ctx = createMockContext('POST', { email: 'user@example.com', message: 'Inquiry message' });
      const res = await onRequestPost(ctx);
      expect(res.status).toBe(500);

      const body = await res.json();
      // Leaked internal details must NOT be returned to user
      expect(body.error).not.toContain('key_sec_12345');
      expect(body.error).not.toContain('domain not verified');
      expect(body.error).toBe('Failed to deliver support email. Please email founder@ai-borne.in directly.');

      // But logged securely on the server
      expect(consoleSpy).toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
      consoleSpy.mockRestore();
    }
  });

  it('rejects oversized email (> 100 chars) with 400 Bad Request', async () => {
    const longEmail = 'a'.repeat(95) + '@example.com';
    const ctx = createMockContext('POST', { email: longEmail, message: 'Valid support inquiry' });
    const response = await onRequestPost(ctx);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('exceeds maximum length of 100 characters');
  });

  it('rejects oversized message (> 3000 chars) with 400 Bad Request', async () => {
    const longMsg = 'x'.repeat(3001);
    const ctx = createMockContext('POST', { email: 'user@example.com', message: longMsg });
    const response = await onRequestPost(ctx);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('exceeds maximum length of 3000 characters');
  });

  it('neutralizes CRLF injection characters from email inputs', () => {
    const maliciousEmail = 'attacker@example.com\r\nBcc: victim@target.com\r\nSubject: Injected';
    const cleaned = stripCrlf(maliciousEmail);
    expect(cleaned).not.toContain('\r');
    expect(cleaned).not.toContain('\n');
    expect(cleaned).toBe('attacker@example.comBcc: victim@target.comSubject: Injected');

    const validation = validateContactInput('valid@example.com\r\n', 'Hello world');
    expect(validation.valid).toBe(true);
    expect(validation.sanitizedEmail).toBe('valid@example.com');
  });

  it('safeguards auto-responder against email loops and internal bombing', async () => {
    expect(isAutoResponderSafe('founder@ai-borne.in')).toBe(false);
    expect(isAutoResponderSafe('support@ai-borne.in')).toBe(false);
    expect(isAutoResponderSafe('noreply@external.com')).toBe(false);
    expect(isAutoResponderSafe('no-reply@mailer.org')).toBe(false);
    expect(isAutoResponderSafe('mailer-daemon@relay.com')).toBe(false);
    expect(isAutoResponderSafe('legitimate.customer@gmail.com')).toBe(true);

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email_ok' }),
    } as Response);

    try {
      const ctx = createMockContext('POST', { email: 'founder@ai-borne.in', message: 'Self test loop' });
      await onRequestPost(ctx);
      expect(ctx.waitUntil).not.toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
    }
  });
});
