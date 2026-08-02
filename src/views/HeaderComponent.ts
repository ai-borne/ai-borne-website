export class HeaderComponent {
  public static render(activeRoute: string): string {
    return `
      <header class="header">
        <div class="container header-nav">
          <a href="/" class="logo">
            AI-<span class="logo-accent">Borne</span>
          </a>
          <nav>
            <ul class="nav-links">
              <li><a href="/" class="nav-link ${activeRoute === 'home' ? 'active' : ''}">Home</a></li>
              <li><a href="/apps/payslipmax.html" class="nav-link ${activeRoute === 'apps' ? 'active' : ''}">Apps</a></li>
              <li><a href="/blog/index.html" class="nav-link ${activeRoute === 'blog' ? 'active' : ''}">Insights</a></li>
              <li><a href="/support.html" class="nav-link ${activeRoute === 'support' ? 'active' : ''}">Support</a></li>
            </ul>
          </nav>
        </div>
      </header>
    `;
  }
}
