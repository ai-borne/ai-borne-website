import { describe, it, expect } from 'vitest';
import { FormValidator } from '../src/services/FormValidator';

describe('FormValidator (Services Layer)', () => {
  it('validates email correctly', () => {
    expect(FormValidator.validateEmail('support@ai-borne.in').valid).toBe(true);
    expect(FormValidator.validateEmail('invalid-email').valid).toBe(false);
    expect(FormValidator.validateEmail('').valid).toBe(false);
  });

  it('validates message body length correctly', () => {
    expect(FormValidator.validateMessage('Hello team, need assistance.').valid).toBe(true);
    expect(FormValidator.validateMessage('hi.').valid).toBe(false);
    expect(FormValidator.validateMessage('hi.').message).toBe('Support message must be at least 5 characters long.');
    expect(FormValidator.validateMessage('   ').valid).toBe(false);
  });

  it('sanitizes input text against XSS injections', () => {
    const raw = '<script>alert("xss")</script>';
    const sanitized = FormValidator.sanitizeInput(raw);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
});
