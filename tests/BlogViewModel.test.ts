import { describe, it, expect } from 'vitest';
import { BlogViewModel } from '../src/viewmodels/BlogViewModel';

describe('BlogViewModel (MVVM)', () => {
  it('loads all articles by default', () => {
    const viewModel = new BlogViewModel();
    const posts = viewModel.getPosts();
    expect(posts.length).toBeGreaterThan(0);
  });

  it('filters articles by category and clears filter when set to null', () => {
    const viewModel = new BlogViewModel();
    viewModel.setCategoryFilter('App Engineering');
    expect(viewModel.getCategoryFilter()).toBe('App Engineering');
    const filtered = viewModel.getPosts();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((p) => p.category === 'App Engineering')).toBe(true);

    // Reset filter
    viewModel.setCategoryFilter(null);
    expect(viewModel.getCategoryFilter()).toBeNull();
    const all = viewModel.getPosts();
    expect(all.length).toBeGreaterThanOrEqual(filtered.length);
  });

  it('searches articles by keyword and preserves exclusivity for Multiplatform', () => {
    const viewModel = new BlogViewModel();
    viewModel.setSearchQuery('Multiplatform');
    expect(viewModel.getSearchQuery()).toBe('multiplatform');
    const results = viewModel.getPosts();
    expect(results.length).toBe(1);
    expect(results[0].title).toContain('Multiplatform');
  });

  it('performs case-insensitive search across title and summary', () => {
    const viewModel = new BlogViewModel();
    viewModel.setSearchQuery('privacy-first');
    const results = viewModel.getPosts();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.slug === 'privacy-first-local-pdf-parsing')).toBe(true);
  });

  it('searches articles by tag when available', () => {
    const viewModel = new BlogViewModel();
    viewModel.setSearchQuery('KMP');
    const results = viewModel.getPosts();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.tags?.includes('KMP'))).toBe(true);
  });

  it('returns empty array when search query matches nothing', () => {
    const viewModel = new BlogViewModel();
    viewModel.setSearchQuery('nonexistent-query-xyz-12345');
    const results = viewModel.getPosts();
    expect(results).toEqual([]);
    expect(results.length).toBe(0);
  });

  it('returns unique categories with getCategories()', () => {
    const viewModel = new BlogViewModel();
    const categories = viewModel.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toContain('App Engineering');
    expect(categories).toContain('Automation');
    // Ensure no duplicates
    const unique = new Set(categories);
    expect(unique.size).toBe(categories.length);
  });

  it('computes accurate counts with getFilterCount()', () => {
    const viewModel = new BlogViewModel();
    const totalCount = viewModel.getFilterCount();
    expect(totalCount).toBeGreaterThan(0);

    const appEngCount = viewModel.getFilterCount('App Engineering');
    expect(appEngCount).toBeGreaterThan(0);
    expect(appEngCount).toBeLessThanOrEqual(totalCount);

    const allViaNull = viewModel.getFilterCount(null);
    expect(allViaNull).toBe(totalCount);

    // Active filter count
    viewModel.setCategoryFilter('App Engineering');
    expect(viewModel.getFilterCount()).toBe(appEngCount);
  });
});

