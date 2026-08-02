import { FormValidator } from './FormValidator';

export interface IContactService {
  sendMessage(email: string, message: string): Promise<boolean>;
}

export class MockContactService implements IContactService {
  public async sendMessage(email: string, message: string): Promise<boolean> {
    const emailValid = FormValidator.validateEmail(email);
    const messageValid = FormValidator.validateMessage(message);
    if (!emailValid.valid || !messageValid.valid) {
      return false;
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 300);
    });
  }
}

export class HttpContactService implements IContactService {
  private readonly endpoint: string;

  constructor(endpoint: string = '/api/contact') {
    this.endpoint = endpoint;
  }

  public async sendMessage(email: string, message: string): Promise<boolean> {
    const emailValid = FormValidator.validateEmail(email);
    const messageValid = FormValidator.validateMessage(message);
    if (!emailValid.valid || !messageValid.valid) {
      return false;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.success ?? true;
    } catch (error) {
      return false;
    }
  }
}
