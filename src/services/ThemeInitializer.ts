import { ThemeService } from './ThemeService';
import { ThemeViewModel } from '../viewmodels/ThemeViewModel';

export function initThemeEngine(): ThemeViewModel {
  const service = new ThemeService();
  const viewModel = new ThemeViewModel(service);

  if (typeof document !== 'undefined') {
    const toggleBtn = document.getElementById('theme-toggle');
    const iconEl = document.getElementById('theme-toggle-icon');

    const updateIcon = (): void => {
      if (iconEl) {
        iconEl.innerText = viewModel.getState().effectiveTheme === 'dark' ? '☀️' : '🌙';
      }
    };

    updateIcon();

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        viewModel.toggleTheme();
        updateIcon();
      });
    }
  }

  return viewModel;
}
