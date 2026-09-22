import { SlidingWindowRateLimiter } from '../../../src/utils/RateLimiter';

export interface ContactValidationResult {
  valid: boolean;
  error?: string;
  sanitizedEmail?: string;
  sanitizedMessage?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

// 5 requests per 5 minutes per IP
export const contactRateLimiter = new SlidingWindowRateLimiter(5 * 60 * 1000, 5);

/**
 * Strips Carriage Return and Line Feed characters to prevent SMTP header injection.
 */
export function stripCrlf(input: string): string {
  return input.replace(/[\r\n]/g, '').trim();
}

/**
 * Validates contact form email and message against length, boundary, and format criteria.
 */
export function validateContactInput(rawEmail?: string, rawMessage?: string): ContactValidationResult {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }

  const cleanedEmail = stripCrlf(rawEmail);
  if (!cleanedEmail) {
    return { valid: false, error: 'Email address is required.' };
  }

  if (cleanedEmail.length > 100) {
    return { valid: false, error: 'Email address exceeds maximum length of 100 characters.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanedEmail)) {
    return { valid: false, error: 'Invalid email address format.' };
  }

  if (!rawMessage || typeof rawMessage !== 'string') {
    return { valid: false, error: 'Support message must be at least 5 characters long.' };
  }

  const trimmedMessage = rawMessage.trim();
  if (trimmedMessage.length < 5) {
    return { valid: false, error: 'Support message must be at least 5 characters long.' };
  }

  if (trimmedMessage.length > 3000) {
    return { valid: false, error: 'Support message exceeds maximum length of 3000 characters.' };
  }

  return {
    valid: true,
    sanitizedEmail: cleanedEmail,
    sanitizedMessage: trimmedMessage,
  };
}

/**
 * Determines whether an address is safe for automated confirmation emails.
 * Detects and suppresses auto-responders for mail loops, company addresses, and mailer daemons.
 */
export function isAutoResponderSafe(email: string): boolean {
  const normalized = email.toLowerCase().trim();

  // Suppress for company domain to avoid internal loops
  if (normalized.endsWith('@ai-borne.in')) {
    return false;
  }

  // Suppress for standard automated mailers, bounces, and loop addresses
  const blockedPrefixes = [
    'mailer-daemon@',
    'postmaster@',
    'noreply@',
    'no-reply@',
    'bounce@',
    'bounces@',
    'auto-reply@',
    'autoreply@',
  ];

  for (const prefix of blockedPrefixes) {
    if (normalized.startsWith(prefix)) {
      return false;
    }
  }

  return true;
}

/**
 * Detects whether an input string or object contains forbidden prototype pollution properties.
 */
export function hasPrototypePollution(input: unknown): boolean {
  if (!input) return false;

  if (typeof input === 'string') {
    return /"(?:__proto__|constructor|prototype)"\s*:/i.test(input);
  }

  if (typeof input === 'object') {
    const visited = new Set<unknown>();
    const stack: unknown[] = [input];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || typeof current !== 'object' || visited.has(current)) {
        continue;
      }
      visited.add(current);

      if (Array.isArray(current)) {
        for (const item of current) {
          if (item && typeof item === 'object') stack.push(item);
        }
      } else {
        const keys = Object.getOwnPropertyNames(current);
        for (const key of keys) {
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            return true;
          }
          const val = (current as Record<string, unknown>)[key];
          if (val && typeof val === 'object') {
            stack.push(val);
          }
        }
      }
    }
  }

  return false;
}

/**
 * Recursively strips prototype pollution vectors (__proto__, constructor, prototype) from an object.
 */
export function sanitizePrototypePollution<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizePrototypePollution) as unknown as T;
  }

  const clean: Record<string, any> = Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    clean[key] = sanitizePrototypePollution(value);
  }
  return clean as T;
}

/**
 * Encodes special HTML characters into safe entities to prevent injection in emails.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
