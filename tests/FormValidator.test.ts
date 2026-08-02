import { describe, it, expect } from 'vitest';
import { FormValidator } from '../src/services/FormValidator';

describe('FormValidator (SRP)', () => {
  it('validates email correctly', () => {
    expect(FormValidator.validateEmail('support@actionstation.in').valid).toBe(true);
    expect(FormValidator.validateEmail('invalid-email').valid).toBe(false);
    expect(FormValidator.validateEmail('').valid).toBe(false);
  });

  it('validates message body non-emptiness', () => {
    expect(FormValidator.validateMessage('Hello support team').valid).toBe(true);
    expect(FormValidator.validateMessage('').valid).toBe(false);
    expect(FormValidator.validateMessage('   ').valid).toBe(false);
  });

  it('sanitizes input against XSS attacks', () => {
    const dangerousInput = "<script>alert('xss')</script>";
    const sanitized = FormValidator.sanitizeInput(dangerousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });
});
