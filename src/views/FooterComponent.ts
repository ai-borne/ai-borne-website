export class FooterComponent {
  public static render(): string {
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a href="/" class="logo mb-md">
                Action<span class="logo-accent">Station</span>
              </a>
              <p class="text-muted">Engineering Intelligent Apps, Automation & AI Solutions.</p>
            </div>
            <div>
              <h4 class="mb-md">Products</h4>
              <a href="/apps/payslipmax.html" class="footer-link">PayslipMax</a>
            </div>
            <div>
              <h4 class="mb-md">Developer & Insights</h4>
              <a href="/blog/index.html" class="footer-link">Tech Hacks & Insights</a>
              <a href="https://github.com/sunilpawar-git" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
            </div>
            <div>
              <h4 class="mb-md">Store Compliance & Legal</h4>
              <a href="/privacy-policy.html" class="footer-link">Privacy Policy</a>
              <a href="/terms.html" class="footer-link">Terms of Service</a>
              <a href="/support.html" class="footer-link">Support Center</a>
              <a href="/data-deletion.html" class="footer-link">Data & Account Deletion</a>
            </div>
          </div>
          <div class="text-center text-muted" style="border-top: 1px solid var(--color-border-glass); padding-top: var(--spacing-md);">
            <p>&copy; ${new Date().getFullYear()} Action Station (actionstation.in). All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;
  }
}
