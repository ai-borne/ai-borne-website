import { describe, it, expect } from 'vitest';
import { LegalPolicyStore } from '../src/store/LegalPolicyStore';

describe('LegalPolicyStore', () => {
  it('provides a compliant Privacy Policy covering PayslipMax and zero server storage', () => {
    const privacy = LegalPolicyStore.getPrivacyPolicy();
    expect(privacy.title).toBe('Privacy Policy');
    expect(privacy.contactEmail).toBe('founder@ai-borne.in');
    expect(privacy.sections.length).toBeGreaterThanOrEqual(5);

    const allContent = privacy.sections.flatMap((s) => [s.heading, ...s.body]).join(' ');
    expect(allContent).toContain('PayslipMax');
    expect(allContent).toContain('locally on your device');
    expect(allContent).toContain('Zero Server Uploads');
    expect(allContent).toContain('RevenueCat');
  });

  it('provides comprehensive Terms of Service covering subscriptions and EULA', () => {
    const terms = LegalPolicyStore.getTermsOfService();
    expect(terms.title).toBe('Terms of Service');
    expect(terms.contactEmail).toBe('founder@ai-borne.in');
    expect(terms.sections.length).toBeGreaterThanOrEqual(4);

    const allContent = terms.sections.flatMap((s) => [s.heading, ...s.body]).join(' ');
    expect(allContent).toContain('PayslipMax');
    expect(allContent).toContain('Subscriptions');
    expect(allContent).toContain('Disclaimer');
  });

  it('provides actionable Data Deletion instructions with SLA', () => {
    const deletion = LegalPolicyStore.getDataDeletionInstructions();
    expect(deletion.title).toBe('Data & Account Deletion Request');
    expect(deletion.contactEmail).toBe('founder@ai-borne.in');

    const allContent = deletion.sections.flatMap((s) => [s.heading, ...s.body]).join(' ');
    expect(allContent).toContain('founder@ai-borne.in');
    expect(allContent).toContain('30 days');
  });
});
