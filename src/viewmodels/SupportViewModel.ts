import { FormValidator } from '../services/FormValidator';
import { IContactService } from '../services/ContactService';

export interface ISupportState {
  isSubmitting: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  isRateLimited?: boolean;
  submittedEmail?: string;
  submittedMessage?: string;
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
      this.state = { isSubmitting: false, isSuccess: false, errorMessage: emailValidation.message || 'Invalid email address.' };
      return;
    }

    const messageValidation = FormValidator.validateMessage(message);
    if (!messageValidation.valid) {
      this.state = { isSubmitting: false, isSuccess: false, errorMessage: messageValidation.message || 'Support message is invalid.' };
      return;
    }

    this.state = { isSubmitting: true, isSuccess: false, errorMessage: null };
    const sanitizedMsg = FormValidator.sanitizeInput(message);
    const result = await this.contactService.sendMessage(email.trim(), sanitizedMsg);

    if (result.success) {
      this.state = { isSubmitting: false, isSuccess: true, errorMessage: null };
    } else {
      this.state = {
        isSubmitting: false,
        isSuccess: false,
        errorMessage: result.errorMessage || 'Failed to send message. Please try again.',
        isRateLimited: result.isRateLimited ?? false,
        submittedEmail: email.trim(),
        submittedMessage: sanitizedMsg,
      };
    }
  }
}
