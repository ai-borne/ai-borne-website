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
              <h3 class="card-title-sm">${app.name}</h3>
              <p class="text-muted mb-md">${app.description}</p>
              <div class="mb-md">
                <span class="text-success">✔ ${app.privacyGuarantee}</span>
              </div>
              <a href="/apps/${app.id}.html" class="btn btn-primary">${strings.home.viewProductDetails}</a>
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <section class="container section">
        <div class="section-heading-row">
          <div>
            <h2 class="section-title section-title-tight">${strings.home.insightsTitle}</h2>
            <p class="text-muted metadata-text">${strings.home.featuredAppsSubtitle}</p>
          </div>
          <a href="/blog/index.html" class="insights-header-link">${strings.home.viewAllInsightsLink} (${totalPostsCount}) &rarr;</a>
        </div>
        <div class="grid-2 mb-xl">
          ${posts
            .map(
              (post) => `
            <article class="card card-flex">
              <div>
                <div class="card-header-row">
                  <span class="badge">${post.category}</span>
                  ${post.metricBadge ? `<span class="card-metric-badge">${post.metricBadge}</span>` : ''}
                </div>
                <h3 class="card-title-sm">
                  <a href="/blog/post.html?slug=${post.slug}" class="card-link">${post.title}</a>
                </h3>
                <p class="text-muted mb-md">${post.summary}</p>
              </div>
              <div class="card-footer-row push-down text-muted">
                <span class="metadata-text">${post.readTimeMinutes} ${strings.home.minRead}</span>
                <a href="/blog/post.html?slug=${post.slug}" class="article-link metadata-text">${strings.home.readArticle}</a>
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
