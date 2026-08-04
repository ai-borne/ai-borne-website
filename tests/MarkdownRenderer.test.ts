import { describe, it, expect } from 'vitest';
import { MarkdownRenderer } from '../src/services/MarkdownRenderer';

describe('MarkdownRenderer (TDD & Guardrails)', () => {
  it('parses markdown bold syntax into HTML strong tags without raw syntax leaks', () => {
    const input = '1. **On-Device Execution**: Utilizing localized parsers.';
    const output = MarkdownRenderer.render(input);

    expect(output).toContain('<strong>On-Device Execution</strong>');
    expect(output).not.toContain('**');
  });

  it('parses code blocks with theme-adaptive CSS classes instead of inline hardcoded styles', () => {
    const input = '```kotlin\nval parser = LocalPdfParser()\n```';
    const output = MarkdownRenderer.render(input);

    // Must use CSS class .code-block for Option B theme-adaptive styling
    expect(output).toContain('class="code-block"');

    // Guardrail: MUST NOT contain hardcoded inline hex style strings like background: #1e293b
    expect(output).not.toContain('background: #');
    expect(output).not.toContain('background:#');
    expect(output).not.toContain('style="background');
  });

  it('parses links, italics, and list items cleanly', () => {
    const input = '* [AI-Borne](https://ai-borne.in) - *Privacy-first* tools.';
    const output = MarkdownRenderer.render(input);

    expect(output).toContain('<a href="https://ai-borne.in"');
    expect(output).toContain('<em>Privacy-first</em>');
    expect(output).not.toContain('*Privacy-first*');
    expect(output).not.toContain('[AI-Borne]');
  });

  it('guardrail: ensures rendered HTML contains zero hardcoded inline hex colors', () => {
    const sampleMarkdown = `
# Title
## Subtitle
* Item with **bold text**
\`\`\`ts
const x = 1;
\`\`\`
    `;
    const html = MarkdownRenderer.render(sampleMarkdown);

    // Regex check for hardcoded hex colors like #1e293b, #0f172a, etc. in inline styles
    const hexColorRegex = /style="[^"]*#(?:[0-9a-fA-F]{3}){1,2}[^"]*"/;
    expect(hexColorRegex.test(html)).toBe(false);
  });
});
