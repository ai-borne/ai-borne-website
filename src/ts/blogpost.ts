import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { SiteDataStore } from '../store/SiteDataStore';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

function renderMarkdown(md: string): string {
  let html = md;

  // Escape HTML tags to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre style="background: var(--color-surface-elevated, #1e293b); padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 0.9rem; margin: 1.5rem 0;"><code>${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(99, 102, 241, 0.1); color: var(--color-primary); padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace;">$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 2rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem;">$1</h1>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.25rem;">$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li style="margin-left: 1.5rem; margin-bottom: 0.25rem;">$1</li>');

  // Paragraphs
  const paragraphs = html.split(/\n\n+/);
  return paragraphs
    .map((p) => {
      p = p.trim();
      if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<li')) {
        return p;
      }
      return `<p style="line-height: 1.7; margin-bottom: 1.25rem; font-size: 1.05rem;">${p}</p>`;
    })
    .join('\n');
}

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
          <a href="/blog/index.html" style="color: var(--color-primary); text-decoration: none; font-weight: 600;">&larr; All Insights</a>
        </div>
        <span class="badge mb-sm">${post.category}</span>
        <h1 style="font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 1rem;">${post.title}</h1>
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--color-border); padding-bottom: 1rem;" class="text-muted">
          <span>By <strong>${post.author}</strong></span>
          <span>&bull;</span>
          <span>${post.publishedDate}</span>
          <span>&bull;</span>
          <span>${post.readTimeMinutes} min read</span>
        </div>
        <div class="article-body">
          ${renderMarkdown(post.contentMarkdown)}
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
