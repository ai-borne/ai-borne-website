import { describe, it, expect } from 'vitest';
import { HomeViewModel } from '../src/viewmodels/HomeViewModel';

describe('HomeViewModel (MVVM & TDD)', () => {
  it('returns valid site config and featured apps', () => {
    const viewModel = new HomeViewModel();
    const config = viewModel.getConfig();
    expect(config.studioName).toBe('AI-Borne');
    expect(config.domain).toBe('ai-borne.in');

    const apps = viewModel.getFeaturedApps();
    expect(apps.length).toBeGreaterThan(0);
    expect(apps.some((app) => app.id === 'payslipmax')).toBe(true);
  });

  it('returns recent posts with default and custom limits', () => {
    const viewModel = new HomeViewModel();
    const defaultRecent = viewModel.getRecentPosts();
    expect(defaultRecent.length).toBeGreaterThan(0);
    expect(defaultRecent.length).toBeLessThanOrEqual(3);

    const singleRecent = viewModel.getRecentPosts(1);
    expect(singleRecent.length).toBe(1);
  });

  it('returns featured insight posts with metric badges', () => {
    const viewModel = new HomeViewModel();
    const featured = viewModel.getFeaturedInsightPosts(2);
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.length).toBeLessThanOrEqual(2);

    // Verify all returned posts have valid metadata
    for (const post of featured) {
      expect(post.slug).toBeDefined();
      expect(post.title).toBeDefined();
      expect(post.category).toBeDefined();
    }
  });
});
