import { describe, it, expect } from 'vitest';
import { SiteDataStore } from '../src/store/SiteDataStore';
import { LegalPolicyStore } from '../src/store/LegalPolicyStore';

describe('SiteDataStore & LegalPolicyStore (SSOT)', () => {
  it('returns valid studio configuration', () => {
    const config = SiteDataStore.getConfig();
    expect(config.studioName).toBe('Action Station');
    expect(config.domain).toBe('ai-borne.in');
    expect(config.supportEmail).toBe('support@ai-borne.in');
  });

  it('returns registered apps metadata', () => {
    const apps = SiteDataStore.getApps();
    expect(apps.length).toBeGreaterThan(0);
    const payslipMax = SiteDataStore.getAppById('payslipmax');
    expect(payslipMax).toBeDefined();
    expect(payslipMax?.name).toBe('PayslipMax');
  });

  it('returns published blog posts', () => {
    const posts = SiteDataStore.getPosts();
    expect(posts.length).toBeGreaterThan(0);
    const post = SiteDataStore.getPostBySlug('privacy-first-local-pdf-parsing');
    expect(post).toBeDefined();
    expect(post?.category).toBe('App Engineering');
  });

  it('returns compliant legal policies with support email', () => {
    const privacy = LegalPolicyStore.getPrivacyPolicy();
    expect(privacy.title).toBe('Privacy Policy');
    expect(privacy.contactEmail).toBe('support@ai-borne.in');
    expect(privacy.sections.length).toBeGreaterThan(0);

    const deletion = LegalPolicyStore.getDataDeletionInstructions();
    expect(deletion.title).toContain('Data & Account Deletion');
    expect(deletion.contactEmail).toBe('support@ai-borne.in');
  });
});
