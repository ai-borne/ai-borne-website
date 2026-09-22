import { describe, it, expect } from 'vitest';
import { SecurityPolicyGenerator } from '../src/services/SecurityPolicyGenerator';

describe('SecurityPolicyGenerator (Domain & Email Protection)', () => {
  const config = {
    domain: 'ai-borne.in',
    supportEmail: 'founder@ai-borne.in',
  };

  it('generates compliant SPF TXT record including Google Workspace and Resend', () => {
    const spf = SecurityPolicyGenerator.generateSpfRecord();
    expect(spf).toContain('v=spf1');
    expect(spf).toContain('include:_spf.google.com');
    expect(spf).toContain('include:spf.resend.com');
    expect(spf).toContain('~all');
  });

  it('generates strict DMARC p=reject policy TXT record', () => {
    const dmarc = SecurityPolicyGenerator.generateDmarcRecord(config, true);
    expect(dmarc).toContain('v=DMARC1;');
    expect(dmarc).toContain('p=reject;');
    expect(dmarc).toContain('sp=reject;');
    expect(dmarc).toContain('pct=100;');
    expect(dmarc).toContain('rua=mailto:founder@ai-borne.in');
  });

  it('generates RFC 9116 security.txt content', () => {
    const secTxt = SecurityPolicyGenerator.generateSecurityTxt(config);
    expect(secTxt).toContain('Contact: mailto:founder@ai-borne.in');
    expect(secTxt).toContain('Canonical: https://ai-borne.in/.well-known/security.txt');
    expect(secTxt).toContain('Expires:');
  });

  describe('CAA (Certificate Authority Authorization) Records', () => {
    it('generates compliant CAA records restricted to Let\'s Encrypt and Google Trust Services', () => {
      const caa = SecurityPolicyGenerator.generateCaaRecord();
      expect(caa).toContain('0 issue "letsencrypt.org"');
      expect(caa).toContain('0 issue "pki.goog"');
    });

    it('generates CAA records array via generateCaaRecords', () => {
      const records = SecurityPolicyGenerator.generateCaaRecords();
      expect(records).toHaveLength(2);
      expect(records).toEqual(['0 issue "letsencrypt.org"', '0 issue "pki.goog"']);
    });

    it('includes iodef violation reporting email when specified', () => {
      const caaWithIodef = SecurityPolicyGenerator.generateCaaRecord(
        SecurityPolicyGenerator.DEFAULT_CAA_CAS,
        'security@ai-borne.in'
      );
      expect(caaWithIodef).toContain('0 iodef "mailto:security@ai-borne.in"');

      // Also verifies with mailto: prefix already present
      const caaPrefixed = SecurityPolicyGenerator.generateCaaRecord(
        ['custom-ca.org'],
        'mailto:alert@ai-borne.in'
      );
      expect(caaPrefixed).toContain('0 issue "custom-ca.org"');
      expect(caaPrefixed).toContain('0 iodef "mailto:alert@ai-borne.in"');
    });
  });

  describe('MTA-STS (SMTP Strict Transport Security) & TLS-RPT', () => {
    it('generates compliant MTA-STS DNS TXT record', () => {
      const record = SecurityPolicyGenerator.generateMtaStsRecord();
      expect(record).toContain('v=STSv1;');
      expect(record).toContain('id=202601010000Z;');

      const customRecord = SecurityPolicyGenerator.generateMtaStsRecord('2026092201');
      expect(customRecord).toBe('v=STSv1; id=2026092201;');
    });

    it('generates RFC 8461 MTA-STS policy document for Google Workspace MX', () => {
      const policy = SecurityPolicyGenerator.generateMtaStsPolicy();
      expect(policy).toContain('version: STSv1');
      expect(policy).toContain('mode: enforce');
      expect(policy).toContain('mx: aspmx.l.google.com');
      expect(policy).toContain('mx: alt1.aspmx.l.google.com');
      expect(policy).toContain('mx: alt2.aspmx.l.google.com');
      expect(policy).toContain('mx: alt3.aspmx.l.google.com');
      expect(policy).toContain('mx: alt4.aspmx.l.google.com');
      expect(policy).toContain('max_age: 604800');
    });

    it('supports testing mode and custom max_age for MTA-STS policy', () => {
      const testPolicy = SecurityPolicyGenerator.generateMtaStsPolicy(
        ['mail.ai-borne.in'],
        'testing',
        86400
      );
      expect(testPolicy).toContain('mode: testing');
      expect(testPolicy).toContain('mx: mail.ai-borne.in');
      expect(testPolicy).toContain('max_age: 86400');
    });

    it('generates RFC 8460 TLS-RPT DNS TXT record from config or email string', () => {
      const tlsRptFromConfig = SecurityPolicyGenerator.generateTlsRptRecord(config);
      expect(tlsRptFromConfig).toBe('v=TLSRPTv1; rua=mailto:founder@ai-borne.in;');

      const tlsRptFromString = SecurityPolicyGenerator.generateTlsRptRecord('reports@ai-borne.in');
      expect(tlsRptFromString).toBe('v=TLSRPTv1; rua=mailto:reports@ai-borne.in;');
    });
  });

  describe('Static .well-known Files Consistency (SSOT)', () => {
    it('verifies public/.well-known/security.txt matches SecurityPolicyGenerator', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const secTxtPath = path.resolve(__dirname, '../public/.well-known/security.txt');
      expect(fs.existsSync(secTxtPath)).toBe(true);

      const fileContent = fs.readFileSync(secTxtPath, 'utf-8').trim();
      const generated = SecurityPolicyGenerator.generateSecurityTxt(config).trim();
      expect(fileContent).toBe(generated);
    });

    it('verifies public/.well-known/mta-sts.txt matches SecurityPolicyGenerator', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const mtaStsPath = path.resolve(__dirname, '../public/.well-known/mta-sts.txt');
      expect(fs.existsSync(mtaStsPath)).toBe(true);

      const fileContent = fs.readFileSync(mtaStsPath, 'utf-8').trim();
      const generated = SecurityPolicyGenerator.generateMtaStsPolicy().trim();
      expect(fileContent).toBe(generated);
    });
  });
});

