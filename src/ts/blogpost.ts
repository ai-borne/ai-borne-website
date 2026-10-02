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
import { SeoMetadataService } from '../services/SeoMetadataService';
import { HtmlSafety } from '../services/HtmlSafety';

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
  const text = HtmlSafety.escapeText;
  const postUrl = (slug: string) => HtmlSafety.safeInternalUrl(`/blog/post.html?slug=${encodeURIComponent(slug)}`);

  const appEl = document.getElementById('app');
  if (!appEl) return;

  if (!post) {
    appEl.innerHTML = `
      ${HeaderComponent.render('blog')}
      <main class="main-content">
        <section class="container section text-center article-not-found">
          <h1 class="hero-title">${text(strings.blog.articleNotFoundTitle)}</h1>
          <p class="hero-tagline mb-lg">${text(strings.blog.articleNotFoundDesc)}</p>
          <a href="/blog/index.html" class="btn btn-primary">${text(strings.blog.backToAllArticles)}</a>
        </section>
      </main>
      ${FooterComponent.render()}
    `;
    initThemeEngine();
    return;
  }

  SeoMetadataService.applyPostMetadata(post);

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
      <article class="container section article-container">
        <nav class="breadcrumbs" aria-label="${text(strings.blog.breadcrumbsLabel)}">
          <a href="/">${text(strings.nav.home)}</a>
          <span class="breadcrumbs-separator">/</span>
          <a href="/blog/index.html">${text(strings.blog.breadcrumbAllInsights)}</a>
          <span class="breadcrumbs-separator">/</span>
          <span class="text-muted">${text(post.category)}</span>
        </nav>

        <div class="article-metadata-row">
          <span class="badge">${text(post.category)}</span>
          ${post.metricBadge ? `<span class="card-metric-badge">${text(post.metricBadge)}</span>` : ''}
          ${post.difficulty ? `<span class="badge badge-surface">${text(post.difficulty)}</span>` : ''}
        </div>

        <h1 class="article-heading">${text(post.title)}</h1>

        <div class="article-byline text-muted">
          <span>${text(strings.blog.byAuthor)} <strong>${text(post.author)}</strong></span>
          <span>&bull;</span>
          <span>${text(post.publishedDate)}</span>
          <span>&bull;</span>
          <span>${text(post.readTimeMinutes)} ${text(strings.home.minRead)}</span>
        </div>

        <div class="article-callout">
          <div class="article-callout-title">
            <span>${text(strings.blog.in30SecondsTitle)}</span>
          </div>
          <p>${text(post.summary)}</p>
        </div>

        <div class="article-body">
          <!-- Trusted Markdown boundary: MarkdownRenderer sanitizes article HTML and link protocols. -->
          ${MarkdownRenderer.render(post.contentMarkdown)}
        </div>

        <section class="section article-related">
          <h2 class="related-heading">${text(strings.blog.relatedPlaybooksTitle)}</h2>
          <div class="grid-2">
            ${relatedPosts
              .map(
                (related) => `
              <article class="card card-flex">
                <div>
                  <div class="card-header-row compact-row">
                    <span class="badge">${text(related.category)}</span>
                    ${related.metricBadge ? `<span class="card-metric-badge">${text(related.metricBadge)}</span>` : ''}
                  </div>
                  <h3 class="related-card-title">
                    <a href="${postUrl(related.slug)}" class="card-link">${text(related.title)}</a>
                  </h3>
                  <p class="text-muted mb-md metadata-text">${text(related.summary)}</p>
                </div>
                <div class="card-footer-row text-muted">
                  <small>${text(related.readTimeMinutes)} ${text(strings.home.minRead)}</small>
                  <a href="${postUrl(related.slug)}" class="article-link metadata-text">${text(strings.blog.readArticle)}</a>
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
