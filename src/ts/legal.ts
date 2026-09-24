import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { ILegalPolicy } from '../models/LegalPolicy';
import { LegalPolicyStore } from '../store/LegalPolicyStore';
import { CONTACT_DETAILS } from '../store/ContactDetails';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';

type PolicyType = 'privacy' | 'terms' | 'refund' | 'contact' | 'deletion';

export function renderLegalPage(policyType: PolicyType): void {
  const policy = getPolicyData(policyType);
  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render(policyType)}
    <main class="main-content">
      <section class="container hero" style="padding-bottom: 1rem;">
        <h1 class="hero-title">${policy.title}</h1>
        <p class="text-muted">Last Updated: ${policy.lastUpdated} | Effective Date: ${policy.effectiveDate}</p>
      </section>

      <section class="container section">
        <div class="card" style="max-width: 800px; margin: 0 auto;">
          ${policy.sections
            .map(
              (section) => `
            <div style="margin-bottom: 2rem;">
              <h2 style="font-size: 1.25rem; margin-bottom: 0.75rem; color: var(--color-accent-cyan);">${section.heading}</h2>
              ${section.body.map((p) => `<p class="text-muted mb-md">${p}</p>`).join('')}
            </div>
          `
            )
            .join('')}

          <div style="border-top: 1px solid var(--color-border-glass); padding-top: 1.5rem; margin-top: 2rem;">
            <p class="text-muted">Contact Support: <a href="mailto:${policy.contactEmail}"><strong>${policy.contactEmail}</strong></a></p>
            ${renderExtraContact(policy)}
          </div>
        </div>
      </section>
    </main>
    ${FooterComponent.render()}
  `;

  initThemeEngine();
}

function renderExtraContact(policy: ILegalPolicy): string {
  const phone = policy.contactPhone
    ? `<p class="text-muted">Phone: <a href="tel:${CONTACT_DETAILS.phoneE164}"><strong>${policy.contactPhone}</strong></a></p>`
    : '';
  const address = policy.contactAddress
    ? `<address class="text-muted" style="font-style: normal;">Office: ${policy.contactAddress.join(', ')}</address>`
    : '';
  return phone + address;
}

function getPolicyData(policyType: PolicyType): ILegalPolicy {
  if (policyType === 'privacy') return LegalPolicyStore.getPrivacyPolicy();
  if (policyType === 'terms') return LegalPolicyStore.getTermsOfService();
  if (policyType === 'refund') return LegalPolicyStore.getRefundPolicy();
  if (policyType === 'contact') return LegalPolicyStore.getContactPage();
  return LegalPolicyStore.getDataDeletionInstructions();
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('privacy')) renderLegalPage('privacy');
    else if (path.includes('terms')) renderLegalPage('terms');
    else if (path.includes('refund')) renderLegalPage('refund');
    else if (path.includes('contact')) renderLegalPage('contact');
    else if (path.includes('deletion')) renderLegalPage('deletion');
  });
}
