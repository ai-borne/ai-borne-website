import '../styles/tokens.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/utils.css';
import { ILegalPolicy } from '../models/LegalPolicy';
import { LegalPolicyStore } from '../store/LegalPolicyStore';
import { HeaderComponent } from '../views/HeaderComponent';
import { FooterComponent } from '../views/FooterComponent';
import { initThemeEngine } from '../services/ThemeInitializer';
import { StringResources } from '../store/StringResources';

type PolicyType = 'privacy' | 'terms' | 'refund' | 'contact' | 'deletion';

export function renderLegalPage(policyType: PolicyType): void {
  const policy = getPolicyData(policyType);
  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = `
    ${HeaderComponent.render(policyType)}
    <main class="main-content">
      <section class="container hero mb-md">
        <h1 class="hero-title">${policy.title}</h1>
        <p class="text-muted">${StringResources.getStrings().legal.lastUpdated}: ${policy.lastUpdated} | ${StringResources.getStrings().legal.effectiveDate}: ${policy.effectiveDate}</p>
      </section>

      <section class="container section">
        <div class="card legal-card">
          ${policy.sections
            .map(
              (section) => `
            <div class="legal-section">
              <h2 class="legal-heading">${section.heading}</h2>
              ${section.body.map((p) => `<p class="text-muted mb-md">${p}</p>`).join('')}
            </div>
          `
            )
            .join('')}

          <div class="legal-contact">
            <p class="text-muted">${StringResources.getStrings().legal.contactSupport}: <a href="mailto:${policy.contactEmail}"><strong>${policy.contactEmail}</strong></a></p>
          </div>
        </div>
      </section>
    </main>
    ${FooterComponent.render()}
  `;

  initThemeEngine();
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
