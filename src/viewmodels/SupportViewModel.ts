import { FormValidator } from '../services/FormValidator';
import { IContactService } from '../services/ContactService';

export interface ISupportState {
  isSubmitting: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
}

export class SupportViewModel {
  private state: ISupportState = {
    isSubmitting: false,
    isSuccess: false,
    errorMessage: null,
  };

  constructor(private contactService: IContactService) {}

  public getState(): ISupportState {
    return { ...this.state };
  }

  public async submitForm(email: string, message: string): Promise<void> {
    const emailValidation = FormValidator.validateEmail(email);
    if (!emailValidation.valid) {
      this.state = { isSubmitting: false, isSuccess: false, errorMessage: emailValidation.message || 'Invalid email' };
      return;
    }

    const messageValidation = FormValidator.validateMessage(message);
    if (!messageValidation.valid) {
      this.state = { isSubmitting: false, isSuccess: false, errorMessage: messageValidation.message || 'Invalid message' };
      return;
    }

    this.state = { isSubmitting: true, isSuccess: false, errorMessage: null };
    const sanitizedMsg = FormValidator.sanitizeInput(message);
    const success = await this.contactService.sendMessage(email.trim(), sanitizedMsg);

    if (success) {
      this.state = { isSubmitting: false, isSuccess: true, errorMessage: null };
    } else {
      this.state = { isSubmitting: false, isSuccess: false, errorMessage: 'Failed to send message. Please try again.' };
    }
  }
}
