import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeViewModel } from '../src/viewmodels/ThemeViewModel';
import { IThemeService, ThemeMode } from '../src/services/ThemeService';

class MockThemeService implements IThemeService {
  private saved: ThemeMode = 'system';

  public getSavedTheme(): ThemeMode {
    return this.saved;
  }

  public saveTheme(theme: ThemeMode): void {
    this.saved = theme;
  }

  public getSystemPreference(): 'dark' | 'light' {
    return 'dark';
  }

  public applyThemeToDOM(theme: ThemeMode): 'dark' | 'light' {
    return theme === 'system' ? this.getSystemPreference() : theme;
  }
}

describe('ThemeViewModel (MVVM)', () => {
  let mockService: MockThemeService;
  let viewModel: ThemeViewModel;

  beforeEach(() => {
    mockService = new MockThemeService();
    viewModel = new ThemeViewModel(mockService);
  });

  it('initializes with system theme preference', () => {
    const state = viewModel.getState();
    expect(state.currentThemeMode).toBe('system');
    expect(state.effectiveTheme).toBe('dark');
  });

  it('switches to light theme', () => {
    viewModel.setThemeMode('light');
    const state = viewModel.getState();
    expect(state.currentThemeMode).toBe('light');
    expect(state.effectiveTheme).toBe('light');
    expect(mockService.getSavedTheme()).toBe('light');
  });

  it('toggles theme state between dark and light', () => {
    viewModel.setThemeMode('dark');
    expect(viewModel.getState().effectiveTheme).toBe('dark');

    viewModel.toggleTheme();
    expect(viewModel.getState().effectiveTheme).toBe('light');

    viewModel.toggleTheme();
    expect(viewModel.getState().effectiveTheme).toBe('dark');
  });
});
