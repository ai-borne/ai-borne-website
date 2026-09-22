import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { StringResources } from '../src/store/StringResources';
import { HomeViewModel } from '../src/viewmodels/HomeViewModel';
import { BlogViewModel } from '../src/viewmodels/BlogViewModel';

describe('Phase 3: Interactive UI, Styling & Knowledge Hub Guardrails', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('verifies all Phase 3 UI copy exists in StringResources (SSOT)', () => {
    const strings = StringResources.getStrings();

    expect(strings.blog.in30SecondsTitle).toBe('⚡ In 30 Seconds');
    expect(strings.blog.copyCode).toBe('Copy');
    expect(strings.blog.copiedCode).toBe('Copied!');
    expect(strings.blog.breadcrumbAllInsights).toBe('All Insights');
    expect(strings.blog.articleNotFoundTitle).toBe('Article Not Found');
    expect(strings.blog.articleNotFoundDesc).toContain('does not exist or has been moved');
    expect(strings.blog.showingCount).toContain('Showing engineering playbooks');
    expect(strings.home.viewAllInsightsLink).toContain('View all');
    expect(strings.home.exploreAllInsights).toContain('Explore All Insights');
  });

  it('HomeViewModel supplies featured insight posts with metric badges', () => {
    const viewModel = new HomeViewModel();
    const featured = viewModel.getFeaturedInsightPosts(4);

    expect(featured.length).toBe(4);
    for (const post of featured) {
      expect(post.metricBadge).toBeDefined();
      expect(typeof post.metricBadge).toBe('string');
      expect(post.slug).toBeDefined();
      expect(post.title).toBeDefined();
      expect(post.category).toBeDefined();
    }
  });

  it('BlogViewModel provides category breakdown and filter counts for interactive pills', () => {
    const viewModel = new BlogViewModel();
    const categories = viewModel.getCategories();

    expect(categories.length).toBeGreaterThanOrEqual(3);
    for (const cat of categories) {
      const count = viewModel.getFilterCount(cat);
      expect(count).toBeGreaterThan(0);
    }
  });

  it('enforces that all Phase 3 CSS classes exist in src/styles/components.css', () => {
    const cssPath = path.join(rootDir, 'src', 'styles', 'components.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const expectedClasses = [
      '.reading-progress-bar',
      '.filter-pills',
      '.filter-pill',
      '.filter-pill.active',
      '.search-wrapper',
      '.search-input',
      '.card-metric-badge',
      '.article-callout',
      '.article-callout-title',
      '.code-block-wrapper',
      '.code-copy-btn',
      '.code-copy-btn.copied',
      '.article-body table',
      '.breadcrumbs',
      '.post-count-badge',
      '.insights-header-link',
    ];

    for (const className of expectedClasses) {
      expect(css, `Missing CSS class selector: ${className}`).toContain(className);
    }
  });

  it('guardrail: verifies Phase 3 CSS section strictly uses CSS variables with zero hardcoded hex colors', () => {
    const cssPath = path.join(rootDir, 'src', 'styles', 'components.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const phase3StartMarker = '/* Phase 3: Interactive UI, Knowledge Hub & Article Components */';
    expect(css).toContain(phase3StartMarker);

    const phase3Section = css.substring(css.indexOf(phase3StartMarker));
    const hexColorMatches = phase3Section.match(/#[0-9a-fA-F]{3,6}\b/g);

    expect(
      hexColorMatches,
      `Found hardcoded hex colors in Phase 3 CSS: ${hexColorMatches?.join(', ')}`
    ).toBeNull();
  });

  it('guardrail: verifies main.ts, blog.ts, and blogpost.ts remain strictly <= 300 LOC', () => {
    const targetFiles = ['main.ts', 'blog.ts', 'blogpost.ts'];

    for (const fileName of targetFiles) {
      const filePath = path.join(rootDir, 'src', 'ts', fileName);
      const lines = fs.readFileSync(filePath, 'utf-8').split('\n').length;

      expect(lines, `File ${fileName} exceeded 300 LOC (${lines} lines)`).toBeLessThanOrEqual(300);
    }
  });
});
