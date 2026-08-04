export interface RateLimiterRecord {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private storage: Map<string, number[]>;

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.storage = new Map<string, number[]>();
  }

  isAllowed(ip: string, now: number = Date.now()): { allowed: boolean; remaining: number; resetMs: number } {
    const timestamps = (this.storage.get(ip) || []).filter(
      (time) => now - time < this.windowMs
    );

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const resetMs = this.windowMs - (now - oldest);
      return { allowed: false, remaining: 0, resetMs };
    }

    timestamps.push(now);
    this.storage.set(ip, timestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      resetMs: this.windowMs,
    };
  }

  clear(): void {
    this.storage.clear();
  }
}
