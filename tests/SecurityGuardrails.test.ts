import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Security Architecture & Codebase Audit Guardrails', () => {
  const rootDir = path.resolve(__dirname, '..');

  function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          getAllFiles(fullPath, arrayOfFiles);
        }
      } else {
        arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  }

  it('guardrail: strictly enforces < 300 LOC limit across all src/ and functions/ files', () => {
    const srcFiles = getAllFiles(path.join(rootDir, 'src')).filter(f => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js'));
    const fnFiles = getAllFiles(path.join(rootDir, 'functions')).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    const allCodeFiles = [...srcFiles, ...fnFiles];

    expect(allCodeFiles.length).toBeGreaterThan(0);

    for (const filePath of allCodeFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lineCount = content.split('\n').length;
      const relativePath = path.relative(rootDir, filePath);

      expect(lineCount, `File ${relativePath} exceeds 300 lines of code limit (${lineCount} lines)`).toBeLessThanOrEqual(300);
    }
  });

  it('guardrail: prevents wildcard Access-Control-Allow-Origin: * in functions/', () => {
    const fnFiles = getAllFiles(path.join(rootDir, 'functions')).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    for (const filePath of fnFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toContain("'Access-Control-Allow-Origin': '*'");
      expect(content).not.toContain('"Access-Control-Allow-Origin": "*"');
    }
  });

  it('guardrail: prevents hardcoded secrets or API key tokens in source code', () => {
    const srcFiles = getAllFiles(path.join(rootDir, 'src'));
    const fnFiles = getAllFiles(path.join(rootDir, 'functions'));
    const allFiles = [...srcFiles, ...fnFiles].filter(f => f.endsWith('.ts') || f.endsWith('.js'));

    const secretPatterns = [
      /re_[a-zA-Z0-9]{20,}/, // Resend key pattern
      /sk_live_[a-zA-Z0-9]{20,}/, // Stripe key pattern
      /AIzaSy[a-zA-Z0-9_-]{33}/, // Google API key pattern
    ];

    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const pattern of secretPatterns) {
        expect(pattern.test(content), `Potential secret match found in ${path.relative(rootDir, filePath)}`).toBe(false);
      }
    }
  });
});
