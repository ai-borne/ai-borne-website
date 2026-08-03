import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { SupportViewModel } from '../viewmodels/SupportViewModel';
import { HttpContactService } from '../services/ContactService';
import { SiteDataStore } from '../store/SiteDataStore';
import { StringResources } from '../store/StringResources';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

export function renderSupportPage(): void {
  const contactService = new HttpContactService('/api/contact');
  const viewModel = new SupportViewModel(contactService);
  const config = SiteDataStore.getConfig();
  const strings = StringResources.getStrings();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('support')}
    <main class="main-content">
      <section class="container hero">
        <h1 class="hero-title">${strings.support.title}</h1>
        <p class="hero-tagline">${strings.support.tagline}</p>
      </section>

      <section class="container section">
        <div class="grid-2">
          <div class="card">
            <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${strings.support.directContactTitle}</h2>
            <p class="text-muted mb-md">${strings.support.directContactDesc}</p>
            <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem; color: var(--color-accent-cyan);">
              📧 ${config.supportEmail}
            </p>
            <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid var(--color-accent-primary); padding: 1rem; border-radius: 4px;" class="text-muted">
              <small><strong>${strings.support.slaNotice}</strong></small>
            </div>
          </div>

          <div class="card">
            <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${strings.support.formTitle}</h2>
            <div id="form-alert"></div>
            <form id="support-form">
              <div class="form-group">
                <label class="form-label" for="email">${strings.support.emailLabel}</label>
                <input class="form-input" type="email" id="email" placeholder="${strings.support.emailPlaceholder}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="message">${strings.support.messageLabel}</label>
                <textarea class="form-textarea" id="message" rows="4" placeholder="${strings.support.messagePlaceholder}" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary" id="submit-btn">${strings.support.sendButton}</button>
            </form>
          </div>
        </div>
      </section>
    </main>
    ${FooterComponent.render()}
  `;

  bindSupportFormEvents(viewModel);
  initThemeEngine();
}

function bindSupportFormEvents(viewModel: SupportViewModel): void {
  const form = document.getElementById('support-form') as HTMLFormElement | null;
  const alertEl = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement | null;
  const strings = StringResources.getStrings();

  if (!form || !alertEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const messageInput = document.getElementById('message') as HTMLTextAreaElement;

    submitBtn.disabled = true;
    submitBtn.innerText = strings.support.sendingButton;

    await viewModel.submitForm(emailInput.value, messageInput.value);
    const state = viewModel.getState();

    submitBtn.disabled = false;
    submitBtn.innerText = strings.support.sendButton;

    if (state.isSuccess) {
      alertEl.innerHTML = `<div class="alert-success">${strings.support.successMessage}</div>`;
      form.reset();
    } else if (state.errorMessage) {
      alertEl.innerHTML = `<div class="alert-error">${state.errorMessage}</div>`;
    }
  });
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderSupportPage());
}
