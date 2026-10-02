/**
 * Small, dependency-free boundary for values that cross into an HTML template.
 * Content authored in TypeScript remains trusted; Markdown has its own sanitizer.
 */
export class HtmlSafety {
  public static escapeText(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  public static safeInternalUrl(value: unknown, fallback = '#'): string {
    const url = String(value ?? '').trim();
    return /^(?:\/(?!\/)|\.\.?\/|#)[^\s]*$/.test(url) ? url : fallback;
  }

  public static safeExternalUrl(value: unknown): string | null {
    try {
      const url = new URL(String(value ?? ''));
      return url.protocol === 'https:' ? url.href : null;
    } catch {
      return null;
    }
  }

  /** JSON for a script element: prevent an HTML parser script-end sentinel. */
  public static stringifyJsonForScript(value: unknown): string {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  }
}
