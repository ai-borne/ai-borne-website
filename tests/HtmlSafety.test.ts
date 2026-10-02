import { describe, expect, it } from 'vitest';
import { HtmlSafety } from '../src/services/HtmlSafety';

describe('HtmlSafety rendering boundaries', () => {
  it('escapes hostile frontmatter values before template interpolation', () => {
    expect(HtmlSafety.escapeText('<img src=x onerror=alert(1)>"')).toBe(
      '&lt;img src=x onerror=alert(1)&gt;&quot;'
    );
  });

  it('allows only local internal paths and HTTPS external launch URLs', () => {
    expect(HtmlSafety.safeInternalUrl('/blog/post.html?slug=known-post')).toBe('/blog/post.html?slug=known-post');
    expect(HtmlSafety.safeInternalUrl('//evil.example')).toBe('#');
    expect(HtmlSafety.safeInternalUrl('javascript:alert(1)')).toBe('#');
    expect(HtmlSafety.safeExternalUrl('https://ai-borne.in')).toBe('https://ai-borne.in/');
    expect(HtmlSafety.safeExternalUrl('data:text/html,payload')).toBeNull();
  });
});
