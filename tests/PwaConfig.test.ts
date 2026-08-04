import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('PWA Configuration and Asset Verification', () => {
  it('vite.config.ts contains VitePWA configuration with essential metadata', () => {
    const configPath = path.resolve(__dirname, '../vite.config.ts');
    const content = fs.readFileSync(configPath, 'utf8');

    expect(content).toContain('vite-plugin-pwa');
    expect(content).toContain('VitePWA');
    expect(content).toContain("name: 'AI-Borne'");
    expect(content).toContain("short_name: 'AI-Borne'");
    expect(content).toContain("theme_color: '#0B1340'");
    expect(content).toContain("background_color: '#0B1340'");
    expect(content).toContain("display: 'standalone'");
  });

  it('PWA vector icon asset exists and is valid XML', () => {
    const iconPath = path.resolve(__dirname, '../public/icon.svg');
    expect(fs.existsSync(iconPath)).toBe(true);

    const content = fs.readFileSync(iconPath, 'utf8');
    expect(content).toContain('<svg');
    expect(content).toContain('viewBox="0 0 100 100"');
    expect(content).toContain('</svg>');
  });
});
