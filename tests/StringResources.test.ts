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
});
