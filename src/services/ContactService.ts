import { FormValidator } from './FormValidator';

export interface IContactResult {
  success: boolean;
  errorMessage?: string;
  isRateLimited?: boolean;
}

export interface IContactService {
  sendMessage(email: string, message: string): Promise<IContactResult>;
}

export class MockContactService implements IContactService {
  public async sendMessage(email: string, message: string): Promise<IContactResult> {
    const emailValid = FormValidator.validateEmail(email);
    if (!emailValid.valid) {
      return { success: false, errorMessage: emailValid.message };
    }
    const messageValid = FormValidator.validateMessage(message);
    if (!messageValid.valid) {
      return { success: false, errorMessage: messageValid.message };
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 300);
    });
  }
}

export class HttpContactService implements IContactService {
  private readonly endpoint: string;

  constructor(endpoint: string = '/api/contact') {
    this.endpoint = endpoint;
  }

  public async sendMessage(email: string, message: string): Promise<IContactResult> {
    const emailValid = FormValidator.validateEmail(email);
    if (!emailValid.valid) {
      return { success: false, errorMessage: emailValid.message };
    }
    const messageValid = FormValidator.validateMessage(message);
    if (!messageValid.valid) {
      return { success: false, errorMessage: messageValid.message };
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        return { success: true };
      }

      return {
        success: false,
        errorMessage: data.error || 'Failed to send support email. Please email support@ai-borne.in directly.',
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: 'Network connection issue. Please email support@ai-borne.in directly.',
      };
    }
  }
}
