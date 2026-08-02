import { ThemeService } from './ThemeService';
import { ThemeViewModel } from '../viewmodels/ThemeViewModel';

export function initThemeEngine(): ThemeViewModel {
  const service = new ThemeService();
  const viewModel = new ThemeViewModel(service);

  if (typeof document !== 'undefined') {
    setupThemeToggleButtons(viewModel);
    setupMobileDrawer();
  }

  return viewModel;
}

function setupThemeToggleButtons(viewModel: ThemeViewModel): void {
  const toggleBtnDesktop = document.getElementById('theme-toggle');
  const toggleBtnMobile = document.getElementById('theme-toggle-mobile');
  const iconDesktop = document.getElementById('theme-toggle-icon');
  const iconMobile = document.getElementById('theme-toggle-icon-mobile');

  const updateIcons = (): void => {
    const iconStr = viewModel.getState().effectiveTheme === 'dark' ? '☀️' : '🌙';
    if (iconDesktop) iconDesktop.innerText = iconStr;
    if (iconMobile) iconMobile.innerText = iconStr;
  };

  updateIcons();

  const handleToggle = (): void => {
    viewModel.toggleTheme();
    updateIcons();
  };

  if (toggleBtnDesktop) toggleBtnDesktop.addEventListener('click', handleToggle);
  if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', handleToggle);
}

function setupMobileDrawer(): void {
  const menuBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');

  if (!menuBtn || !drawer) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    } else {
      drawer.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
    }
  });
}
