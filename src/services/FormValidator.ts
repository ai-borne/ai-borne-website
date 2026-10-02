export interface IValidationResult {
  valid: boolean;
  message?: string;
}

export class FormValidator {
  public static validateEmail(email: string): IValidationResult {
    const trimmed = email.trim();
    if (!trimmed) {
      return { valid: false, message: StringResources.getStrings().support.emailRequiredError };
    }
    if (trimmed.length > 100) {
      return { valid: false, message: StringResources.getStrings().support.emailTooLongError };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: StringResources.getStrings().support.invalidEmailFormatError };
    }
    return { valid: true };
  }

  public static validateMessage(message: string): IValidationResult {
    const trimmed = message.trim();
    if (!trimmed) {
      return { valid: false, message: StringResources.getStrings().support.emptyMessageError };
    }
    if (trimmed.length < 5) {
      return { valid: false, message: StringResources.getStrings().support.messageTooShortError };
    }
    if (trimmed.length > 3000) {
      return { valid: false, message: StringResources.getStrings().support.messageTooLongError };
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
import { StringResources } from '../store/StringResources';
