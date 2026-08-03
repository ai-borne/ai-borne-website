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
  private readonly directFormSubmitUrl: string;

  constructor(
    endpoint: string = '/api/contact',
    directFormSubmitUrl: string = 'https://formsubmit.co/ajax/support@ai-borne.in'
  ) {
    this.endpoint = endpoint;
    this.directFormSubmitUrl = directFormSubmitUrl;
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

      if (response.ok && (data.success === true || data.success === 'true')) {
        return { success: true };
      }

      // If server endpoint fails or is rate-limited (e.g. Cloudflare Worker IP blocked),
      // fallback to direct client-side fetch from the user's browser:
      return await this.sendDirectFormSubmit(email, message, data.error);
    } catch (error) {
      return await this.sendDirectFormSubmit(email, message);
    }
  }

  private async sendDirectFormSubmit(email: string, message: string, serverError?: string): Promise<IContactResult> {
    try {
      const directResponse = await fetch(this.directFormSubmitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          message: message,
          _subject: `[AI-Borne Web Support] New message from ${email}`,
          _template: 'table',
        }),
      });

      const directData = await directResponse.json().catch(() => ({}));

      if (directResponse.ok && (directData.success === 'true' || directData.success === true)) {
        return { success: true };
      }

      const errMsg = directData.message || serverError || 'Failed to dispatch email. Please email support@ai-borne.in directly.';
      const isRateLimited =
        directResponse.status === 429 ||
        errMsg.toLowerCase().includes('rate limit') ||
        errMsg.toLowerCase().includes('activation');

      return {
        success: false,
        errorMessage: isRateLimited
          ? 'Automated email service rate-limited. Please use the button below to email support@ai-borne.in directly.'
          : errMsg,
        isRateLimited,
      };
    } catch (err) {
      return {
        success: false,
        errorMessage: 'Network error. Please check your internet connection or email support@ai-borne.in directly.',
        isRateLimited: true,
      };
    }
  }
}
