import { marked } from 'marked';

/**
 * Enterprise MarkdownRenderer implementing OWASP ASVS V5 multi-pass HTML sanitization.
 * Defends against stored XSS, nested tag bypasses, protocol obfuscation, and DOM exfiltration.
 */
export class MarkdownRenderer {
  private static readonly DANGEROUS_PAIRED_TAGS =
    /<(script|style|svg|math|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;

  private static readonly DANGEROUS_STANDALONE_TAGS =
    /<\/?(script|style|svg|math|iframe|object|embed|form|meta|link|base|applet|frame|frameset)\b[^>]*\/?>/gi;

  private static readonly HTML_TAG_REGEX =
    /<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g;

  private static readonly EVENT_ATTR_REGEX =
    /(?:[\s/]+)on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;

  private static readonly URL_ATTR_REGEX =
    /\b(href|src|action|formaction)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

  public static render(markdown: string): string {
    if (!markdown) return '';

    // Parse GitHub Flavored Markdown using marked
    const parsed = marked.parse(markdown, { gfm: true, breaks: true });
    const rawHtml = typeof parsed === 'string' ? parsed : '';

    // Multi-pass sanitization pipeline (OWASP ASVS V5)
    const sanitizedHtml = this.sanitizeHtml(rawHtml);

    // Pass 4: Wrap pre tags with .code-block class for theme-adaptive styling
    return sanitizedHtml.replace(/<pre>/g, '<pre class="code-block">');
  }

  private static sanitizeHtml(html: string): string {
    // Pass 1: Recursive stripping of dangerous executable and embedding tags
    let clean = html;
    let prev = '';
    let iterations = 0;
    while (clean !== prev && iterations < 10) {
      prev = clean;
      iterations++;
      clean = clean
        .replace(this.DANGEROUS_PAIRED_TAGS, '')
        .replace(this.DANGEROUS_STANDALONE_TAGS, '');
    }

    // Pass 2 & 3: Strip event attributes and enforce protocol allowlist inside HTML tags
    clean = clean.replace(this.HTML_TAG_REGEX, (_, tagName, rawAttrs) => {
      let attrs = rawAttrs.replace(/[\x00-\x1f\x7f]+/g, '');

      // Pass 2: Strip all standard and non-standard event attributes
      let prevAttrs = '';
      while (attrs !== prevAttrs) {
        prevAttrs = attrs;
        attrs = attrs.replace(this.EVENT_ATTR_REGEX, '');
      }

      // Pass 3: Enforce strict URL protocol allowlist on navigation and source attributes
      attrs = attrs.replace(
        this.URL_ATTR_REGEX,
        (match: string, attr: string, q1?: string, q2?: string, q3?: string) => {
          const urlVal = (q1 ?? q2 ?? q3 ?? '').trim();
          if (this.isSafeUrl(urlVal)) {
            return match;
          }
          return `${attr}="#"`;
        }
      );

      return `<${tagName}${attrs}>`;
    });

    return clean;
  }

  private static isSafeUrl(rawUrl: string): boolean {
    if (!rawUrl) return false;
    const normalized = this.decodeAndNormalizeUrl(rawUrl);

    // Explicitly reject dangerous or executable schemes
    if (
      normalized.startsWith('javascript:') ||
      normalized.startsWith('vbscript:') ||
      normalized.startsWith('data:') ||
      normalized.startsWith('file:') ||
      normalized.startsWith('blob:')
    ) {
      return false;
    }

    // Allow safe absolute protocols, localhost/dev URLs, anchors, and relative paths
    if (
      normalized.startsWith('https://') ||
      normalized.startsWith('http://localhost') ||
      normalized.startsWith('http://127.0.0.1') ||
      normalized.startsWith('mailto:') ||
      normalized.startsWith('#') ||
      normalized.startsWith('/') ||
      normalized.startsWith('./') ||
      normalized.startsWith('../')
    ) {
      return true;
    }

    // Safe relative resource paths without scheme (e.g. 'hero.png', 'docs/guide.md')
    return !normalized.includes(':');
  }

  private static decodeAndNormalizeUrl(url: string): string {
    let decoded = url;
    for (let i = 0; i < 2; i++) {
      const next = decoded
        .replace(/&#x([0-9a-fA-F]+);?/gi, (_, hex) => {
          const code = parseInt(hex, 16);
          return isNaN(code) || code < 0 || code > 0x10ffff ? '' : String.fromCodePoint(code);
        })
        .replace(/&#([0-9]+);?/gi, (_, dec) => {
          const code = parseInt(dec, 10);
          return isNaN(code) || code < 0 || code > 0x10ffff ? '' : String.fromCodePoint(code);
        })
        .replace(/&colon;?/gi, ':')
        .replace(/&tab;?/gi, '\t')
        .replace(/&newline;?/gi, '\n');
      if (next === decoded) break;
      decoded = next;
    }

    return decoded.replace(/[\x00-\x1f\x7f\s]+/g, '').toLowerCase();
  }
}
