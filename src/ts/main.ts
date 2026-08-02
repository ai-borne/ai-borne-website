import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { HomeViewModel } from '../viewmodels/HomeViewModel';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';

export function renderHomePage(): void {
  const viewModel = new HomeViewModel();
  const config = viewModel.getConfig();
  const apps = viewModel.getFeaturedApps();
  const posts = viewModel.getRecentPosts();
  const strings = StringResources.getStrings();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('home')}
    <main class="main-content">
      <section class="hero container">
        <span class="badge mb-md">${strings.hero.badge}</span>
        <h1 class="hero-title">${config.tagline}</h1>
        <p class="hero-tagline">${config.mission}</p>
        <div>
          <a href="/apps/payslipmax.html" class="btn btn-primary">${strings.hero.ctaExplore}</a>
        </div>
      </section>

      <section class="container section">
        <h2 class="section-title text-center">${strings.home.featuredAppsTitle}</h2>
        <p class="section-subtitle text-center">${strings.home.featuredAppsSubtitle}</p>
        <div class="grid-2">
          ${apps
            .map(
              (app) => `
            <div class="card">
              <span class="badge mb-sm">${app.category}</span>
              <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${app.name}</h3>
              <p class="text-muted mb-md">${app.description}</p>
              <div style="margin-bottom: 1rem;">
                <span style="color: #4ade80; font-size: 0.875rem;">✔ ${app.privacyGuarantee}</span>
              </div>
              <a href="/apps/payslipmax.html" class="btn btn-primary">${strings.home.viewProductDetails}</a>
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <section class="container section">
        <h2 class="section-title text-center">${strings.home.insightsTitle}</h2>
        <div class="grid-2">
          ${posts
            .map(
              (post) => `
            <div class="card">
              <span class="badge mb-sm">${post.category}</span>
              <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${post.title}</h3>
              <p class="text-muted mb-md">${post.summary}</p>
              <span class="text-muted" style="font-size: 0.875rem;">${post.readTimeMinutes} ${strings.home.minRead}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    </main>
    ${FooterComponent.render()}
  `;
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderHomePage());
}
