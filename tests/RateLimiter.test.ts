import { describe, it, expect, beforeEach } from 'vitest';
import { SlidingWindowRateLimiter } from '../src/utils/RateLimiter';

describe('SlidingWindowRateLimiter Unit Tests', () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    limiter = new SlidingWindowRateLimiter(60000, 3); // 3 requests per 60 seconds
  });

  it('allows requests under the rate limit', () => {
    const r1 = limiter.isAllowed('192.168.1.1', 1000);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = limiter.isAllowed('192.168.1.1', 2000);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = limiter.isAllowed('192.168.1.1', 3000);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests exceeding maximum allowance within window', () => {
    limiter.isAllowed('10.0.0.1', 1000);
    limiter.isAllowed('10.0.0.1', 2000);
    limiter.isAllowed('10.0.0.1', 3000);

    const blocked = limiter.isAllowed('10.0.0.1', 4000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets allowance after sliding window expires', () => {
    limiter.isAllowed('10.0.0.1', 1000);
    limiter.isAllowed('10.0.0.1', 2000);
    limiter.isAllowed('10.0.0.1', 3000);

    // 61 seconds later
    const afterWindow = limiter.isAllowed('10.0.0.1', 65000);
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(2);
  });
});
