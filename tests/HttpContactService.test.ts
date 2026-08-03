import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpContactService } from '../src/services/ContactService';

describe('HttpContactService (TDD)', () => {
  let service: HttpContactService;

  beforeEach(() => {
    service = new HttpContactService('/api/contact');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('submits valid message successfully via HTTP POST', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Success' }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await service.sendMessage('test@ai-borne.in', 'Hello team, need assistance.');
    expect(result.success).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@ai-borne.in', message: 'Hello team, need assistance.' }),
    });
  });

  it('handles client-side validation for short message without calling fetch', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await service.sendMessage('user@domain.com', 'hi.');
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('Support message must be at least 5 characters long.');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('passes through exact server error messages on HTTP 400 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ success: false, error: 'Support message must be at least 5 characters long.' }),
      })
    );

    const result = await service.sendMessage('user@domain.com', 'Valid length message content');
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('Support message must be at least 5 characters long.');
  });

  it('falls back to direct FormSubmit call if server endpoint fails or rate limits', async () => {
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Cloudflare Worker IP Rate Limit' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: 'true', message: 'The form was submitted successfully.' }),
      });

    vi.stubGlobal('fetch', fetchSpy);

    const result = await service.sendMessage('user@domain.com', 'Valid length message content');
    expect(result.success).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenLastCalledWith('https://formsubmit.co/ajax/support@ai-borne.in', expect.any(Object));
  });

  it('handles network fetch failures gracefully when both primary and fallback fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const result = await service.sendMessage('user@domain.com', 'Valid length message content');
    expect(result.success).toBe(false);
    expect(result.errorMessage).toContain('Network error');
    expect(result.isRateLimited).toBe(true);
  });
});
