import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { BlogViewModel } from '../viewmodels/BlogViewModel';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';
import { HtmlSafety } from '../services/HtmlSafety';

function renderCardsHtml(posts: ReturnType<BlogViewModel['getPosts']>, strings: ReturnType<typeof StringResources.getStrings>): string {
  const text = HtmlSafety.escapeText;
  const postUrl = (slug: string) => HtmlSafety.safeInternalUrl(`/blog/post.html?slug=${encodeURIComponent(slug)}`);
  return posts
    .map(
      (post) => `
      <article class="card card-flex">
        <div>
          <div class="card-header-row">
            <div class="content-row">
              <span class="badge">${text(post.category)}</span>
              ${post.difficulty ? `<span class="badge badge-surface">${text(post.difficulty)}</span>` : ''}
            </div>
            ${post.metricBadge ? `<span class="card-metric-badge">${text(post.metricBadge)}</span>` : ''}
          </div>
          <h2 class="card-title-sm">
            <a href="${postUrl(post.slug)}" class="card-link">${text(post.title)}</a>
          </h2>
          <p class="text-muted mb-md">${text(post.summary)}</p>
          ${
            post.tags && post.tags.length > 0
              ? `
            <div class="tag-list">
              ${post.tags.map((t) => `<span class="badge tag-badge">${text(t)}</span>`).join('')}
            </div>
          `
              : ''
          }
        </div>
        <div class="card-footer-row text-muted">
          <small>${text(strings.blog.byAuthor)} <strong>${text(post.author)}</strong> &bull; ${text(post.publishedDate)}</small>
          <small>${text(post.readTimeMinutes)} ${text(strings.home.minRead)} &bull; <a href="${postUrl(post.slug)}" class="article-link">${text(strings.blog.readArticle)}</a></small>
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
  const text = HtmlSafety.escapeText;

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('blog')}
    <main class="main-content">
      <section class="container hero">
        <h1 class="hero-title">${text(strings.blog.title)}</h1>
        <p class="hero-tagline">${text(strings.blog.subtitle)}</p>

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
            placeholder="${text(strings.blog.searchPlaceholder)}"
            aria-label="${text(strings.blog.searchLabel)}"
            autocomplete="off"
          />
        </div>

        <div class="filter-pills" id="category-pills-container" role="toolbar" aria-label="${text(strings.blog.categoryFiltersLabel)}">
          <button type="button" class="filter-pill active" data-category="">
            ${text(strings.blog.filterAll)}
          </button>
          ${categories
            .map(
              (cat) => `
            <button type="button" class="filter-pill" data-category="${text(cat)}">
              ${text(cat)}
            </button>
          `
            )
            .join('')}
        </div>
      </section>

      <section class="container section section-no-top">
        <span id="blog-count-display" class="post-count-badge"></span>
        <div id="blog-posts-grid" class="grid-2"></div>
        <div id="blog-empty-state" class="card text-center empty-state">
          <h3 class="feature-title">${text(strings.blog.emptyTitle)}</h3>
          <p class="text-muted mb-lg">${text(strings.blog.emptyDescription)}</p>
          <button type="button" id="reset-filter-action" class="btn btn-primary">${text(strings.blog.backToAllArticles)}</button>
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
        // renderCardsHtml escapes every data-store value before this trusted template boundary.
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
