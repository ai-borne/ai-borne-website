import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { HomeViewModel } from '../viewmodels/HomeViewModel';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

export function renderHomePage(): void {
  const viewModel = new HomeViewModel();
  const config = viewModel.getConfig();
  const apps = viewModel.getFeaturedApps();
  const posts = viewModel.getFeaturedInsightPosts(4);
  const totalPostsCount = viewModel.getRecentPosts(100).length;
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
          <a href="/apps/index.html" class="btn btn-primary">${strings.hero.ctaExplore}</a>
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
                <span style="color: var(--color-accent-green); font-size: 0.875rem;">✔ ${app.privacyGuarantee}</span>
              </div>
              <a href="/apps/${app.id}.html" class="btn btn-primary">${strings.home.viewProductDetails}</a>
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <section class="container section">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--spacing-xl); flex-wrap: wrap; gap: var(--spacing-sm);">
          <div>
            <h2 class="section-title" style="margin-bottom: 0.25rem;">${strings.home.insightsTitle}</h2>
            <p class="text-muted" style="font-size: var(--font-size-sm);">${strings.home.featuredAppsSubtitle}</p>
          </div>
          <a href="/blog/index.html" class="insights-header-link">${strings.home.viewAllInsightsLink} (${totalPostsCount}) &rarr;</a>
        </div>
        <div class="grid-2 mb-xl">
          ${posts
            .map(
              (post) => `
            <article class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm); gap: var(--spacing-xs); flex-wrap: wrap;">
                  <span class="badge">${post.category}</span>
                  ${post.metricBadge ? `<span class="card-metric-badge">${post.metricBadge}</span>` : ''}
                </div>
                <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">
                  <a href="/blog/post.html?slug=${post.slug}" style="color: inherit; text-decoration: none;">${post.title}</a>
                </h3>
                <p class="text-muted mb-md">${post.summary}</p>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--spacing-md); border-top: 1px solid var(--color-border-glass); padding-top: var(--spacing-md);" class="text-muted">
                <span style="font-size: 0.875rem;">${post.readTimeMinutes} ${strings.home.minRead}</span>
                <a href="/blog/post.html?slug=${post.slug}" style="color: var(--color-accent-cyan); font-weight: 600; text-decoration: none; font-size: 0.875rem;">${strings.home.readArticle}</a>
              </div>
            </article>
          `
            )
            .join('')}
        </div>
        <div class="text-center">
          <a href="/blog/index.html" class="btn btn-primary">${strings.home.exploreAllInsights}</a>
        </div>
      </section>
    </main>
    ${FooterComponent.render()}
  `;

  initThemeEngine();
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderHomePage());
}
