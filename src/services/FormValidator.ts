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
    if (trimmed.length > 100) {
      return { valid: false, message: 'Email address exceeds maximum length of 100 characters.' };
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
      return { valid: false, message: 'Support message cannot be empty.' };
    }
    if (trimmed.length < 5) {
      return { valid: false, message: 'Support message must be at least 5 characters long.' };
    }
    if (trimmed.length > 3000) {
      return { valid: false, message: 'Support message exceeds maximum length of 3000 characters.' };
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
