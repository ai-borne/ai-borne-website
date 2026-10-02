import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { ActionStationViewModel } from '../viewmodels/ActionStationViewModel';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

export function renderActionStationPage(): void {
  const viewModel = new ActionStationViewModel();
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
        <div class="privacy-banner">
          <strong>${strings.actionStation.privacyBannerLabel}</strong> ${app.privacyGuarantee}
        </div>
      </section>

      <section class="container section">
        <h2 class="section-title text-center mb-xl">${strings.actionStation.keyFeaturesTitle}</h2>
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
  document.addEventListener('DOMContentLoaded', () => renderActionStationPage());
}
