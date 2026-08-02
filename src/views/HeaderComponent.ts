import { StringResources } from '../store/StringResources';

export class HeaderComponent {
  public static render(activeRoute: string): string {
    const strings = StringResources.getStrings();
    return `
      <header class="header">
        <div class="container header-nav">
          <a href="/" class="logo" style="display: flex; align-items: center; gap: 0.6rem;">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="AI-BORNE Logo">
              <path d="M16 3C9.37 3 4 7.48 4 13C4 13.8 4.7 14.5 5.5 14.5C6.3 14.5 7 13.8 7 13C7 9.13 11.03 6 16 6C20.97 6 25 9.13 25 13C25 13.8 25.7 14.5 26.5 14.5C27.3 14.5 28 13.8 28 13C28 7.48 22.63 3 16 3Z" fill="url(#airborne-grad)"/>
              <path d="M7 13L14 21M25 13L18 21M16 6V18" stroke="#06b6d4" stroke-width="2" stroke-linecap="round"/>
              <path d="M10 24L16 28L22 24" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="16" cy="21" r="3" fill="#06b6d4"/>
              <defs>
                <linearGradient id="airborne-grad" x1="4" y1="3" x2="28" y2="14.5" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#06b6d4"/>
                  <stop offset="1" stop-color="#6366f1"/>
                </linearGradient>
              </defs>
            </svg>
            <span style="font-weight: 800; letter-spacing: 0.05em; font-size: 1.25rem;">AI-<span class="logo-accent">BORNE</span></span>
          </a>

          <nav class="desktop-nav">
            <ul class="nav-links">
              <li><a href="/" class="nav-link ${activeRoute === 'home' ? 'active' : ''}">${strings.nav.home}</a></li>
              <li><a href="/apps/payslipmax.html" class="nav-link ${activeRoute === 'apps' ? 'active' : ''}">${strings.nav.apps}</a></li>
              <li><a href="/blog/index.html" class="nav-link ${activeRoute === 'blog' ? 'active' : ''}">${strings.nav.insights}</a></li>
              <li><a href="/support.html" class="nav-link ${activeRoute === 'support' ? 'active' : ''}">${strings.nav.support}</a></li>
            </ul>
            <button id="theme-toggle" class="btn theme-toggle-btn" aria-label="Toggle dark/light mode">
              <span id="theme-toggle-icon">🌙</span>
            </button>
          </nav>

          <div class="mobile-nav-controls">
            <button id="theme-toggle-mobile" class="btn theme-toggle-btn" aria-label="Toggle dark/light mode">
              <span id="theme-toggle-icon-mobile">🌙</span>
            </button>
            <button id="mobile-menu-toggle" class="mobile-menu-btn" aria-expanded="false" aria-label="Toggle navigation menu">
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
            </button>
          </div>
        </div>

        <div id="mobile-nav-drawer" class="mobile-drawer" aria-hidden="true">
          <ul class="mobile-nav-links">
            <li><a href="/" class="mobile-nav-link ${activeRoute === 'home' ? 'active' : ''}">${strings.nav.home}</a></li>
            <li><a href="/apps/payslipmax.html" class="mobile-nav-link ${activeRoute === 'apps' ? 'active' : ''}">${strings.nav.apps}</a></li>
            <li><a href="/blog/index.html" class="mobile-nav-link ${activeRoute === 'blog' ? 'active' : ''}">${strings.nav.insights}</a></li>
            <li><a href="/support.html" class="mobile-nav-link ${activeRoute === 'support' ? 'active' : ''}">${strings.nav.support}</a></li>
          </ul>
        </div>
      </header>
    `;
  }
}
