import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(__dirname, '..');

describe('Phase 2 resource and presentation guardrails', () => {
  it('keeps API response copy in the API resource module', () => {
    const apiDir = path.join(rootDir, 'functions', 'api');
    const resourcePath = path.join(apiDir, 'ApiStringResources.ts');

    expect(fs.existsSync(resourcePath)).toBe(true);
    const responseFiles = ['auth.ts', 'callback.ts', 'contact.ts', 'utils/contactSecurity.ts'];
    for (const relativePath of responseFiles) {
      const content = fs.readFileSync(path.join(apiDir, relativePath), 'utf8');
      expect(content).toContain('ApiStringResources');
    }
  });

  it('rejects literal color values in rendered UI source', () => {
    const uiDirectories = ['src/ts', 'src/views'];
    const forbiddenColor = /(?:#[0-9a-f]{3,8}\b|rgba?\(|hsla?\()/i;

    for (const directory of uiDirectories) {
      for (const fileName of fs.readdirSync(path.join(rootDir, directory))) {
        if (!fileName.endsWith('.ts')) continue;
        const filePath = path.join(rootDir, directory, fileName);
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content, `${path.relative(rootDir, filePath)} must not embed literal colors`).not.toMatch(forbiddenColor);
      }
    }
  });

  it('allows color literals only in the universal token definition', () => {
    const stylesDir = path.join(rootDir, 'src/styles');
    const forbiddenColor = /(?:#[0-9a-f]{3,8}\b|rgba?\(|hsla?\()/i;

    for (const fileName of fs.readdirSync(stylesDir)) {
      if (!fileName.endsWith('.css') || fileName === 'tokens.css') continue;
      const filePath = path.join(stylesDir, fileName);
      expect(fs.readFileSync(filePath, 'utf8'), `${fileName} must consume tokens`).not.toMatch(forbiddenColor);
    }
  });

  it('rejects inline styles in rendered UI templates', () => {
    const uiDirectories = ['src/ts', 'src/views'];

    for (const directory of uiDirectories) {
      for (const fileName of fs.readdirSync(path.join(rootDir, directory))) {
        if (!fileName.endsWith('.ts')) continue;
        const filePath = path.join(rootDir, directory, fileName);
        expect(fs.readFileSync(filePath, 'utf8'), `${path.relative(rootDir, filePath)} must use semantic CSS classes`).not.toMatch(/\bstyle\s*=/i);
      }
    }
  });

  it('keeps header and footer logo dimensions in semantic CSS', () => {
    const css = fs.readFileSync(path.join(rootDir, 'src/styles/components.css'), 'utf8');
    const header = fs.readFileSync(path.join(rootDir, 'src/views/HeaderComponent.ts'), 'utf8');
    const footer = fs.readFileSync(path.join(rootDir, 'src/views/FooterComponent.ts'), 'utf8');

    expect(header).toContain('class="logo-img logo-img-dark"');
    expect(footer).toContain('class="logo-img logo-img-dark"');
    expect(css).toMatch(/\.logo-img\s*\{[^}]*height:\s*36px;[^}]*width:\s*auto;/s);
    expect(css).toMatch(/\.footer \.logo-img\s*\{[^}]*height:\s*32px;/s);
  });

  it('keeps literal rendered text in StringResources', () => {
    const templateFiles = ['src/ts/blog.ts', 'src/ts/blogpost.ts', 'src/ts/main.ts', 'src/ts/support.ts', 'src/views/HeaderComponent.ts', 'src/views/FooterComponent.ts'];
    for (const relativePath of templateFiles) {
      const content = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
      expect(content, `${relativePath} must render copy through StringResources`).toContain('StringResources');
      expect(content, `${relativePath} must not add static accessibility copy`).not.toMatch(/aria-label="(?!\$\{)/);
    }
  });
});
