import { describe, it, expect } from 'vitest';
import { SiteDataStore } from '../src/store/SiteDataStore';
import { LegalPolicyStore } from '../src/store/LegalPolicyStore';

describe('SiteDataStore & LegalPolicyStore (SSOT)', () => {
  it('returns valid studio configuration', () => {
    const config = SiteDataStore.getConfig();
    expect(config.studioName).toBe('AI-Borne');
    expect(config.domain).toBe('ai-borne.in');
    expect(config.supportEmail).toBe('founder@ai-borne.in');
  });

  it('returns registered apps metadata', () => {
    const apps = SiteDataStore.getApps();
    expect(apps.length).toBe(6);
    
    const payslipMax = SiteDataStore.getAppById('payslipmax');
    expect(payslipMax).toBeDefined();
    expect(payslipMax?.name).toBe('PayslipMax');

    const ssbMax = SiteDataStore.getAppById('ssbmax');
    expect(ssbMax).toBeDefined();
    expect(ssbMax?.name).toBe('SSBMax');

    const yogaOfEating = SiteDataStore.getAppById('yoga-of-eating');
    expect(yogaOfEating).toBeDefined();
    expect(yogaOfEating?.name).toBe('Yoga of Eating');

    const actionStation = SiteDataStore.getAppById('action-station');
    expect(actionStation).toBeDefined();
    expect(actionStation?.name).toBe('ActionStation');

    const defenceWire = SiteDataStore.getAppById('defencewire');
    expect(defenceWire).toBeDefined();
    expect(defenceWire?.name).toBe('DefenceWire.in');

    const secureMax = SiteDataStore.getAppById('securemax');
    expect(secureMax).toBeDefined();
    expect(secureMax?.name).toBe('SecureMax');
  });

  it('returns published blog posts with complete metadata across all 8 playbooks', () => {
    const posts = SiteDataStore.getPosts();
    expect(posts.length).toBe(8);

    const expectedSlugs = [
      'privacy-first-local-pdf-parsing',
      'kotlin-multiplatform-automation-patterns',
      'solo-developer-agentic-productivity-playbook',
      'zero-trust-cicd-supply-chain-hardening',
      'real-time-edge-intelligence-architecture',
      'multi-agent-ai-scoring-engine-architecture',
      'building-infinite-canvas-spatial-workspaces',
      'enterprise-physical-security-threat-intelligence'
    ];

    for (const slug of expectedSlugs) {
      const post = SiteDataStore.getPostBySlug(slug);
      expect(post, `Post ${slug} should exist`).toBeDefined();
      expect(post?.title.length).toBeGreaterThan(10);
      expect(post?.summary.length).toBeGreaterThan(20);
      expect(post?.metricBadge).toBeDefined();
      expect(post?.difficulty).toBeDefined();
      expect(post?.tags?.length).toBeGreaterThan(0);
      expect(post?.contentMarkdown.length).toBeGreaterThan(100);
    }
  });

  it('returns compliant legal policies with support email', () => {
    const privacy = LegalPolicyStore.getPrivacyPolicy();
    expect(privacy.title).toBe('Privacy Policy');
    expect(privacy.contactEmail).toBe('founder@ai-borne.in');
    expect(privacy.sections.length).toBeGreaterThan(0);

    const deletion = LegalPolicyStore.getDataDeletionInstructions();
    expect(deletion.title).toContain('Data & Account Deletion');
    expect(deletion.contactEmail).toBe('founder@ai-borne.in');
  });
});
