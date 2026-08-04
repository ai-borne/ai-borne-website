import { StringResources } from '../store/StringResources';

export class FooterComponent {
  public static render(): string {
    const strings = StringResources.getStrings();
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a href="/" class="logo mb-md" style="display: flex; align-items: center; text-decoration: none;">
                <img src="/assets/logo-dark.png" alt="ai-borne" class="logo-img logo-img-dark" style="height: 32px; width: auto;" />
                <img src="/assets/logo-light.png" alt="ai-borne" class="logo-img logo-img-light" style="height: 32px; width: auto;" />
              </a>
              <p class="text-muted">${strings.footer.tagline}</p>
            </div>
            <div>
              <h4 class="mb-md">${strings.footer.productsTitle}</h4>
              <a href="/apps/payslipmax.html" class="footer-link">PayslipMax</a>
              <a href="/apps/ssbmax.html" class="footer-link">SSBMax</a>
              <a href="/apps/yoga-of-eating.html" class="footer-link">Yoga of Eating</a>
              <a href="/apps/action-station.html" class="footer-link">ActionStation</a>
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
