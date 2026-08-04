import { StringResources } from '../store/StringResources';

export class FooterComponent {
  public static render(): string {
    const strings = StringResources.getStrings();
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand-col">
              <a href="/" class="logo mb-sm" style="display: inline-flex; align-items: center; text-decoration: none;">
                <img src="/assets/logo-dark.png" alt="ai-borne" class="logo-img logo-img-dark" style="height: 32px; width: auto;" />
                <img src="/assets/logo-light.png" alt="ai-borne" class="logo-img logo-img-light" style="height: 32px; width: auto;" />
              </a>
              <p class="footer-tagline text-muted">${strings.footer.tagline}</p>
              <div class="footer-brand-pill">
                <span class="footer-pill-dot"></span>
                <span>Privacy-First & On-Device AI</span>
              </div>
            </div>
            <div class="footer-col">
              <h4 class="footer-col-title">${strings.footer.productsTitle}</h4>
              <ul class="footer-links-list">
                <li><a href="/apps/payslipmax.html" class="footer-link">PayslipMax</a></li>
                <li><a href="/apps/ssbmax.html" class="footer-link">SSBMax</a></li>
                <li><a href="/apps/yoga-of-eating.html" class="footer-link">Yoga of Eating</a></li>
                <li><a href="/apps/action-station.html" class="footer-link">ActionStation</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4 class="footer-col-title">${strings.footer.developerTitle}</h4>
              <ul class="footer-links-list">
                <li><a href="/blog/index.html" class="footer-link">Tech Hacks & Insights</a></li>
                <li>
                  <a href="https://github.com/sunilpawar-git" target="_blank" rel="noopener noreferrer" class="footer-link footer-external-link">
                    GitHub
                    <svg class="external-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.5 2.5H9.5V8.5M9.5 2.5L2.5 9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
            <div class="footer-col">
              <h4 class="footer-col-title">${strings.footer.legalTitle}</h4>
              <ul class="footer-links-list">
                <li><a href="/privacy-policy.html" class="footer-link">Privacy Policy</a></li>
                <li><a href="/terms.html" class="footer-link">Terms of Service</a></li>
                <li><a href="/support.html" class="footer-link">Support Center</a></li>
                <li><a href="/data-deletion.html" class="footer-link">Data & Account Deletion</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p class="footer-copyright">&copy; ${new Date().getFullYear()} ${strings.footer.copyright}</p>
            <div class="footer-bottom-links">
              <span class="footer-bottom-badge">Built for Performance & Security</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
}

