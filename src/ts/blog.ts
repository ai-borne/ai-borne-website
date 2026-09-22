import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { BlogViewModel } from '../viewmodels/BlogViewModel';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

function renderCardsHtml(posts: ReturnType<BlogViewModel['getPosts']>, strings: ReturnType<typeof StringResources.getStrings>): string {
  return posts
    .map(
      (post) => `
      <article class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm); gap: var(--spacing-xs); flex-wrap: wrap;">
            <div style="display: flex; gap: var(--spacing-xs); align-items: center; flex-wrap: wrap;">
              <span class="badge">${post.category}</span>
              ${post.difficulty ? `<span class="badge" style="background: var(--color-bg-surface);">${post.difficulty}</span>` : ''}
            </div>
            ${post.metricBadge ? `<span class="card-metric-badge">${post.metricBadge}</span>` : ''}
          </div>
          <h2 style="font-size: 1.4rem; margin-bottom: 0.5rem; line-height: 1.3;">
            <a href="/blog/post.html?slug=${post.slug}" style="color: inherit; text-decoration: none;">${post.title}</a>
          </h2>
          <p class="text-muted mb-md">${post.summary}</p>
          ${
            post.tags && post.tags.length > 0
              ? `
            <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap; margin-bottom: var(--spacing-md);">
              ${post.tags.map((t) => `<span class="badge" style="font-size: 0.7rem; padding: 0.15rem 0.5rem; border-color: var(--color-border-glass);">${t}</span>`).join('')}
            </div>
          `
              : ''
          }
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-glass); padding-top: var(--spacing-md);" class="text-muted">
          <small>By <strong>${post.author}</strong> &bull; ${post.publishedDate}</small>
          <small>${post.readTimeMinutes} ${strings.home.minRead} &bull; <a href="/blog/post.html?slug=${post.slug}" style="color: var(--color-accent-cyan); font-weight: 600; text-decoration: none;">${strings.blog.readArticle}</a></small>
        </div>
      </article>
    `
    )
    .join('');
}

export function renderBlogPage(): void {
  const viewModel = new BlogViewModel();
  const strings = StringResources.getStrings();
  const categories = viewModel.getCategories();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('blog')}
    <main class="main-content">
      <section class="container hero">
        <h1 class="hero-title">${strings.blog.title}</h1>
        <p class="hero-tagline">${strings.blog.subtitle}</p>

        <div class="search-wrapper">
          <span class="search-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="search"
            id="blog-search-box"
            class="search-input"
            placeholder="${strings.blog.searchPlaceholder}"
            aria-label="Search engineering playbooks"
            autocomplete="off"
          />
        </div>

        <div class="filter-pills" id="category-pills-container" role="toolbar" aria-label="Category filters">
          <button type="button" class="filter-pill active" data-category="">
            ${strings.blog.filterAll}
          </button>
          ${categories
            .map(
              (cat) => `
            <button type="button" class="filter-pill" data-category="${cat}">
              ${cat}
            </button>
          `
            )
            .join('')}
        </div>
      </section>

      <section class="container section" style="padding-top: 0;">
        <span id="blog-count-display" class="post-count-badge"></span>
        <div id="blog-posts-grid" class="grid-2"></div>
        <div id="blog-empty-state" class="card text-center" style="display: none; padding: var(--spacing-2xl);">
          <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-sm);">${strings.blog.emptyTitle}</h3>
          <p class="text-muted mb-lg">${strings.blog.emptyDescription}</p>
          <button type="button" id="reset-filter-action" class="btn btn-primary">${strings.blog.backToAllArticles}</button>
        </div>
      </section>
    </main>
    ${FooterComponent.render()}
  `;

  initThemeEngine();

  const searchBox = document.getElementById('blog-search-box') as HTMLInputElement | null;
  const pillsContainer = document.getElementById('category-pills-container');
  const countDisplay = document.getElementById('blog-count-display');
  const gridContainer = document.getElementById('blog-posts-grid');
  const emptyState = document.getElementById('blog-empty-state');
  const resetBtn = document.getElementById('reset-filter-action');

  function updateView(): void {
    const matchedPosts = viewModel.getPosts();
    const matchedTotal = matchedPosts.length;

    if (countDisplay) {
      countDisplay.textContent = `${strings.blog.showingCount}: ${matchedTotal}`;
    }

    if (gridContainer && emptyState) {
      if (matchedTotal === 0) {
        gridContainer.style.display = 'none';
        emptyState.style.display = 'block';
      } else {
        gridContainer.style.display = 'grid';
        emptyState.style.display = 'none';
        gridContainer.innerHTML = renderCardsHtml(matchedPosts, strings);
      }
    }
  }

  // Initial render
  updateView();

  // Search input listener
  if (searchBox) {
    searchBox.addEventListener('input', () => {
      viewModel.setSearchQuery(searchBox.value);
      updateView();
    });
  }

  // Category filter pill delegation
  if (pillsContainer) {
    pillsContainer.addEventListener('click', (event) => {
      const targetBtn = (event.target as HTMLElement).closest<HTMLButtonElement>('.filter-pill');
      if (!targetBtn) return;

      const targetCategory = targetBtn.getAttribute('data-category') || null;
      viewModel.setCategoryFilter(targetCategory);

      pillsContainer.querySelectorAll('.filter-pill').forEach((btn) => btn.classList.remove('active'));
      targetBtn.classList.add('active');

      updateView();
    });
  }

  // Reset filters action
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      viewModel.setCategoryFilter(null);
      viewModel.setSearchQuery('');
      if (searchBox) {
        searchBox.value = '';
      }
      if (pillsContainer) {
        pillsContainer.querySelectorAll('.filter-pill').forEach((btn) => {
          if (btn.getAttribute('data-category') === '') {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
      updateView();
    });
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderBlogPage());
}
