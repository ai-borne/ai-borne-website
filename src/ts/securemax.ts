import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { SecureMaxViewModel } from '../viewmodels/SecureMaxViewModel';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';
import { HtmlSafety } from '../services/HtmlSafety';

export function renderSecureMaxPage(): void {
  const viewModel = new SecureMaxViewModel();
  const app = viewModel.getAppDetails();
  const strings = StringResources.getStrings();
  const safeWebUrl = HtmlSafety.safeExternalUrl(app.webUrl);

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('apps')}
    <main class="main-content">
      <section class="container hero">
        <span class="badge mb-md">${app.category}</span>
        <h1 class="hero-title">${app.name}</h1>
        <p class="hero-tagline">${app.tagline}</p>
        <div class="privacy-banner">
          <strong>${strings.securemax.privacyBannerLabel}</strong> ${app.privacyGuarantee}
        </div>
        ${
          safeWebUrl
            ? `
          <div class="mb-md">
            <a href="${safeWebUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
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
              <h3 class="feature-title">${feature.title}</h3>
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
