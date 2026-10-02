import { StringResources } from '../store/StringResources';

export class HeaderComponent {
  public static render(activeRoute: string): string {
    const strings = StringResources.getStrings();
    return `
      <header class="header">
        <div class="container header-nav">
          <a href="/" class="logo">
            <img src="/assets/logo-dark.png" alt="${strings.footer.copyright}" class="logo-img logo-img-dark" />
            <img src="/assets/logo-light.png" alt="${strings.footer.copyright}" class="logo-img logo-img-light" />
          </a>

          <nav class="desktop-nav">
            <ul class="nav-links">
              <li><a href="/" class="nav-link ${activeRoute === 'home' ? 'active' : ''}">${strings.nav.home}</a></li>
              <li><a href="/apps/index.html" class="nav-link ${activeRoute === 'apps' ? 'active' : ''}">${strings.nav.apps}</a></li>
              <li><a href="/blog/index.html" class="nav-link ${activeRoute === 'blog' ? 'active' : ''}">${strings.nav.insights}</a></li>
              <li><a href="/support.html" class="nav-link ${activeRoute === 'support' ? 'active' : ''}">${strings.nav.support}</a></li>
            </ul>
            <button id="theme-toggle" class="btn theme-toggle-btn" aria-label="${strings.nav.themeToggleLabel}">
              <span id="theme-toggle-icon">🌙</span>
            </button>
          </nav>

          <div class="mobile-nav-controls">
            <button id="theme-toggle-mobile" class="btn theme-toggle-btn" aria-label="${strings.nav.themeToggleLabel}">
              <span id="theme-toggle-icon-mobile">🌙</span>
            </button>
            <button id="mobile-menu-toggle" class="mobile-menu-btn" aria-expanded="false" aria-label="${strings.nav.mobileMenuLabel}">
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
            </button>
          </div>
        </div>

        <div id="mobile-nav-drawer" class="mobile-drawer" aria-hidden="true">
          <ul class="mobile-nav-links">
            <li><a href="/" class="mobile-nav-link ${activeRoute === 'home' ? 'active' : ''}">${strings.nav.home}</a></li>
            <li><a href="/apps/index.html" class="mobile-nav-link ${activeRoute === 'apps' ? 'active' : ''}">${strings.nav.apps}</a></li>
            <li><a href="/blog/index.html" class="mobile-nav-link ${activeRoute === 'blog' ? 'active' : ''}">${strings.nav.insights}</a></li>
            <li><a href="/support.html" class="mobile-nav-link ${activeRoute === 'support' ? 'active' : ''}">${strings.nav.support}</a></li>
          </ul>
        </div>
      </header>
    `;
  }
}
