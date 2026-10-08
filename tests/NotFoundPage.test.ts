import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { StringResources } from '../src/store/StringResources';

const root = path.resolve(__dirname, '..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

// Why: Cloudflare Pages falls back to index.html (HTTP 200) for unknown URLs unless a
// 404.html is shipped. Soft-404s hurt SEO and hide broken links, so the page must exist.
describe('Real 404 handling', () => {
  it('ships a 404.html entry through the Vite build', () => {
    expect(fs.existsSync(path.join(root, '404.html'))).toBe(true);
    expect(read('vite.config.ts')).toContain("'404.html'");
  });

  it('keeps the 404 page out of search indexes', () => {
    expect(read('404.html')).toContain('<meta name="robots" content="noindex" />');
  });

  it('loads its copy from string resources, never hardcoded', () => {
    const { notFound } = StringResources.getStrings();
    expect(notFound.title).not.toBe('');
    expect(read('src/ts/notFound.ts')).toContain('strings.notFound.title');
  });

  // Why: a service worker navigation fallback would mask unknown URLs with the home page
  // for returning visitors even after the edge returns a real 404.
  it('disables the service worker catch-all navigation fallback', () => {
    expect(read('vite.config.ts')).toContain('navigateFallback: null');
  });
});
