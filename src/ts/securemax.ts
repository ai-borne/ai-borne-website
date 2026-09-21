import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { SecureMaxViewModel } from '../viewmodels/SecureMaxViewModel';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

export function renderSecureMaxPage(): void {
  const viewModel = new SecureMaxViewModel();
  const app = viewModel.getAppDetails();
  const strings = StringResources.getStrings();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('apps')}
    <main class="main-content">
      <section class="container hero">
        <span class="badge mb-md">${app.category}</span>
        <h1 class="hero-title">${app.name}</h1>
        <p class="hero-tagline">${app.tagline}</p>
        <div style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 8px; padding: 1rem; max-width: 600px; margin: 0 auto 2rem; color: #4ade80;">
          <strong>${strings.securemax.privacyBannerLabel}</strong> ${app.privacyGuarantee}
        </div>
        ${
          app.webUrl
            ? `
          <div style="margin-top: 1rem;">
            <a href="${app.webUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
              <span>${strings.securemax.launchButton}</span>
            </a>
          </div>
        `
            : ''
        }
      </section>

      <section class="container section">
        <h2 class="section-title text-center mb-xl">${strings.securemax.keyFeaturesTitle}</h2>
        <div class="grid-3">
          ${app.features
            .map(
              (feature) => `
            <div class="card">
              <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--color-accent-cyan);">${feature.title}</h3>
              <p class="text-muted">${feature.description}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    </main>
    ${FooterComponent.render()}
  `;

  initThemeEngine();
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderSecureMaxPage());
}
