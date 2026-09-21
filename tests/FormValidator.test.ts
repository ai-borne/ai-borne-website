import { describe, it, expect } from 'vitest';
import { FormValidator } from '../src/services/FormValidator';

describe('FormValidator (Services Layer)', () => {
  it('validates email correctly', () => {
    expect(FormValidator.validateEmail('founder@ai-borne.in').valid).toBe(true);
    expect(FormValidator.validateEmail('invalid-email').valid).toBe(false);
    expect(FormValidator.validateEmail('').valid).toBe(false);

    // Boundary check
    const longEmail = 'a'.repeat(95) + '@example.com';
    expect(FormValidator.validateEmail(longEmail).valid).toBe(false);
    expect(FormValidator.validateEmail(longEmail).message).toContain('exceeds maximum length of 100 characters');
  });

  it('validates message body length correctly', () => {
    expect(FormValidator.validateMessage('Hello team, need assistance.').valid).toBe(true);
    expect(FormValidator.validateMessage('hi.').valid).toBe(false);
    expect(FormValidator.validateMessage('hi.').message).toBe('Support message must be at least 5 characters long.');
    expect(FormValidator.validateMessage('   ').valid).toBe(false);

    // Boundary check
    const longMsg = 'a'.repeat(3001);
    expect(FormValidator.validateMessage(longMsg).valid).toBe(false);
    expect(FormValidator.validateMessage(longMsg).message).toContain('exceeds maximum length of 3000 characters');
  });

  it('sanitizes input text against XSS injections', () => {
    const raw = '<script>alert("xss")</script>';
    const sanitized = FormValidator.sanitizeInput(raw);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
});
