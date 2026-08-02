export type ThemeMode = 'dark' | 'light' | 'system';

export interface IThemeService {
  getSavedTheme(): ThemeMode;
  saveTheme(theme: ThemeMode): void;
  getSystemPreference(): 'dark' | 'light';
  applyThemeToDOM(theme: ThemeMode): 'dark' | 'light';
}

export class ThemeService implements IThemeService {
  private readonly STORAGE_KEY = 'aiborne_theme_preference';

  public getSavedTheme(): ThemeMode {
    if (typeof localStorage === 'undefined') return 'system';
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    return saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'system';
  }

  public saveTheme(theme: ThemeMode): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  public getSystemPreference(): 'dark' | 'light' {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  public applyThemeToDOM(theme: ThemeMode): 'dark' | 'light' {
    const activeTheme = theme === 'system' ? this.getSystemPreference() : theme;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', activeTheme);
    }
    return activeTheme;
  }
}
