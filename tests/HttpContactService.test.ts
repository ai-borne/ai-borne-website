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
    expect(result).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@ai-borne.in', message: 'Hello team, need assistance.' }),
    });
  });

  it('handles client-side validation for invalid email without calling fetch', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await service.sendMessage('invalid-email', 'Message body text');
    expect(result).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('handles HTTP error responses from serverless endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ success: false, error: 'Server validation error' }),
      })
    );

    const result = await service.sendMessage('user@domain.com', 'Valid message content');
    expect(result).toBe(false);
  });

  it('handles network fetch failures gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const result = await service.sendMessage('user@domain.com', 'Valid message content');
    expect(result).toBe(false);
  });
});
