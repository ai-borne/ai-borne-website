import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Subresource Integrity (SRI) & HTTPS Guardrails', () => {
  const rootDir = path.resolve(__dirname, '..');

  function getHtmlFiles(dirPath: string, fileList: string[] = []): string[] {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        if (item !== 'node_modules' && item !== '.git' && item !== 'dist') {
          getHtmlFiles(fullPath, fileList);
        }
      } else if (item.endsWith('.html')) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  it('guardrail: external scripts & links in HTML files must include integrity and crossorigin attributes', () => {
    const htmlFiles = getHtmlFiles(rootDir);
    expect(htmlFiles.length).toBeGreaterThan(0);

    for (const filePath of htmlFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relPath = path.relative(rootDir, filePath);

      // Match external script tags (src="https://...")
      const scriptMatches = content.match(/<script[^>]+src=["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
      for (const tag of scriptMatches) {
        expect(tag, `External script in ${relPath} missing integrity attribute: ${tag}`).toContain('integrity=');
        expect(tag, `External script in ${relPath} missing crossorigin attribute: ${tag}`).toContain('crossorigin=');
      }

      // Match external link stylesheet tags (href="https://...")
      const linkMatches = content.match(/<link[^>]+href=["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
      for (const tag of linkMatches) {
        if (tag.includes('rel="stylesheet"') || tag.includes("rel='stylesheet'")) {
          expect(tag, `External stylesheet in ${relPath} missing integrity attribute: ${tag}`).toContain('integrity=');
          expect(tag, `External stylesheet in ${relPath} missing crossorigin attribute: ${tag}`).toContain('crossorigin=');
        }
      }
    }
  });

  it('guardrail: zero unencrypted http:// links allowed in HTML or TS files', () => {
    const htmlFiles = getHtmlFiles(rootDir);
    const tsFiles: string[] = [];

    function getTsFiles(dirPath: string) {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        if (fs.statSync(fullPath).isDirectory()) {
          if (item !== 'node_modules' && item !== '.git' && item !== 'dist') {
            getTsFiles(fullPath);
          }
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          tsFiles.push(fullPath);
        }
      }
    }

    getTsFiles(path.join(rootDir, 'src'));
    getTsFiles(path.join(rootDir, 'functions'));

    const allFiles = [...htmlFiles, ...tsFiles];
    const allowedLocalHttpPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/;

    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relPath = path.relative(rootDir, filePath);

      // Find all http:// matches
      const httpMatches = content.match(/http:\/\/[^\s"'`<>]+/g) || [];
      for (const url of httpMatches) {
        // Exclude localhost/127.0.0.1 and XML namespace schemas if any
        if (allowedLocalHttpPattern.test(url) || url.includes('w3.org')) continue;
        expect.fail(`Insecure HTTP URL found in ${relPath}: ${url}`);
      }
    }
  });
});
