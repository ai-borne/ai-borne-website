import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { AppsIndexViewModel } from '../viewmodels/AppsIndexViewModel';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

export function renderAppsIndexPage(): void {
  const viewModel = new AppsIndexViewModel();
  const apps = viewModel.getAllApps();
  const strings = StringResources.getStrings();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('apps')}
    <main class="main-content">
      <section class="container hero">
        <span class="badge mb-md">${strings.hero.badge}</span>
        <h1 class="hero-title">${strings.appsIndex.title}</h1>
        <p class="hero-tagline">${strings.appsIndex.subtitle}</p>
      </section>

      <section class="container section">
        <div class="grid-2">
          ${apps
            .map(
              (app) => `
            <div class="card">
              <span class="badge mb-sm">${app.category}</span>
              <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${app.name}</h2>
              <p class="text-muted mb-md" style="font-weight: 500;">${app.tagline}</p>
              <p class="text-muted mb-md">${app.description}</p>
              <div style="margin-bottom: 1.5rem;">
                <span style="color: #4ade80; font-size: 0.875rem;">✔ ${app.privacyGuarantee}</span>
              </div>
              <a href="/apps/${app.id}.html" class="btn btn-primary">${strings.home.viewProductDetails}</a>
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
  document.addEventListener('DOMContentLoaded', () => renderAppsIndexPage());
}
