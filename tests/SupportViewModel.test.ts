import { describe, it, expect, beforeEach } from 'vitest';
import { SupportViewModel } from '../src/viewmodels/SupportViewModel';
import { MockContactService } from '../src/services/ContactService';

describe('SupportViewModel (MVVM)', () => {
  let viewModel: SupportViewModel;
  let mockService: MockContactService;

  beforeEach(() => {
    mockService = new MockContactService();
    viewModel = new SupportViewModel(mockService);
  });

  it('initializes with default state', () => {
    const state = viewModel.getState();
    expect(state.isSubmitting).toBe(false);
    expect(state.isSuccess).toBe(false);
    expect(state.errorMessage).toBeNull();
  });

  it('rejects invalid email on submit', async () => {
    await viewModel.submitForm('invalid', 'Valid message content');
    const state = viewModel.getState();
    expect(state.isSuccess).toBe(false);
    expect(state.errorMessage).toContain('Invalid email');
  });

  it('submits successfully with valid input', async () => {
    await viewModel.submitForm('user@example.com', 'Help with PayslipMax');
    const state = viewModel.getState();
    expect(state.isSuccess).toBe(true);
    expect(state.errorMessage).toBeNull();
  });
});
