import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { SupportViewModel } from '../viewmodels/SupportViewModel';
import { MockContactService } from '../services/ContactService';
import { SiteDataStore } from '../store/SiteDataStore';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';

export function renderSupportPage(): void {
  const contactService = new MockContactService();
  const viewModel = new SupportViewModel(contactService);
  const config = SiteDataStore.getConfig();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render('support')}
    <main class="main-content">
      <section class="container hero">
        <h1 class="hero-title">Developer Support Center</h1>
        <p class="hero-tagline">We are here to assist with PayslipMax, application inquiries, or feedback.</p>
      </section>

      <section class="container section">
        <div class="grid-2">
          <div class="card">
            <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Direct Contact Info</h2>
            <p class="text-muted mb-md">For official app support, store inquiries, or general feedback:</p>
            <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem; color: var(--color-accent-cyan);">
              📧 ${config.supportEmail}
            </p>
            <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid var(--color-accent-primary); padding: 1rem; border-radius: 4px;" class="text-muted">
              <small><strong>Response SLA:</strong> We typically respond to support inquiries within 24–48 hours.</small>
            </div>
          </div>

          <div class="card">
            <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Send Support Message</h2>
            <div id="form-alert"></div>
            <form id="support-form">
              <div class="form-group">
                <label class="form-label" for="email">Your Email Address</label>
                <input class="form-input" type="email" id="email" placeholder="name@domain.com" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="message">Message / Support Details</label>
                <textarea class="form-textarea" id="message" rows="4" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary" id="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </main>
    ${FooterComponent.render()}
  `;

  bindSupportFormEvents(viewModel);
}

function bindSupportFormEvents(viewModel: SupportViewModel): void {
  const form = document.getElementById('support-form') as HTMLFormElement | null;
  const alertEl = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement | null;

  if (!form || !alertEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const messageInput = document.getElementById('message') as HTMLTextAreaElement;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    await viewModel.submitForm(emailInput.value, messageInput.value);
    const state = viewModel.getState();

    submitBtn.disabled = false;
    submitBtn.innerText = 'Send Message';

    if (state.isSuccess) {
      alertEl.innerHTML = '<div class="alert-success">Thank you! Your message has been sent successfully.</div>';
      form.reset();
    } else if (state.errorMessage) {
      alertEl.innerHTML = `<div class="alert-error">${state.errorMessage}</div>`;
    }
  });
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => renderSupportPage());
}
