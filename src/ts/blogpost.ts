import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { SiteDataStore } from '../store/SiteDataStore';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';
import { MarkdownRenderer } from '../services/MarkdownRenderer';

function attachCodeCopyButtons(): void {
  const strings = StringResources.getStrings();
  const codeBlockElements = document.querySelectorAll<HTMLElement>('.article-body .code-block');

  codeBlockElements.forEach((blockEl) => {
    const blockParent = blockEl.parentNode;
    if (!blockParent) return;

    const wrapperEl = document.createElement('div');
    wrapperEl.className = 'code-block-wrapper';
    blockParent.insertBefore(wrapperEl, blockEl);
    wrapperEl.appendChild(blockEl);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'code-copy-btn';
    copyBtn.type = 'button';
    copyBtn.setAttribute('aria-label', strings.blog.copyCode);
    copyBtn.textContent = strings.blog.copyCode;

    copyBtn.addEventListener('click', async () => {
      const codeText = blockEl.textContent || '';
      try {
        await navigator.clipboard.writeText(codeText);
        copyBtn.textContent = strings.blog.copiedCode;
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = strings.blog.copyCode;
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch {
        copyBtn.textContent = strings.blog.copiedCode;
        setTimeout(() => {
          copyBtn.textContent = strings.blog.copyCode;
        }, 2000);
      }
    });

    wrapperEl.appendChild(copyBtn);
  });
}

function initReadingProgressBar(): void {
  const progressBar = document.getElementById('reading-progress-bar');
  if (!progressBar) return;

  window.addEventListener(
    'scroll',
    () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const progressRatio = scrollMax > 0 ? (scrollPos / scrollMax) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, progressRatio))}%`;
    },
    { passive: true }
  );
}

export function renderBlogPostPage(): void {
  const currentQuery = new URLSearchParams(window.location.search);
  const currentSlug = currentQuery.get('slug');
  const post = currentSlug ? SiteDataStore.getPostBySlug(currentSlug) : undefined;
  const strings = StringResources.getStrings();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  if (!post) {
    appEl.innerHTML = `
      ${HeaderComponent.render('blog')}
      <main class="main-content">
        <section class="container section text-center" style="padding: 4rem 1rem;">
          <h1 class="hero-title">${strings.blog.articleNotFoundTitle}</h1>
          <p class="hero-tagline mb-lg">${strings.blog.articleNotFoundDesc}</p>
          <a href="/blog/index.html" class="btn btn-primary">${strings.blog.backToAllArticles}</a>
        </section>
      </main>
      ${FooterComponent.render()}
    `;
    initThemeEngine();
    return;
  }

  const allOtherPosts = SiteDataStore.getPosts().filter((p) => p.slug !== post.slug);
  const relatedPosts = allOtherPosts
    .sort((a, b) => {
      const aMatches = a.category === post.category ? 1 : 0;
      const bMatches = b.category === post.category ? 1 : 0;
      return bMatches - aMatches;
    })
    .slice(0, 2);

  appEl.innerHTML = `
    <div id="reading-progress-bar" class="reading-progress-bar"></div>
    ${HeaderComponent.render('blog')}
    <main class="main-content">
      <article class="container section" style="max-width: 820px; padding-top: 1.5rem;">
        <nav class="breadcrumbs" aria-label="Breadcrumbs">
          <a href="/">${strings.nav.home}</a>
          <span class="breadcrumbs-separator">/</span>
          <a href="/blog/index.html">${strings.blog.breadcrumbAllInsights}</a>
          <span class="breadcrumbs-separator">/</span>
          <span class="text-muted">${post.category}</span>
        </nav>

        <div style="display: flex; gap: var(--spacing-xs); align-items: center; margin-bottom: var(--spacing-sm); flex-wrap: wrap;">
          <span class="badge">${post.category}</span>
          ${post.metricBadge ? `<span class="card-metric-badge">${post.metricBadge}</span>` : ''}
          ${post.difficulty ? `<span class="badge" style="background: var(--color-bg-surface);">${post.difficulty}</span>` : ''}
        </div>

        <h1 style="font-size: 2.5rem; font-weight: 900; line-height: 1.2; margin-bottom: 1rem;">${post.title}</h1>

        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border-glass); padding-bottom: 1rem; flex-wrap: wrap;" class="text-muted">
          <span>By <strong>${post.author}</strong></span>
          <span>&bull;</span>
          <span>${post.publishedDate}</span>
          <span>&bull;</span>
          <span>${post.readTimeMinutes} ${strings.home.minRead}</span>
        </div>

        <div class="article-callout">
          <div class="article-callout-title">
            <span>${strings.blog.in30SecondsTitle}</span>
          </div>
          <p>${post.summary}</p>
        </div>

        <div class="article-body">
          ${MarkdownRenderer.render(post.contentMarkdown)}
        </div>

        <section class="section" style="margin-top: var(--spacing-2xl); border-top: 1px solid var(--color-border-glass); padding-top: var(--spacing-xl);">
          <h2 style="font-size: var(--font-size-xl); margin-bottom: var(--spacing-lg); font-weight: 800;">${strings.blog.relatedPlaybooksTitle}</h2>
          <div class="grid-2">
            ${relatedPosts
              .map(
                (related) => `
              <article class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xs); flex-wrap: wrap; gap: var(--spacing-xs);">
                    <span class="badge">${related.category}</span>
                    ${related.metricBadge ? `<span class="card-metric-badge">${related.metricBadge}</span>` : ''}
                  </div>
                  <h3 style="font-size: var(--font-size-base); margin-bottom: 0.5rem; line-height: 1.3;">
                    <a href="/blog/post.html?slug=${related.slug}" style="color: inherit; text-decoration: none;">${related.title}</a>
                  </h3>
                  <p class="text-muted mb-md" style="font-size: var(--font-size-sm);">${related.summary}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-glass); padding-top: var(--spacing-md);" class="text-muted">
                  <small>${related.readTimeMinutes} ${strings.home.minRead}</small>
                  <a href="/blog/post.html?slug=${related.slug}" style="color: var(--color-accent-cyan); font-weight: 600; text-decoration: none; font-size: var(--font-size-sm);">${strings.blog.readArticle}</a>
                </div>
              </article>
            `
              )
              .join('')}
          </div>
        </section>
      </article>
    </main>
    ${FooterComponent.render()}
  `;

  initThemeEngine();
  attachCodeCopyButtons();
  initReadingProgressBar();
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderBlogPostPage());
}
