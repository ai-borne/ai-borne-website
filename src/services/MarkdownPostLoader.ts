import { IBlogPost } from '../models/BlogPost';

export class MarkdownPostLoader {
  public static loadPosts(): IBlogPost[] {
    const glob = import.meta.glob('/content/blog/*.md', { query: '?raw', eager: true }) as Record<string, string | { default: string }>;
    const posts: IBlogPost[] = [];

    for (const path in glob) {
      const item = glob[path];
      const rawContent = typeof item === 'string' ? item : item?.default || '';
      if (rawContent) {
        const parsed = this.parseFrontmatter(rawContent);
        if (parsed) {
          posts.push(parsed);
        }
      }
    }

    return posts.sort(
      (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );
  }

  public static parseFrontmatter(rawContent: string): IBlogPost | null {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
    const match = rawContent.match(frontmatterRegex);

    if (!match) return null;

    const yamlBlock = match[1];
    const contentMarkdown = match[2].trim();

    const metadata: Record<string, string> = {};
    const lines = yamlBlock.split(/\r?\n/);

    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim();
        let val = line.slice(colonIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        metadata[key] = val;
      }
    }

    if (!metadata.slug || !metadata.title) return null;

    return {
      slug: metadata.slug,
      title: metadata.title,
      summary: metadata.summary || '',
      category: (metadata.category as any) || 'App Engineering',
      publishedDate: metadata.publishedDate || '',
      author: metadata.author || 'AI-Borne Team',
      readTimeMinutes: metadata.readTimeMinutes ? parseInt(metadata.readTimeMinutes, 10) : 5,
      contentMarkdown,
    };
  }
}
