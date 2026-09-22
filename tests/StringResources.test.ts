import { describe, it, expect } from 'vitest';
import { StringResources } from '../src/store/StringResources';

describe('StringResources (SSOT)', () => {
  it('returns valid navigation string resources', () => {
    const strings = StringResources.getStrings();
    expect(strings.nav.home).toBe('Home');
    expect(strings.nav.apps).toBe('Apps');
    expect(strings.nav.insights).toBe('Insights');
    expect(strings.nav.support).toBe('Support');
  });

  it('returns valid hero and cta string resources', () => {
    const strings = StringResources.getStrings();
    expect(strings.hero.badge).toBe('Indie Software Studio');
    expect(strings.hero.ctaExplore).toBe('Explore App Suite');
    expect(strings.hero.tagline).toContain('AI Solutions');
  });

  it('returns valid PayslipMax store compliance string resources', () => {
    const strings = StringResources.getStrings();
    expect(strings.payslipmax.complianceTitle).toBe('Store Compliance & Legal');
    expect(strings.payslipmax.privacyCardTitle).toBe('Privacy Policy');
    expect(strings.payslipmax.termsCardTitle).toBe('Terms of Service');
    expect(strings.payslipmax.deletionCardTitle).toBe('Data Deletion & Retention');
  });

  it('returns valid support center and footer resources', () => {
    const strings = StringResources.getStrings();
    expect(strings.support.title).toBe('Developer Support Center');
    expect(strings.support.sendButton).toBe('Send Message');
    expect(strings.footer.copyright).toContain('AI-BORNE');
  });

  it('returns valid DefenceWire string resources', () => {
    const strings = StringResources.getStrings();
    expect(strings.defencewire.badge).toBe('Defense & Strategic Intelligence');
    expect(strings.defencewire.keyFeaturesTitle).toContain('Key Capabilities');
    expect(strings.defencewire.launchButton).toContain('DefenceWire.in');
  });

  it('returns valid SecureMax string resources', () => {
    const strings = StringResources.getStrings();
    expect(strings.securemax.badge).toBe('Enterprise & Physical Security');
    expect(strings.securemax.keyFeaturesTitle).toContain('Key Capabilities');
    expect(strings.securemax.launchButton).toContain('Security Platform');
  });

  it('returns valid blog knowledge base and home insights string resources', () => {
    const strings = StringResources.getStrings();
    expect(strings.home.exploreAllInsights).toContain('Explore All Insights');
    expect(strings.home.readArticle).toBe('Read Article →');
    expect(strings.home.viewAllInsightsLink).toContain('View all');

    expect(strings.blog.title).toBe('Insights & Engineering Playbooks');
    expect(strings.blog.searchPlaceholder).toContain('Search playbooks');
    expect(strings.blog.filterAll).toBe('All Categories');
    expect(strings.blog.filterAppEngineering).toBe('App Engineering');
    expect(strings.blog.filterAutomation).toBe('Automation');
    expect(strings.blog.filterAi).toBe('AI');
    expect(strings.blog.filterTaxTech).toBe('Tax Tech');
    expect(strings.blog.readArticle).toBe('Read Article →');
    expect(strings.blog.exploreAllPlaybooks).toContain('Explore All Insights');
    expect(strings.blog.keyTakeawaysTitle).toBe('Key Engineering Takeaways');
    expect(strings.blog.relatedPlaybooksTitle).toBe('Related Engineering Playbooks');
    expect(strings.blog.emptyTitle).toContain('No engineering playbooks found');
    expect(strings.blog.backToAllArticles).toContain('Back to All Articles');
  });
});

