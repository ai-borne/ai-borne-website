import { describe, it, expect } from 'vitest';
import { onRequestPost, onRequestOptions } from '../functions/api/contact';

describe('Contact API Security Integration Tests', () => {
  const createMockContext = (
    method: string,
    body: any,
    origin: string = 'https://ai-borne.in',
    contentType: string = 'application/json',
    contentLength?: number
  ) => {
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Origin': origin,
    };
    if (contentLength !== undefined) {
      headers['Content-Length'] = contentLength.toString();
    }

    const request = new Request('https://ai-borne.in/api/contact', {
      method,
      headers: new Headers(headers),
      body: method === 'POST' ? JSON.stringify(body) : null,
    });

    return {
      request,
      env: { RESEND_API_KEY: 'test_key' } as Record<string, string | undefined>,
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
  });

  it('rejects request when CF_TURNSTILE_SECRET_KEY is configured but token is missing', async () => {
    const ctx = createMockContext('POST', { email: 'user@example.com', message: 'Valid support message' });
    ctx.env.CF_TURNSTILE_SECRET_KEY = 'mock_secret';

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('Bot verification failed');
  });
});
