import { describe, it, expect } from 'vitest';
import { MarkdownPostLoader } from '../src/services/MarkdownPostLoader';
import { MarkdownRenderer } from '../src/services/MarkdownRenderer';

describe('Codebase Architecture & Style Guardrails', () => {
  it('guardrail: all loaded markdown posts parse cleanly without raw formatting tokens (** or __)', () => {
    const posts = MarkdownPostLoader.loadPosts();
    expect(posts.length).toBeGreaterThan(0);

    for (const post of posts) {
      const renderedHtml = MarkdownRenderer.render(post.contentMarkdown);

      // Raw formatting token guardrails
      expect(renderedHtml).not.toContain('**');
      expect(renderedHtml).not.toContain('__');
      expect(renderedHtml).not.toMatch(/\[.+\]\(http.+\)/);
    }
  });

  it('guardrail: code blocks always use theme-adaptive .code-block class and zero hardcoded hex backgrounds', () => {
    const posts = MarkdownPostLoader.loadPosts();
    for (const post of posts) {
      const renderedHtml = MarkdownRenderer.render(post.contentMarkdown);
      if (renderedHtml.includes('<code')) {
        // Enforce class attribute usage
        expect(renderedHtml).toContain('class="code-block"');
        // Enforce zero inline style hex backgrounds
        expect(renderedHtml).not.toContain('background: #');
        expect(renderedHtml).not.toContain('background:#');
      }
    }
  });

  it('guardrail: markdown post loader handles edge cases gracefully', () => {
    const invalidYaml = `
---
invalid: true
---
Some body text
    `;
    const parsed = MarkdownPostLoader.parseFrontmatter(invalidYaml);
    expect(parsed).toBeNull();
  });
});
