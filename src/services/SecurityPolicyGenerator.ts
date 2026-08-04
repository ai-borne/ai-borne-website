export interface ISecurityPolicyConfig {
  domain: string;
  supportEmail: string;
  allowedMailSenders?: string[];
}

export class SecurityPolicyGenerator {
  public static generateSpfRecord(senders: string[] = ['_spf.google.com', 'spf.resend.com']): string {
    const includes = senders.map((s) => `include:${s}`).join(' ');
    return `v=spf1 ${includes} ~all`;
  }

  public static generateDmarcRecord(config: ISecurityPolicyConfig, strictReject: boolean = true): string {
    const policy = strictReject ? 'reject' : 'quarantine';
    return `v=DMARC1; p=${policy}; sp=${policy}; pct=100; rua=mailto:${config.supportEmail};`;
  }

  public static generateSecurityTxt(config: ISecurityPolicyConfig, expiresYear: number = 2027): string {
    return [
      `Contact: mailto:${config.supportEmail}`,
      `Expires: ${expiresYear}-12-31T23:59:59.000Z`,
      `Preferred-Languages: en`,
      `Canonical: https://${config.domain}/.well-known/security.txt`,
      `Policy: https://${config.domain}/terms.html`,
    ].join('\n');
  }
}
