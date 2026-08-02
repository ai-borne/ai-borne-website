import { describe, it, expect } from 'vitest';
import { BlogViewModel } from '../src/viewmodels/BlogViewModel';

describe('BlogViewModel (MVVM)', () => {
  it('loads all articles by default', () => {
    const viewModel = new BlogViewModel();
    const posts = viewModel.getPosts();
    expect(posts.length).toBeGreaterThan(0);
  });

  it('filters articles by category', () => {
    const viewModel = new BlogViewModel();
    viewModel.setCategoryFilter('App Engineering');
    const filtered = viewModel.getPosts();
    expect(filtered.every((p) => p.category === 'App Engineering')).toBe(true);
  });

  it('searches articles by keyword', () => {
    const viewModel = new BlogViewModel();
    viewModel.setSearchQuery('Multiplatform');
    const results = viewModel.getPosts();
    expect(results.length).toBe(1);
    expect(results[0].title).toContain('Multiplatform');
  });
});
