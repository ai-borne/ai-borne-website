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
    expect(strings.hero.ctaExplore).toBe('Explore PayslipMax');
    expect(strings.hero.tagline).toContain('AI Solutions');
  });

  it('returns valid support center and footer resources', () => {
    const strings = StringResources.getStrings();
    expect(strings.support.title).toBe('Developer Support Center');
    expect(strings.support.sendButton).toBe('Send Message');
    expect(strings.footer.copyright).toContain('AI-BORNE');
  });
});
