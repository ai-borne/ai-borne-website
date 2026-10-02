import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { PayslipMaxViewModel } from '../viewmodels/PayslipMaxViewModel';
import { StringResources, IStringDictionary } from '../store/StringResources';
import { IAppMetadata, IComplianceCard } from '../models/AppMetadata';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

function renderHero(app: IAppMetadata, strings: IStringDictionary): string {
  return `
    <section class="container hero">
      <span class="badge mb-md">${app.category}</span>
      <h1 class="hero-title">${app.name}</h1>
      <p class="hero-tagline">${app.tagline}</p>
      <div class="privacy-banner">
        <strong>${strings.payslipmax.privacyBannerLabel}</strong> ${app.privacyGuarantee}
      </div>
    </section>
  `;
}

function renderFeatures(app: IAppMetadata, strings: IStringDictionary): string {
  return `
    <section class="container section">
      <h2 class="section-title text-center mb-xl">${strings.payslipmax.keyFeaturesTitle}</h2>
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
  `;
}

function renderCompliance(cards: IComplianceCard[], strings: IStringDictionary): string {
  return `
    <section class="container section section-no-top">
      <h2 class="section-title text-center mb-xl">${strings.payslipmax.complianceTitle}</h2>
      <div class="grid-3">
        ${cards
          .map(
            (card) => `
          <a href="${card.url}" class="card card-flex card-link">
            <div>
              <h3 class="feature-title">${card.title}</h3>
              <p class="text-muted mb-lg">${card.description}</p>
            </div>
            <div class="insights-header-link">
              <span>${strings.payslipmax.readPolicyLink}</span>
            </div>
          </a>
        `
          )
          .join('')}
      </div>
    </section>
  `;
}

export function renderPayslipMaxPage(): void {
  const viewModel = new PayslipMaxViewModel();
  const app = viewModel.getAppDetails();
  const complianceCards = viewModel.getComplianceCards();
  const strings = StringResources.getStrings();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('apps')}
    <main class="main-content">
      ${renderHero(app, strings)}
      ${renderFeatures(app, strings)}
      ${renderCompliance(complianceCards, strings)}
    </main>
    ${FooterComponent.render()}
  `;

  initThemeEngine();
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderPayslipMaxPage());
}
