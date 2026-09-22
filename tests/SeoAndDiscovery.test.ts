import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { SeoMetadataService } from '../src/services/SeoMetadataService';
import { IBlogPost } from '../src/models/BlogPost';
import { SiteDataStore } from '../src/store/SiteDataStore';

describe('Phase 4: SEO, GEO & AI Search Discovery Guardrails', () => {
  const rootDir = path.resolve(__dirname, '..');

  const samplePost: IBlogPost = {
    slug: 'privacy-first-local-pdf-parsing',
    title: 'Building Privacy-First PDF Parsing on Mobile Devices',
    summary: 'How we engineered zero-cloud, on-device financial document parsing for instant execution.',
    category: 'App Engineering',
    publishedDate: '2026-08-01',
    author: 'AI-Borne Team',
    readTimeMinutes: 6,
    contentMarkdown: 'Sample markdown content',
    metricBadge: '⚡ 120ms Execution',
    difficulty: 'Advanced',
    tags: ['PDF Parsing', 'On-Device', 'Privacy', 'PayslipMax'],
  };

  describe('robots.txt Configuration', () => {
    const robotsPath = path.join(rootDir, 'public', 'robots.txt');

    it('robots.txt exists in public directory', () => {
      expect(fs.existsSync(robotsPath)).toBe(true);
    });

    it('whitelists standard search and AI crawlers', () => {
      const content = fs.readFileSync(robotsPath, 'utf-8');
      const requiredAgents = [
        'User-agent: *',
        'User-agent: Googlebot',
        'User-agent: Bingbot',
        'User-agent: GPTBot',
        'User-agent: ClaudeBot',
        'User-agent: PerplexityBot',
        'User-agent: Google-Extended',
        'User-agent: Applebot',
        'User-agent: CCBot',
      ];

      for (const agent of requiredAgents) {
        expect(content, `Missing crawler agent declaration: ${agent}`).toContain(agent);
      }
    });

    it('disallows admin routes and configures sitemap / llms discovery paths', () => {
      const content = fs.readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('Disallow: /admin/');
      expect(content).toContain('Sitemap: https://ai-borne.in/sitemap.xml');
      expect(content).toContain('Allow: /llms.txt');
      expect(content).toContain('Allow: /llms-full.txt');
    });
  });

  describe('sitemap.xml Indexing & Validation', () => {
    const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');

    it('sitemap.xml exists and is well-formed XML', () => {
      expect(fs.existsSync(sitemapPath)).toBe(true);
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      expect(content.trim().startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
      expect(content).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(content).toContain('</urlset>');
    });

    it('indexes home and all application suite pages', () => {
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      const expectedPages = [
        'https://ai-borne.in/',
        'https://ai-borne.in/apps/index.html',
        'https://ai-borne.in/apps/payslipmax.html',
        'https://ai-borne.in/apps/ssbmax.html',
        'https://ai-borne.in/apps/yoga-of-eating.html',
        'https://ai-borne.in/apps/action-station.html',
        'https://ai-borne.in/apps/defencewire.html',
        'https://ai-borne.in/apps/securemax.html',
        'https://ai-borne.in/blog/index.html',
      ];

      for (const pageUrl of expectedPages) {
        expect(content, `Missing page URL in sitemap: ${pageUrl}`).toContain(`<loc>${pageUrl}</loc>`);
      }
    });

    it('indexes all 8 core engineering playbooks', () => {
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      const expectedSlugs = [
        'privacy-first-local-pdf-parsing',
        'kotlin-multiplatform-automation-patterns',
        'solo-developer-agentic-productivity-playbook',
        'zero-trust-cicd-supply-chain-hardening',
        'real-time-edge-intelligence-architecture',
        'multi-agent-ai-scoring-engine-architecture',
        'building-infinite-canvas-spatial-workspaces',
        'enterprise-physical-security-threat-intelligence',
      ];

      for (const slug of expectedSlugs) {
        const fullUrl = `https://ai-borne.in/blog/post.html?slug=${slug}`;
        expect(content, `Missing playbook URL in sitemap: ${fullUrl}`).toContain(`<loc>${fullUrl}</loc>`);
      }
    });

    it('ensures all sitemap URLs contain priority and changefreq metadata', () => {
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      const urlBlocks = content.split('<url>').slice(1);
      expect(urlBlocks.length).toBeGreaterThanOrEqual(18);

      for (const block of urlBlocks) {
        expect(block).toContain('<priority>');
        expect(block).toContain('</priority>');
        expect(block).toContain('<changefreq>');
        expect(block).toContain('</changefreq>');
      }
    });
  });

  describe('llms.txt and llms-full.txt Standard Compliance', () => {
    const llmsPath = path.join(rootDir, 'public', 'llms.txt');
    const llmsFullPath = path.join(rootDir, 'public', 'llms-full.txt');

    it('llms.txt exists and summarizes AI-Borne ecosystem', () => {
      expect(fs.existsSync(llmsPath)).toBe(true);
      const content = fs.readFileSync(llmsPath, 'utf-8');

      expect(content).toContain('# AI-Borne Studio');
      expect(content).toContain('Sunil Pawar');
      expect(content).toContain('https://github.com/sunilpawar-git');
      expect(content).toContain('https://ai-borne.in/apps/payslipmax.html');
      expect(content).toContain('https://ai-borne.in/apps/ssbmax.html');
      expect(content).toContain('https://ai-borne.in/apps/yoga-of-eating.html');
      expect(content).toContain('https://ai-borne.in/apps/action-station.html');
      expect(content).toContain('https://ai-borne.in/apps/defencewire.html');
      expect(content).toContain('https://ai-borne.in/apps/securemax.html');
      expect(content).toContain('https://ai-borne.in/llms-full.txt');
    });

    it('llms.txt references all 8 knowledge base playbooks with direct URLs', () => {
      const content = fs.readFileSync(llmsPath, 'utf-8');
      const expectedSlugs = [
        'privacy-first-local-pdf-parsing',
        'kotlin-multiplatform-automation-patterns',
        'solo-developer-agentic-productivity-playbook',
        'zero-trust-cicd-supply-chain-hardening',
        'real-time-edge-intelligence-architecture',
        'multi-agent-ai-scoring-engine-architecture',
        'building-infinite-canvas-spatial-workspaces',
        'enterprise-physical-security-threat-intelligence',
      ];

      for (const slug of expectedSlugs) {
        expect(content).toContain(`https://ai-borne.in/blog/post.html?slug=${slug}`);
      }
    });

    it('llms-full.txt exists with exhaustive technical architecture documentation', () => {
      expect(fs.existsSync(llmsFullPath)).toBe(true);
      const content = fs.readFileSync(llmsFullPath, 'utf-8');

      expect(content.length).toBeGreaterThan(4000);
      expect(content).toContain('## 1. Studio Architecture & Engineering Philosophy');
      expect(content).toContain('## 2. Production Applications & Platforms');
      expect(content).toContain('## 3. Engineering Knowledge Base & Playbooks');
      expect(content).toContain('Rule 5 — Deterministic Guardrails');
      expect(content).toContain('ASIS CPP Seven Precis');
      expect(content).toContain('Sub-120 millisecond parsing execution');
    });
  });

  describe('SeoMetadataService JSON-LD and Meta Tag Architecture', () => {
    it('generates compliant Schema.org TechArticle JSON-LD structured data', () => {
      const schema = SeoMetadataService.generateTechArticleSchema(samplePost);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('TechArticle');
      expect(schema.headline).toBe(samplePost.title);
      expect(schema.description).toBe(samplePost.summary);
      expect(schema.author.name).toBe('Sunil Pawar');
      expect(schema.author.url).toBe('https://github.com/sunilpawar-git');
      expect(schema.publisher.name).toBe('AI-Borne');
      expect(schema.publisher.url).toBe('https://ai-borne.in');
      expect(schema.publisher.logo.url).toBe('https://ai-borne.in/assets/logo-icon-dark.png');
      expect(schema.datePublished).toBe('2026-08-01');
      expect(schema.mainEntityOfPage).toBe(
        'https://ai-borne.in/blog/post.html?slug=privacy-first-local-pdf-parsing'
      );
      expect(schema.keywords).toContain('PDF Parsing');
      expect(schema.proficiencyLevel).toBe('Advanced');
      expect(schema.articleSection).toBe('App Engineering');
    });

    it('produces full OpenGraph and Twitter card metadata definitions', () => {
      const metaDefs = SeoMetadataService.getMetaTagDefinitions(samplePost);

      const findMeta = (key: string, isProp = false) =>
        metaDefs.find((m) => (isProp ? m.property === key : m.name === key));

      expect(findMeta('description')?.content).toBe(samplePost.summary);
      expect(findMeta('og:title', true)?.content).toContain(samplePost.title);
      expect(findMeta('og:description', true)?.content).toBe(samplePost.summary);
      expect(findMeta('og:type', true)?.content).toBe('article');
      expect(findMeta('og:url', true)?.content).toBe(
        'https://ai-borne.in/blog/post.html?slug=privacy-first-local-pdf-parsing'
      );
      expect(findMeta('og:site_name', true)?.content).toBe('AI-Borne');
      expect(findMeta('twitter:card')?.content).toBe('summary_large_image');
      expect(findMeta('twitter:title')?.content).toContain(samplePost.title);
      expect(findMeta('twitter:description')?.content).toBe(samplePost.summary);
    });

    it('applyPostMetadata safely modifies document head without innerHTML sinks', () => {
      // Create lightweight mock document in node environment
      const elementsMap: Record<string, any> = {};
      const appendedChildren: any[] = [];

      const mockDoc: any = {
        title: '',
        head: {
          appendChild: (child: any) => appendedChildren.push(child),
        },
        querySelector: (selector: string) => elementsMap[selector] || null,
        getElementById: (id: string) => elementsMap[id] || null,
        createElement: (tag: string) => {
          const el: any = {
            tagName: tag.toUpperCase(),
            attributes: {} as Record<string, string>,
            setAttribute: (k: string, v: string) => {
              el.attributes[k] = v;
            },
            getAttribute: (k: string) => el.attributes[k],
            textContent: '',
          };
          return el;
        },
      };

      SeoMetadataService.applyPostMetadata(samplePost, mockDoc);

      expect(mockDoc.title).toBe(`${samplePost.title} — AI-Borne Insights`);
      expect(appendedChildren.length).toBeGreaterThan(0);

      // Verify JSON-LD script creation
      const scriptNode = appendedChildren.find(
        (c) => c.tagName === 'SCRIPT' && c.attributes.type === 'application/ld+json'
      );
      expect(scriptNode).toBeDefined();
      expect(scriptNode.id).toBe('schema-tech-article');

      const parsedSchema = JSON.parse(scriptNode.textContent);
      expect(parsedSchema['@type']).toBe('TechArticle');
      expect(parsedSchema.headline).toBe(samplePost.title);
    });

    it('verifies all live posts in SiteDataStore generate valid schema definitions', () => {
      const posts = SiteDataStore.getPosts();
      expect(posts.length).toBeGreaterThanOrEqual(2);

      for (const post of posts) {
        const schema = SeoMetadataService.generateTechArticleSchema(post);
        expect(schema.headline).toBe(post.title);
        expect(schema.mainEntityOfPage).toContain(post.slug);
        expect(schema['@context']).toBe('https://schema.org');
        expect(schema.author.name).toBe('Sunil Pawar');
      }
    });
  });
});
