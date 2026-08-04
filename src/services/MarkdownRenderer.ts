import { marked } from 'marked';

export class MarkdownRenderer {
  public static render(markdown: string): string {
    if (!markdown) return '';

    // Parse GitHub Flavored Markdown using marked
    const parsed = marked.parse(markdown, { gfm: true, breaks: true });
    const rawHtml = typeof parsed === 'string' ? parsed : '';

    // Wrap pre tags with .code-block class for Option B theme-adaptive code styling
    return rawHtml.replace(/<pre>/g, '<pre class="code-block">');
  }
}
