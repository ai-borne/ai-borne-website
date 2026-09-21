import { marked } from 'marked';

export class MarkdownRenderer {
  public static render(markdown: string): string {
    if (!markdown) return '';

    // Parse GitHub Flavored Markdown using marked
    const parsed = marked.parse(markdown, { gfm: true, breaks: true });
    const rawHtml = typeof parsed === 'string' ? parsed : '';

    // Sanitize output HTML to prevent XSS while preserving legitimate markdown structures
    const sanitizedHtml = this.sanitizeHtml(rawHtml);

    // Wrap pre tags with .code-block class for Option B theme-adaptive code styling
    return sanitizedHtml.replace(/<pre>/g, '<pre class="code-block">');
  }

  private static sanitizeHtml(html: string): string {
    let clean = html;

    // 1. Remove dangerous script and style tags and their contents
    clean = clean.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
    clean = clean.replace(/<script\b[^>]*\/?>|<\/script\s*>/gi, '');
    clean = clean.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '');
    clean = clean.replace(/<style\b[^>]*\/?>|<\/style\s*>/gi, '');

    // 2. Remove dangerous structural/embedding tags
    clean = clean.replace(/<\/?(?:iframe|object|embed|form|meta|link|base)\b[^>]*\/?>/gi, '');

    // 3. Strip inline event handlers (e.g. onload, onerror, onclick, onmouseover)
    clean = clean.replace(/\s*on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // 4. Neutralize dangerous javascript:, vbscript:, and data: URL schemes in href and src
    clean = clean.replace(/\b(href|src)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi, (match, attr, _q, val1, val2, val3) => {
      const urlVal = (val1 ?? val2 ?? val3 ?? '').trim();
      const normalizedUrl = urlVal.replace(/[\x00-\x1f\x7f\s]+/g, '').toLowerCase();
      if (
        normalizedUrl.startsWith('javascript:') ||
        normalizedUrl.startsWith('vbscript:') ||
        normalizedUrl.startsWith('data:text/html')
      ) {
        return `${attr}="#"`;
      }
      return match;
    });

    return clean;
  }
}
