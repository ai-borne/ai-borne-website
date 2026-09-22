export interface ISecurityPolicyConfig {
  domain: string;
  supportEmail: string;
  allowedMailSenders?: string[];
  caaAuthorities?: string[];
  encryptionUrl?: string;
  acknowledgmentsUrl?: string;
  hiringUrl?: string;
}

export class SecurityPolicyGenerator {
  public static readonly DEFAULT_CAA_CAS: string[] = ['letsencrypt.org', 'pki.goog'];
  public static readonly DEFAULT_GOOGLE_MX: string[] = [
    'aspmx.l.google.com',
    'alt1.aspmx.l.google.com',
    'alt2.aspmx.l.google.com',
    'alt3.aspmx.l.google.com',
    'alt4.aspmx.l.google.com',
  ];


  public static generateSpfRecord(senders: string[] = ['_spf.google.com', 'spf.resend.com']): string {
    const includes = senders.map((s) => `include:${s}`).join(' ');
    return `v=spf1 ${includes} ~all`;
  }

  public static generateDmarcRecord(config: ISecurityPolicyConfig, strictReject: boolean = true): string {
    const policy = strictReject ? 'reject' : 'quarantine';
    return `v=DMARC1; p=${policy}; sp=${policy}; pct=100; rua=mailto:${config.supportEmail};`;
  }

  public static generateCaaRecords(
    cas: string[] = SecurityPolicyGenerator.DEFAULT_CAA_CAS,
    iodefEmail?: string
  ): string[] {
    const records = cas.map((ca) => `0 issue "${ca}"`);
    if (iodefEmail) {
      const email = iodefEmail.startsWith('mailto:') ? iodefEmail : `mailto:${iodefEmail}`;
      records.push(`0 iodef "${email}"`);
    }
    return records;
  }

  public static generateCaaRecord(
    cas: string[] = SecurityPolicyGenerator.DEFAULT_CAA_CAS,
    iodefEmail?: string
  ): string {
    return SecurityPolicyGenerator.generateCaaRecords(cas, iodefEmail).join('\n');
  }

  public static generateMtaStsRecord(id: string = '202601010000Z'): string {
    return `v=STSv1; id=${id};`;
  }

  public static generateMtaStsPolicy(
    mxHosts: string[] = SecurityPolicyGenerator.DEFAULT_GOOGLE_MX,
    mode: 'enforce' | 'testing' = 'enforce',
    maxAge: number = 604800
  ): string {
    return [
      'version: STSv1',
      `mode: ${mode}`,
      ...mxHosts.map((mx) => `mx: ${mx}`),
      `max_age: ${maxAge}`,
    ].join('\n');
  }

  public static generateTlsRptRecord(emailOrConfig: string | ISecurityPolicyConfig): string {
    const email = typeof emailOrConfig === 'string' ? emailOrConfig : emailOrConfig.supportEmail;
    return `v=TLSRPTv1; rua=mailto:${email};`;
  }

  public static generateSecurityTxt(config: ISecurityPolicyConfig, expiresYear: number = 2027): string {
    const encryption = config.encryptionUrl || `https://${config.domain}/.well-known/pgp-key.txt`;
    const acknowledgments = config.acknowledgmentsUrl || `https://${config.domain}/support.html`;
    const hiring = config.hiringUrl || `https://${config.domain}/support.html`;
    return [
      `Contact: mailto:${config.supportEmail}`,
      `Expires: ${expiresYear}-12-31T23:59:59.000Z`,
      `Encryption: ${encryption}`,
      `Acknowledgments: ${acknowledgments}`,
      `Preferred-Languages: en`,
      `Canonical: https://${config.domain}/.well-known/security.txt`,
      `Policy: https://${config.domain}/terms.html`,
      `Hiring: ${hiring}`,
    ].join('\n');
  }

  public static generateBimiRecord(
    logoOrConfig: string | ISecurityPolicyConfig = 'https://ai-borne.in/logo.svg',
    authorityUrl: string = ''
  ): string {
    const logo = typeof logoOrConfig === 'string'
      ? logoOrConfig
      : `https://${logoOrConfig.domain}/logo.svg`;
    const authorityPart = authorityUrl ? ` a=${authorityUrl};` : ' a=;';
    return `v=BIMI1; l=${logo};${authorityPart}`;
  }
}

