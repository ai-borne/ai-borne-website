import * as fs from 'fs';
import * as path from 'path';
import { IBlogPost, BlogCategory } from '../src/models/BlogPost';
import { MarkdownRenderer } from '../src/services/MarkdownRenderer';
import { INSIGHT_BACKLOG } from './insight-backlog';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function sanitizeSlug(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function computeReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function validatePlaybook(post: IBlogPost, existingSlugs: Set<string>): ValidationResult {
  const errors: string[] = [];
  if (!post.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
    errors.push(`Invalid slug format: "${post.slug}" (must be kebab-case)`);
  }
  if (existingSlugs.has(post.slug)) {
    errors.push(`Slug collision: "${post.slug}" already exists`);
  }
  if (!post.title || post.title.trim().length < 10) {
    errors.push('Title must be at least 10 characters');
  }
  if (!post.summary || post.summary.trim().length < 20) {
    errors.push('Summary must be at least 20 characters');
  }
  // Exclusivity guardrail for BlogViewModel search test
  if (/\bmultiplatform\b/i.test(post.title) || /\bmultiplatform\b/i.test(post.summary)) {
    errors.push('Title and summary must not contain "Multiplatform" keyword (reserved for KMP test)');
  }
  const validCategories: BlogCategory[] = ['App Engineering', 'Automation', 'AI', 'Tax Tech'];
  if (!validCategories.includes(post.category)) {
    errors.push(`Invalid category: ${post.category}`);
  }

  // Hook validation
  const md = post.contentMarkdown || '';
  if (!md.includes('## In 30 Seconds')) errors.push('Missing "## In 30 Seconds" callout hook');
  if (!md.includes('## Architecture Blueprint') && !md.includes('```\n+--')) {
    errors.push('Missing Architecture Blueprint diagram hook');
  }
  if (!md.includes('|')) errors.push('Missing comparative markdown table hook');
  if (!md.includes('```')) errors.push('Missing code recipe block hook');

  // Guardrail validation: raw tokens
  const rendered = MarkdownRenderer.render(md);
  if (rendered.includes('**')) errors.push('Rendered HTML contains raw unparsed "**" tokens');
  if (rendered.includes('__')) errors.push('Rendered HTML contains raw unparsed "__" tokens');
  if (/\[.+\]\(http.+\)/.test(rendered)) errors.push('Rendered HTML contains unparsed markdown links');
  if (rendered.includes('<code') && !rendered.includes('class="code-block"')) {
    errors.push('Code block missing .code-block theme class');
  }

  return { valid: errors.length === 0, errors };
}

export function formatPostToMarkdown(post: IBlogPost): string {
  const tagsStr = (post.tags || []).map((t) => `'${t.replace(/'/g, '')}'`).join(', ');
  return `---
slug: ${post.slug}
title: ${post.title}
summary: ${post.summary}
category: ${post.category}
publishedDate: ${post.publishedDate}
author: ${post.author || 'AI-Borne Engineering'}
readTimeMinutes: ${post.readTimeMinutes}
metricBadge: ${post.metricBadge || '⚡ Production Ready'}
difficulty: ${post.difficulty || 'Advanced'}
tags: [${tagsStr}]
---

${post.contentMarkdown.trim()}
`;
}

export function selectFromBacklog(existingSlugs: Set<string>): IBlogPost | null {
  const item = INSIGHT_BACKLOG.find((p) => !existingSlugs.has(p.slug));
  if (!item) return null;
  const today = new Date().toISOString().split('T')[0];
  return {
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    category: item.category,
    publishedDate: today,
    author: 'AI-Borne Engineering',
    readTimeMinutes: computeReadTime(item.contentMarkdown),
    metricBadge: item.metricBadge,
    difficulty: item.difficulty,
    tags: item.tags,
    contentMarkdown: item.contentMarkdown,
  };
}

export async function fetchFromGemini(apiKey: string, existingSlugs: Set<string>): Promise<IBlogPost | null> {
  const prompt = `You are the Principal Systems Architect at AI-Borne Studio (ai-borne.in), founded by Sunil Pawar.
AI-Borne builds on-device, zero-trust platforms: PayslipMax (C++/Kotlin PDF parser), SSBMax (multi-agent OLQ evaluation), DefenceWire (edge caching & crawler), ActionStation (infinite canvas, ReactFlow, TipTap), and SecureMax (ASIS CPP physical security RAG).
Write a new, highly technical engineering deep-dive playbook.
Rules:
1. Category must be one of: 'App Engineering', 'Automation', 'AI', 'Tax Tech'.
2. DO NOT use the word "Multiplatform" in title or summary.
3. Must include 5 hooks: Provocative problem, "## In 30 Seconds" bullets, "## Architecture Blueprint" ASCII diagram, Comparison table with | syntax, Code snippet recipe with \`\`\` syntax, "## Battle Scars & Hard Lessons Learned".
4. Ensure all markdown bold ** and __ are properly closed.
5. Return ONLY a valid JSON object matching:
{
  "slug": "unique-kebab-slug",
  "title": "Clear Technical Title",
  "summary": "Crisp punchy summary under 160 characters",
  "category": "App Engineering",
  "metricBadge": "⚡ 12ms Latency",
  "difficulty": "Advanced",
  "tags": ["Tag1", "Tag2"],
  "contentMarkdown": "Full article markdown body starting after frontmatter"
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(text);
    const slug = sanitizeSlug(parsed.slug || '');
    if (!slug || existingSlugs.has(slug)) return null;
    const today = new Date().toISOString().split('T')[0];
    return {
      slug,
      title: parsed.title,
      summary: parsed.summary,
      category: parsed.category,
      publishedDate: today,
      author: 'AI-Borne Engineering',
      readTimeMinutes: computeReadTime(parsed.contentMarkdown || ''),
      metricBadge: parsed.metricBadge || '⚡ Engineered',
      difficulty: parsed.difficulty || 'Advanced',
      tags: parsed.tags || ['Engineering'],
      contentMarkdown: parsed.contentMarkdown || '',
    };
  } catch {
    return null;
  }
}

export function updateDiscoveryFiles(post: IBlogPost, rootDir: string): void {
  const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    let sitemap = fs.readFileSync(sitemapPath, 'utf-8');
    const pageUrl = `https://ai-borne.in/blog/post.html?slug=${post.slug}`;
    if (!sitemap.includes(pageUrl)) {
      const entry = `  <url>\n    <loc>${pageUrl}</loc>\n    <lastmod>${post.publishedDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
      fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
    }
  }

  const llmsPath = path.join(rootDir, 'public', 'llms.txt');
  if (fs.existsSync(llmsPath)) {
    let llms = fs.readFileSync(llmsPath, 'utf-8');
    const postLink = `https://ai-borne.in/blog/post.html?slug=${post.slug}`;
    if (!llms.includes(postLink)) {
      const line = `- [${post.title}](${postLink}): ${post.summary}\n`;
      llms = llms.replace('## Full Documentation', `${line}\n## Full Documentation`);
      fs.writeFileSync(llmsPath, llms, 'utf-8');
    }
  }
}

export async function runDailyEngine(opts: { dryRun?: boolean; rootDir?: string; apiKey?: string } = {}) {
  const rootDir = opts.rootDir || process.cwd();
  const blogDir = path.join(rootDir, 'content', 'blog');
  const existingFiles = fs.existsSync(blogDir) ? fs.readdirSync(blogDir) : [];
  const existingSlugs = new Set(existingFiles.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')));

  console.log(`[Autonomous Daily Engine] Loaded ${existingSlugs.size} existing engineering playbooks.`);
  const apiKey = opts.apiKey || process.env.GEMINI_API_KEY;
  let candidate: IBlogPost | null = null;

  if (apiKey) {
    console.log('[Autonomous Daily Engine] Contacting Gemini API for fresh playbook generation...');
    candidate = await fetchFromGemini(apiKey, existingSlugs);
  }

  if (!candidate) {
    console.log('[Autonomous Daily Engine] Utilizing curated studio backlog queue...');
    candidate = selectFromBacklog(existingSlugs);
  }

  if (!candidate) {
    console.log('[Autonomous Daily Engine] All backlog playbooks already committed and no API response.');
    return { success: false, reason: 'Queue exhausted' };
  }

  const validation = validatePlaybook(candidate, existingSlugs);
  if (!validation.valid) {
    console.error('[Autonomous Daily Engine] Validation failed:', validation.errors);
    return { success: false, errors: validation.errors };
  }

  const markdown = formatPostToMarkdown(candidate);
  if (opts.dryRun) {
    console.log(`[Autonomous Daily Engine] [DRY RUN] Validated: "${candidate.title}" (${candidate.slug})`);
    return { success: true, post: candidate, dryRun: true };
  }

  const targetFile = path.join(blogDir, `${candidate.slug}.md`);
  fs.writeFileSync(targetFile, markdown, 'utf-8');
  updateDiscoveryFiles(candidate, rootDir);
  console.log(`[Autonomous Daily Engine] Published new playbook: ${targetFile}`);
  return { success: true, post: candidate, targetFile };
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('generate-daily-insight.ts')) {
  const isDryRun = process.argv.includes('--dry-run');
  runDailyEngine({ dryRun: isDryRun }).catch((err) => {
    console.error('Fatal engine error:', err);
    process.exit(1);
  });
}
