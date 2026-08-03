import { StringResources } from '../store/StringResources';

export class HeaderComponent {
  public static render(activeRoute: string): string {
    const strings = StringResources.getStrings();
    return `
      <header class="header">
        <div class="container header-nav">
          <a href="/" class="logo" style="display: flex; align-items: center; gap: 0.65rem; text-decoration: none;">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ai-borne Logo">
              <defs>
                <linearGradient id="aiborne-hdr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#0066FF" />
                  <stop offset="100%" stop-color="#0038B8" />
                </linearGradient>
              </defs>
              <path d="M 20 4 C 29 4 35 9 35 15 C 35 18 29 23 20 25 C 11 23 5 18 5 15 C 5 9 11 4 20 4 Z" stroke="url(#aiborne-hdr-grad)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="20" y1="4" x2="20" y2="25" stroke="url(#aiborne-hdr-grad)" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="20" y1="25" x2="5" y2="15" stroke="url(#aiborne-hdr-grad)" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="20" y1="25" x2="35" y2="15" stroke="url(#aiborne-hdr-grad)" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M 12 29.5 L 20 35 L 28 29.5" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span style="font-weight: 700; font-size: 1.35rem; letter-spacing: -0.02em; color: var(--color-text-primary);">ai-borne</span>
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
