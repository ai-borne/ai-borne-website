import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { BlogViewModel } from '../viewmodels/BlogViewModel';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

export function renderBlogPage(): void {
  const viewModel = new BlogViewModel();
  const posts = viewModel.getPosts();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('blog')}
    <main class="main-content">
      <section class="container hero">
        <h1 class="hero-title">Tech Hacks & Insights</h1>
        <p class="hero-tagline">Architectural patterns, AI deployment strategies, and Kotlin Multiplatform engineering tips.</p>
      </section>

      <section class="container section">
        <div class="grid-2">
          ${posts
            .map(
              (post) => `
            <article class="card">
              <span class="badge mb-sm">${post.category}</span>
              <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">
                <a href="/blog/post.html?slug=${post.slug}" style="color: inherit; text-decoration: none;">${post.title}</a>
              </h2>
              <p class="text-muted mb-md">${post.summary}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;" class="text-muted">
                <small>By ${post.author} &bull; ${post.publishedDate}</small>
                <small>${post.readTimeMinutes} min read &bull; <a href="/blog/post.html?slug=${post.slug}" style="color: var(--color-primary); font-weight: 600;">Read &rarr;</a></small>
              </div>
            </article>
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
  document.addEventListener('DOMContentLoaded', () => renderBlogPage());
}
