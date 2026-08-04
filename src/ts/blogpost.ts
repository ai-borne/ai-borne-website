import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { SiteDataStore } from '../store/SiteDataStore';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';
import { MarkdownRenderer } from '../services/MarkdownRenderer';

export function renderBlogPostPage(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const post = slug ? SiteDataStore.getPostBySlug(slug) : undefined;
  const appEl = document.getElementById('app');
  if (!appEl) return;

  if (!post) {
    appEl.innerHTML = `
      ${HeaderComponent.render('blog')}
      <main class="main-content">
        <section class="container section text-center" style="padding: 4rem 1rem;">
          <h1 class="hero-title">Article Not Found</h1>
          <p class="hero-tagline mb-lg">The article you are looking for does not exist or has been moved.</p>
          <a href="/blog/index.html" class="btn btn-primary">&larr; Back to Insights</a>
        </section>
      </main>
      ${FooterComponent.render()}
    `;
    initThemeEngine();
    return;
  }

  appEl.innerHTML = `
    ${HeaderComponent.render('blog')}
    <main class="main-content">
      <article class="container section" style="max-width: 800px; padding-top: 2rem;">
        <div style="margin-bottom: 1.5rem;">
          <a href="/blog/index.html" style="color: var(--color-accent-cyan); text-decoration: none; font-weight: 600;">&larr; All Insights</a>
        </div>
        <span class="badge mb-sm">${post.category}</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 1rem;">${post.title}</h1>
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border-glass); padding-bottom: 1rem;" class="text-muted">
          <span>By <strong>${post.author}</strong></span>
          <span>&bull;</span>
          <span>${post.publishedDate}</span>
          <span>&bull;</span>
          <span>${post.readTimeMinutes} min read</span>
        </div>
        <div class="article-body">
          ${MarkdownRenderer.render(post.contentMarkdown)}
        </div>
      </article>
    </main>
    ${FooterComponent.render()}
  `;

  initThemeEngine();
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderBlogPostPage());
}
