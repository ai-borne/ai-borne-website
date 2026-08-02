export interface IValidationResult {
  valid: boolean;
  message?: string;
}

export class FormValidator {
  public static validateEmail(email: string): IValidationResult {
    const trimmed = email.trim();
    if (!trimmed) {
      return { valid: false, message: 'Email address is required.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'Invalid email address format.' };
    }
    return { valid: true };
  }

  public static validateMessage(message: string): IValidationResult {
    const trimmed = message.trim();
    if (!trimmed) {
      return { valid: false, message: 'Message body cannot be empty.' };
    }
    return { valid: true };
  }

  public static sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}
