import { FormValidator } from '../services/FormValidator';
import { IContactService } from '../services/ContactService';
import { StringResources } from '../store/StringResources';

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

  public async submitForm(email: string, message: string, turnstileToken?: string): Promise<void> {
    const emailValidation = FormValidator.validateEmail(email);
    if (!emailValidation.valid) {
      this.state = { isSubmitting: false, isSuccess: false, errorMessage: emailValidation.message || StringResources.getStrings().support.invalidEmailError };
      return;
    }

    const messageValidation = FormValidator.validateMessage(message);
    if (!messageValidation.valid) {
      this.state = { isSubmitting: false, isSuccess: false, errorMessage: messageValidation.message || StringResources.getStrings().support.emptyMessageError };
      return;
    }

    this.state = { isSubmitting: true, isSuccess: false, errorMessage: null };
    const sanitizedMsg = FormValidator.sanitizeInput(message);
    const result = await this.contactService.sendMessage(email.trim(), sanitizedMsg, turnstileToken);

    if (result.success) {
      this.state = { isSubmitting: false, isSuccess: true, errorMessage: null };
    } else {
      this.state = {
        isSubmitting: false,
        isSuccess: false,
        errorMessage: result.errorMessage || StringResources.getStrings().support.genericMessageError,
        isRateLimited: result.isRateLimited ?? false,
        submittedEmail: email.trim(),
        submittedMessage: sanitizedMsg,
      };
    }
  }
}
