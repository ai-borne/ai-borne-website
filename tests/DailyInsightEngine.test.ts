import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  sanitizeSlug,
  computeReadTime,
  validatePlaybook,
  formatPostToMarkdown,
  selectFromBacklog,
  updateDiscoveryFiles,
  runDailyEngine,
} from '../scripts/generate-daily-insight';
import { IBlogPost } from '../src/models/BlogPost';
import { MarkdownPostLoader } from '../src/services/MarkdownPostLoader';

describe('Phase 5: Autonomous Daily Ingestion Engine & Quality Gate', () => {
  const sampleValidPost: IBlogPost = {
    slug: 'sqlite-wal-concurrency-on-device',
    title: 'Sub-Millisecond SQLite on Mobile: Optimizing WAL Mode & Custom Pragmas in PayslipMax',
    summary: 'How we tuned SQLite WAL journaling, memory-mapped I/O, and custom pragmas for zero-jank on-device indexing.',
    category: 'App Engineering',
    publishedDate: '2026-09-22',
    author: 'AI-Borne Engineering',
    readTimeMinutes: 4,
    metricBadge: '⚡ 0.8ms DB Reads',
    difficulty: 'Advanced',
    tags: ['SQLite', 'Performance', 'On-Device', 'Mobile Architecture'],
    contentMarkdown: `High-frequency document parsing demands an underlying persistence layer capable of sub-millisecond lookups.

## In 30 Seconds

* **Write-Ahead Logging (WAL)**: Decouples concurrent readers from writers.
* **Memory-Mapped I/O**: Direct page access via mmap reduces context switches.
* **Synchronous Normal**: Sacrifices zero durability while doubling throughput.
* **Deterministic Sandboxing**: All encryption keys reside in hardware keystores.

## Architecture Blueprint

\`\`\`
+-----------------------------------------------------------+
|                   Main UI Thread (Compose)                |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|               SQLite WAL Memory-Mapped Pages              |
+-----------------------------------------------------------+
\`\`\`

## Architecture Comparison

| Feature | Default SQLite | PayslipMax WAL Engine |
| :--- | :--- | :--- |
| **Journaling** | Rollback Journal | Write-Ahead Logging |
| **Concurrency** | Exclusive Lock | Concurrent Readers |

## Production Implementation Pattern

\`\`\`kotlin
fun configureProductionDatabase(connection: SQLiteConnection) {
    connection.prepareStatement("PRAGMA journal_mode = WAL;").use { it.step() }
}
\`\`\`

## Battle Scars & Hard Lessons Learned

1. Long-running transactions cause checkpoint starvation.
2. Normal synchrony is resilient to app crashes.`,
  };

  describe('Slug & Text Processing Utilities', () => {
    it('sanitizes titles into kebab-case slugs', () => {
      expect(sanitizeSlug('Sub-Millisecond SQLite on Mobile: Part 1!')).toBe('sub-millisecond-sqlite-on-mobile-part-1');
      expect(sanitizeSlug('   Multi-Agent   AI -- Scoring   ')).toBe('multi-agent-ai-scoring');
      expect(sanitizeSlug('Zero-Trust & CI/CD Pipelines')).toBe('zero-trust-ci-cd-pipelines');
    });

    it('computes accurate reading time based on word count', () => {
      expect(computeReadTime('')).toBe(1);
      const shortText = 'word '.repeat(100);
      expect(computeReadTime(shortText)).toBe(1);
      const mediumText = 'word '.repeat(450);
      expect(computeReadTime(mediumText)).toBe(3);
    });
  });

  describe('Playbook Validation & Guardrails Enforcement', () => {
    it('validates a well-formed playbook adhering to all 5 hooks', () => {
      const result = validatePlaybook(sampleValidPost, new Set());
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('rejects slug collisions with existing playbooks', () => {
      const existing = new Set(['sqlite-wal-concurrency-on-device']);
      const result = validatePlaybook(sampleValidPost, existing);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Slug collision'))).toBe(true);
    });

    it('rejects slugs with invalid characters or format', () => {
      const invalidPost = { ...sampleValidPost, slug: 'Invalid_Slug_With_Underscores!' };
      const result = validatePlaybook(invalidPost, new Set());
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid slug format'))).toBe(true);
    });

    it('strictly prohibits "Multiplatform" keyword to preserve BlogViewModel test assertion', () => {
      const violatingTitle = {
        ...sampleValidPost,
        slug: 'multiplatform-architecture-guide',
        title: 'Building Modern Multiplatform Mobile Applications',
      };
      const resultTitle = validatePlaybook(violatingTitle, new Set());
      expect(resultTitle.valid).toBe(false);
      expect(resultTitle.errors.some((e) => e.includes('Multiplatform'))).toBe(true);

      const violatingSummary = {
        ...sampleValidPost,
        slug: 'modern-mobile-applications-guide',
        summary: 'Deep dive into multiplatform code sharing patterns across iOS and Android.',
      };
      const resultSummary = validatePlaybook(violatingSummary, new Set());
      expect(resultSummary.valid).toBe(false);
      expect(resultSummary.errors.some((e) => e.includes('Multiplatform'))).toBe(true);
    });

    it('enforces all 5 high-traction hooks in article markdown', () => {
      const missingHooksPost: IBlogPost = {
        ...sampleValidPost,
        slug: 'incomplete-article-hook-test',
        contentMarkdown: 'Just a plain paragraph without any structured sections.',
      };

      const result = validatePlaybook(missingHooksPost, new Set());
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('## In 30 Seconds'))).toBe(true);
      expect(result.errors.some((e) => e.includes('Architecture Blueprint'))).toBe(true);
      expect(result.errors.some((e) => e.includes('markdown table'))).toBe(true);
      expect(result.errors.some((e) => e.includes('code recipe block'))).toBe(true);
    });

    it('rejects unparsed raw formatting tokens (** or __) in markdown body', () => {
      const unclosedBoldPost: IBlogPost = {
        ...sampleValidPost,
        slug: 'unclosed-token-test',
        contentMarkdown: `${sampleValidPost.contentMarkdown}\n\nHere is an **unclosed bold string with no ending asterisks.`,
      };

      const result = validatePlaybook(unclosedBoldPost, new Set());
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('raw unparsed "**" tokens'))).toBe(true);
    });
  });

  describe('Frontmatter Serialization & MarkdownPostLoader Interoperability', () => {
    it('serializes playbook to markdown and parses back cleanly with MarkdownPostLoader', () => {
      const serialized = formatPostToMarkdown(sampleValidPost);
      expect(serialized).toContain('---');
      expect(serialized).toContain(`slug: ${sampleValidPost.slug}`);
      expect(serialized).toContain(`title: ${sampleValidPost.title}`);

      const parsed = MarkdownPostLoader.parseFrontmatter(serialized);
      expect(parsed).not.toBeNull();
      expect(parsed?.slug).toBe(sampleValidPost.slug);
      expect(parsed?.title).toBe(sampleValidPost.title);
      expect(parsed?.category).toBe(sampleValidPost.category);
      expect(parsed?.difficulty).toBe(sampleValidPost.difficulty);
      expect(parsed?.metricBadge).toBe(sampleValidPost.metricBadge);
      expect(parsed?.tags).toContain('SQLite');
    });
  });

  describe('Curated Backlog Queue & Resilient Fallback', () => {
    it('selects next uncommitted playbook from backlog', () => {
      const emptySet = new Set<string>();
      const candidate = selectFromBacklog(emptySet);
      expect(candidate).not.toBeNull();
      expect(candidate?.slug).toBe('sqlite-wal-concurrency-on-device');

      // When first is present, selects second
      const withFirst = new Set(['sqlite-wal-concurrency-on-device']);
      const secondCandidate = selectFromBacklog(withFirst);
      expect(secondCandidate).not.toBeNull();
      expect(secondCandidate?.slug).toBe('deterministic-eval-harness-llm-agents');
    });

    it('all backlog items pass complete playbook validation', () => {
      const existing = new Set<string>();
      let candidate = selectFromBacklog(existing);
      let count = 0;

      while (candidate) {
        count++;
        const validation = validatePlaybook(candidate, existing);
        expect(validation.valid, `Backlog item ${candidate.slug} failed: ${validation.errors.join(', ')}`).toBe(true);
        existing.add(candidate.slug);
        candidate = selectFromBacklog(existing);
      }

      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Discovery Files Updater & Dry Run Engine', () => {
    it('dry-run execution successfully validates without writing to disk', async () => {
      const result = await runDailyEngine({ dryRun: true });
      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.post).toBeDefined();
    });

    it('updateDiscoveryFiles safely modifies sitemap and llms.txt strings', () => {
      const tempDir = path.resolve(__dirname, '..', 'dist', 'temp-test-discovery');
      fs.mkdirSync(path.join(tempDir, 'public'), { recursive: true });

      const initialSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
      const initialLlms = `# Studio\n## Engineering Knowledge Base & Playbooks\n## Full Documentation\n`;

      const sitemapPath = path.join(tempDir, 'public', 'sitemap.xml');
      const llmsPath = path.join(tempDir, 'public', 'llms.txt');
      fs.writeFileSync(sitemapPath, initialSitemap, 'utf-8');
      fs.writeFileSync(llmsPath, initialLlms, 'utf-8');

      updateDiscoveryFiles(sampleValidPost, tempDir);

      const updatedSitemap = fs.readFileSync(sitemapPath, 'utf-8');
      expect(updatedSitemap).toContain(`<loc>https://ai-borne.in/blog/post.html?slug=${sampleValidPost.slug}</loc>`);
      expect(updatedSitemap).toContain(`<lastmod>${sampleValidPost.publishedDate}</lastmod>`);

      const updatedLlms = fs.readFileSync(llmsPath, 'utf-8');
      expect(updatedLlms).toContain(`https://ai-borne.in/blog/post.html?slug=${sampleValidPost.slug}`);
      expect(updatedLlms).toContain(sampleValidPost.title);

      // Clean up temp test dir
      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  });
});
