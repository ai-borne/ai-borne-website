import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

export function renderNotFoundPage(): void {
  const strings = StringResources.getStrings();
  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('home')}
    <main class="main-content">
      <section class="container hero">
        <h1 class="hero-title">${strings.notFound.title}</h1>
        <p class="hero-tagline">${strings.notFound.tagline}</p>
        <a class="btn btn-primary" href="/">${strings.notFound.homeButton}</a>
      </section>
    </main>
    ${FooterComponent.render()}
  `;

  initThemeEngine();
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderNotFoundPage());
}
