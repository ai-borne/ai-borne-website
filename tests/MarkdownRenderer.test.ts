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

  it('neutralizes dangerous script, iframe, and form tags to prevent XSS', () => {
    const maliciousInput = `
# Blog Post
<script>alert('xss')</script>
<iframe src="https://evil.com"></iframe>
<form action="https://evil.com/steal"><input type="text"/></form>
<object data="data:text/html;base64,..."></object>
<embed src="evil.swf"/>
Normal content continues here.
    `;
    const sanitized = MarkdownRenderer.render(maliciousInput);

    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('alert(\'xss\')');
    expect(sanitized).not.toContain('<iframe');
    expect(sanitized).not.toContain('<form');
    expect(sanitized).not.toContain('<object');
    expect(sanitized).not.toContain('<embed');
    expect(sanitized).toContain('Normal content continues here.');
  });

  it('strips inline event handlers from HTML tags', () => {
    const input = '<img src="valid.png" onerror="alert(1)" onload="evil()" />\n<p onclick="steal()">Text</p>';
    const output = MarkdownRenderer.render(input);

    expect(output).not.toContain('onerror=');
    expect(output).not.toContain('onload=');
    expect(output).not.toContain('onclick=');
    expect(output).toContain('src="valid.png"');
    expect(output).toContain('Text');
  });

  it('neutralizes dangerous javascript: URI links into safe href="#"', () => {
    const maliciousLink = '[Click me](javascript:alert("pwned"))';
    const output = MarkdownRenderer.render(maliciousLink);

    expect(output).not.toContain('href="javascript:');
    expect(output).toContain('href="#"');
    expect(output).toContain('Click me');
  });

  it('preserves code snippets containing script tags without executing or stripping them from code blocks', () => {
    const codeSnippet = '```html\n<script>console.log("safe example");</script>\n```';
    const output = MarkdownRenderer.render(codeSnippet);

    // Should be wrapped with code-block class
    expect(output).toContain('class="code-block"');
    // The tags inside the code block must be escaped entities, not stripped
    expect(output).toContain('&lt;script&gt;console.log(&quot;safe example&quot;);&lt;/script&gt;');
  });
});
