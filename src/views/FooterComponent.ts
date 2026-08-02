import { StringResources } from '../store/StringResources';

export class FooterComponent {
  public static render(): string {
    const strings = StringResources.getStrings();
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a href="/" class="logo mb-md" style="display: flex; align-items: center; gap: 0.6rem;">
                <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 3C9.37 3 4 7.48 4 13C4 13.8 4.7 14.5 5.5 14.5C6.3 14.5 7 13.8 7 13C7 9.13 11.03 6 16 6C20.97 6 25 9.13 25 13C25 13.8 25.7 14.5 26.5 14.5C27.3 14.5 28 13.8 28 13C28 7.48 22.63 3 16 3Z" fill="url(#airborne-grad-footer)"/>
                  <path d="M7 13L14 21M25 13L18 21M16 6V18" stroke="#06b6d4" stroke-width="2" stroke-linecap="round"/>
                  <path d="M10 24L16 28L22 24" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="16" cy="21" r="3" fill="#06b6d4"/>
                  <defs>
                    <linearGradient id="airborne-grad-footer" x1="4" y1="3" x2="28" y2="14.5" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#06b6d4"/>
                      <stop offset="1" stop-color="#6366f1"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span style="font-weight: 800; letter-spacing: 0.05em;">AI-<span class="logo-accent">BORNE</span></span>
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
