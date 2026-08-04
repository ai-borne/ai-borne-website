import { describe, it, expect } from 'vitest';
import { SupportViewModel } from '../src/viewmodels/SupportViewModel';
import { MockContactService } from '../src/services/ContactService';

describe('SupportViewModel (MVVM & TDD)', () => {
  it('initializes with default clean state', () => {
    const viewModel = new SupportViewModel(new MockContactService());
    const state = viewModel.getState();
    expect(state.isSubmitting).toBe(false);
    expect(state.isSuccess).toBe(false);
    expect(state.errorMessage).toBeNull();
  });

  it('rejects invalid email address before sending', async () => {
    const viewModel = new SupportViewModel(new MockContactService());
    await viewModel.submitForm('invalid-email', 'Valid length support query');
    const state = viewModel.getState();
    expect(state.isSuccess).toBe(false);
    expect(state.errorMessage).toBe('Invalid email address format.');
  });

  it('rejects short support message with explicit error', async () => {
    const viewModel = new SupportViewModel(new MockContactService());
    await viewModel.submitForm('user@ai-borne.in', 'hi.');
    const state = viewModel.getState();
    expect(state.isSuccess).toBe(false);
    expect(state.errorMessage).toBe('Support message must be at least 5 characters long.');
  });

  it('submits valid form successfully', async () => {
    const viewModel = new SupportViewModel(new MockContactService());
    await viewModel.submitForm('user@ai-borne.in', 'Hello, I have an issue with PayslipMax.');
    const state = viewModel.getState();
    expect(state.isSuccess).toBe(true);
    expect(state.errorMessage).toBeNull();
  });

  it('stores submitted email and message in state on service failure', async () => {
    const failingService = {
      sendMessage: async () => ({
        success: false,
        errorMessage: 'Rate limit exceeded.',
        isRateLimited: true,
      }),
    };
    const viewModel = new SupportViewModel(failingService);
    await viewModel.submitForm('user@ai-borne.in', 'Hello, I have an issue with PayslipMax.');
    const state = viewModel.getState();
    expect(state.isSuccess).toBe(false);
    expect(state.isRateLimited).toBe(true);
    expect(state.submittedEmail).toBe('user@ai-borne.in');
    expect(state.submittedMessage).toBe('Hello, I have an issue with PayslipMax.');
  });

  it('passes optional turnstileToken to contact service on submitForm', async () => {
    let capturedToken: string | undefined;
    const mockService = {
      sendMessage: async (_email: string, _msg: string, token?: string) => {
        capturedToken = token;
        return { success: true };
      },
    };
    const viewModel = new SupportViewModel(mockService);
    await viewModel.submitForm('user@ai-borne.in', 'Hello team, assistance required.', 'ts_token_abc123');
    expect(capturedToken).toBe('ts_token_abc123');
  });
});
