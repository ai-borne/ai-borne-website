import { IThemeService, ThemeMode } from '../services/ThemeService';

export interface IThemeState {
  currentThemeMode: ThemeMode;
  effectiveTheme: 'dark' | 'light';
}

export class ThemeViewModel {
  private state: IThemeState;

  constructor(private themeService: IThemeService) {
    const saved = this.themeService.getSavedTheme();
    const effective = this.themeService.applyThemeToDOM(saved);
    this.state = {
      currentThemeMode: saved,
      effectiveTheme: effective,
    };
  }

  public getState(): IThemeState {
    return { ...this.state };
  }

  public setThemeMode(mode: ThemeMode): void {
    this.themeService.saveTheme(mode);
    const effective = this.themeService.applyThemeToDOM(mode);
    this.state = {
      currentThemeMode: mode,
      effectiveTheme: effective,
    };
  }

  public toggleTheme(): void {
    const nextMode: ThemeMode = this.state.effectiveTheme === 'dark' ? 'light' : 'dark';
    this.setThemeMode(nextMode);
  }
}
