import { StringResources } from '../store/StringResources';

export class FooterComponent {
  public static render(): string {
    const strings = StringResources.getStrings();
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a href="/" class="logo mb-md" style="display: flex; align-items: center; gap: 0.6rem; text-decoration: none;">
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ai-borne Logo">
                  <defs>
                    <linearGradient id="aiborne-ftr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#0066FF" />
                      <stop offset="100%" stop-color="#0038B8" />
                    </linearGradient>
                  </defs>
                  <path d="M 20 4 C 29 4 35 9 35 15 C 35 18 29 23 20 25 C 11 23 5 18 5 15 C 5 9 11 4 20 4 Z" stroke="url(#aiborne-ftr-grad)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="20" y1="4" x2="20" y2="25" stroke="url(#aiborne-ftr-grad)" stroke-width="2.5" stroke-linecap="round"/>
                  <line x1="20" y1="25" x2="5" y2="15" stroke="url(#aiborne-ftr-grad)" stroke-width="2.5" stroke-linecap="round"/>
                  <line x1="20" y1="25" x2="35" y2="15" stroke="url(#aiborne-ftr-grad)" stroke-width="2.5" stroke-linecap="round"/>
                  <path d="M 12 29.5 L 20 35 L 28 29.5" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="font-weight: 700; font-size: 1.25rem; letter-spacing: -0.02em; color: var(--color-text-primary);">ai-borne</span>
              </a>
              <p class="text-muted">${strings.footer.tagline}</p>
            </div>
            <div>
              <h4 class="mb-md">${strings.footer.productsTitle}</h4>
              <a href="/apps/payslipmax.html" class="footer-link">PayslipMax</a>
            </div>
            <div>
              <h4 class="mb-md">${strings.footer.developerTitle}</h4>
              <a href="/blog/index.html" class="footer-link">Tech Hacks & Insights</a>
              <a href="https://github.com/sunilpawar-git" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
            </div>
            <div>
              <h4 class="mb-md">${strings.footer.legalTitle}</h4>
              <a href="/privacy-policy.html" class="footer-link">Privacy Policy</a>
              <a href="/terms.html" class="footer-link">Terms of Service</a>
              <a href="/support.html" class="footer-link">Support Center</a>
              <a href="/data-deletion.html" class="footer-link">Data & Account Deletion</a>
            </div>
          </div>
          <div class="text-center text-muted" style="border-top: 1px solid var(--color-border-glass); padding-top: var(--spacing-md);">
            <p>&copy; ${new Date().getFullYear()} ${strings.footer.copyright}</p>
          </div>
        </div>
      </footer>
    `;
  }
}
