import { describe, it, expect } from 'vitest';
import { SecurityPolicyGenerator } from '../src/services/SecurityPolicyGenerator';

describe('SecurityPolicyGenerator (Domain & Email Protection)', () => {
  const config = {
    domain: 'ai-borne.in',
    supportEmail: 'support@ai-borne.in',
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
    expect(dmarc).toContain('rua=mailto:support@ai-borne.in');
  });

  it('generates RFC 9116 security.txt content', () => {
    const secTxt = SecurityPolicyGenerator.generateSecurityTxt(config);
    expect(secTxt).toContain('Contact: mailto:support@ai-borne.in');
    expect(secTxt).toContain('Canonical: https://ai-borne.in/.well-known/security.txt');
    expect(secTxt).toContain('Expires:');
  });
});
